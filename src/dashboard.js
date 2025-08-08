import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// --- SafeSpace Calculator Helper Functions ---
// const calcArea = (shape, d) => {
//     if (shape === 'Rectangle') return d.length * d.width;
//     if (shape === 'Circle') return Math.PI * (d.diameter / 2) ** 2;
//     if (shape === 'Oval') return Math.PI * (d.major_axis / 2) * (d.minor_axis / 2);
//     if (shape === 'L-Shape') return (d.l1_len * d.l1_wid) + (d.l2_len * d.l2_wid);
//     return 0;
// };

const getPositionsAndTheoreticalMax = (shape, d, social_d) => {
    const positions = [];
    const spacing = social_d;
    const r_person = social_d / 2;

    if (shape === 'Rectangle') {
        const { length: l, width: w } = d;
        const nx = Math.floor(l / spacing);
        const ny = Math.floor(w / spacing);
        for (let i = 0; i < nx; i++) {
            for (let j = 0; j < ny; j++) {
                positions.push({ x: (i + 0.5) * spacing, y: (j + 0.5) * spacing });
            }
        }
    } else if (shape === 'Circle') {
        const { diameter } = d;
        const radius = diameter / 2;
        const center = { x: radius, y: radius };
        const nx = Math.floor(diameter / spacing) + 1;
        const ny = Math.floor(diameter / spacing) + 1;
        for (let i = 0; i < nx; i++) {
            for (let j = 0; j < ny; j++) {
                const pos = { x: (i + 0.5) * spacing, y: (j + 0.5) * spacing };
                const dist = Math.hypot(pos.x - center.x, pos.y - center.y);
                if (dist <= radius - r_person) {
                    positions.push(pos);
                }
            }
        }
    } else if (shape === 'Oval') {
        const { major_axis: maj, minor_axis: minn } = d;
        const h = maj / 2;
        const k = minn / 2;
        const center = { x: h, y: k };
        const nx = Math.floor(maj / spacing) + 1;
        const ny = Math.floor(minn / spacing) + 1;
        for (let i = 0; i < nx; i++) {
            for (let j = 0; j < ny; j++) {
                const pos = { x: (i + 0.5) * spacing, y: (j + 0.5) * spacing };
                const dx = pos.x - center.x;
                const dy = pos.y - center.y;
                if ((dx / h) ** 2 + (dy / k) ** 2 <= 1 - (r_person / Math.min(h, k)) ** 2) {
                    positions.push(pos);
                }
            }
        }
    } else if (shape === 'L-Shape') {
        const { l1_len, l1_wid, l2_len, l2_wid } = d;
        const nx1 = Math.floor(l1_len / spacing);
        const ny1 = Math.floor(l1_wid / spacing);
        for (let i = 0; i < nx1; i++) {
            for (let j = 0; j < ny1; j++) {
                positions.push({ x: (i + 0.5) * spacing, y: (j + 0.5) * spacing });
            }
        }
        const nx2 = Math.floor(l2_wid / spacing);
        const ny2 = Math.floor(l2_len / spacing);
        for (let i = 0; i < nx2; i++) {
            for (let j = 0; j < ny2; j++) {
                 positions.push({ x: (i + 0.5) * spacing, y: l1_wid + (j + 0.5) * spacing });
            }
        }
    }
    return { positions, fullTheoretical: positions.length };
};



// --- Spacing Diagram Component (Reliable SVG Icon Version) ---
const SpacingDiagram = ({ shape, dims, people, socialDistance, color }) => {
    // Basic validation to prevent crashes if dims are missing
    if (!dims || (!dims.length && !dims.diameter && !dims.major_axis && !dims.l1_len)) {
        return <div className="p-4 text-center">Loading diagram data...</div>;
    }

    const personRadius = socialDistance / 2;
    let viewBoxWidth = 10;
    let viewBoxHeight = 10;
    let shapeElement = null;

    try {
        if (shape === 'Rectangle') {
            viewBoxWidth = dims.length;
            viewBoxHeight = dims.width;
            shapeElement = <rect x="0" y="0" width={dims.length} height={dims.width} />;
        } else if (shape === 'Circle') {
            viewBoxWidth = dims.diameter;
            viewBoxHeight = dims.diameter;
            shapeElement = <circle cx={dims.diameter / 2} cy={dims.diameter / 2} r={dims.diameter / 2} />;
        } else if (shape === 'Oval') {
            viewBoxWidth = dims.major_axis;
            viewBoxHeight = dims.minor_axis;
            shapeElement = <ellipse cx={dims.major_axis / 2} cy={dims.minor_axis / 2} rx={dims.major_axis / 2} ry={dims.minor_axis / 2} />;
        } else if (shape === 'L-Shape') {
            viewBoxWidth = Math.max(dims.l1_len, dims.l2_wid);
            viewBoxHeight = dims.l1_wid + dims.l2_len;
            shapeElement = (
                <path d={`M0,0 H${dims.l1_len} V${dims.l1_wid} H${dims.l2_wid} V${viewBoxHeight} H0 V0 Z`} />
            );
        }
    } catch (error) {
        console.error("Error calculating diagram dimensions:", error);
        return <div>Error displaying diagram. Please check the survey inputs.</div>;
    }

    const padding = 2;

    // SVG path for a full-body person icon. This will render consistently everywhere.
    const personIconPath = "M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z";
    const iconScale = (personRadius * 1) / 512;

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Room Occupancy Visualization</h3>
            <style>
                {`
                    .room-wall { stroke: #57534e; stroke-width: 1; fill: none; } /* Darker wall outline */
                    .room-floor { fill: url(#floorPattern); stroke: #a8a29e; stroke-width: 0; }
                    .diagram-container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 1rem; border-radius: 8px; }
                    .no-people-text { font-size: 1.5px; fill: #475569; font-weight: bold; }
                `}
            </style>
            <div className="diagram-container">
                <svg viewBox={`${-padding} ${-padding} ${viewBoxWidth + (padding * 2)} ${viewBoxHeight + (padding * 2)}`} preserveAspectRatio="xMidYMid meet">
                    <defs>
                        {/* More subtle floor texture pattern */}
                        <pattern id="floorPattern" patternUnits="userSpaceOnUse" width="0.5" height="0.5">
    <rect width="0.5" height="0.5" fill="#f7f7f7" /> {/* Off-white base */}
    <circle cx="0.25" cy="0.25" r="0.03" fill="#d4d4d8" /> {/* Subtle dots */}
</pattern>
                    </defs>
                    
                    {/* Render a copy of the shape with a thick stroke to act as the wall */}
                    {React.cloneElement(shapeElement, { className: 'room-wall' })}
                    
                    {/* Render the floor shape on top */}
                    {React.cloneElement(shapeElement, { className: 'room-floor' })}
                    
                    {/* People icons */}
                    {people.map((pos, index) => (
                        <g key={index} transform={`translate(${pos.x}, ${pos.y})`}>
                            <circle cx="0" cy="0" r={personRadius} fill={color} opacity="0.6" />
                            <g transform={`scale(${iconScale}) translate(-224, -256)`}>
                                <path d={personIconPath} fill="white" />
                            </g>
                        </g>
                    ))}
                    {people.length === 0 && (
                         <text x={viewBoxWidth / 2} y={viewBoxHeight / 2} textAnchor="middle" alignmentBaseline="middle" className="no-people-text">
                            No people fit
                        </text>
                    )}
                </svg>
            </div>
        </div>
    );
};

// --- Reusable SVG Dial Component ---
const Dial = ({ value, label }) => {
    const rotation = (value / 100) * 180 - 90;
    const isReversed = label.includes("Risk of exposure");

    const getColor = (val) => {
        if (isReversed) {
            if (val > 66) return "#ef4444"; // High risk is red
            if (val > 33) return "#f59e0b"; // Medium risk is amber
            return "#22c55e"; // Low risk is green
        } else {
            if (val > 66) return "#22c55e"; // High value is green
            if (val > 33) return "#f59e0b"; // Medium value is amber
            return "#ef4444"; // Low value is red
        }
    };
    const needleColor = getColor(value);
    const lowColor = isReversed ? "#22c55e" : "#ef4444";
    const mediumColor = "#f59e0b";
    const highColor = isReversed ? "#ef4444" : "#22c55e";
    const p1 = { x: 30, y: 15.3 };
    const p2 = { x: 70, y: 15.3 };

    return (
        <div className="relative flex flex-col items-center">
            <svg viewBox="0 0 100 60" className="w-40 h-auto">
                <path d={`M 10 50 A 40 40 0 0 1 ${p1.x} ${p1.y}`} stroke={lowColor} strokeWidth="10" fill="none" />
                <path d={`M ${p1.x} ${p1.y} A 40 40 0 0 1 ${p2.x} ${p2.y}`} stroke={mediumColor} strokeWidth="10" fill="none" />
                <path d={`M ${p2.x} ${p2.y} A 40 40 0 0 1 90 50`} stroke={highColor} strokeWidth="10" fill="none" />
                <g transform={`rotate(${rotation} 50 50)`}>
                    <path d="M 50 50 L 50 15" stroke={needleColor} strokeWidth="3" />
                    <circle cx="50" cy="50" r="5" fill={needleColor} />
                </g>
                <text x="10" y="58" fontSize="8" fill="#64748b" textAnchor="middle">LOW</text>
                <text x="50" y="5.5" fontSize="8" fill="#64748b" textAnchor="middle">MEDIUM</text>
                <text x="90" y="58" fontSize="8" fill="#64748b" textAnchor="middle">HIGH</text>
            </svg>
            <span className="mt-1 text-sm font-semibold text-slate-600">{label}</span>
        </div>
    );
};


// --- Reusable Analysis Row Component ---
const AnalysisRow = ({ title, score1, score2, recommendations }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="md:col-span-2">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                </div>
                <div className="md:col-span-4 flex justify-around">
                    <Dial value={score1} label="Values" />
                    <Dial value={score2} label="Risk of exposure" />
                </div>
                <div className="md:col-span-6 flex items-center justify-end">
                     <svg className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-semibold text-slate-700 mb-2 pb-2 border-b border-slate-200">
                        <h4>Impact on risk of exposure</h4>
                        <h4>Impact on values</h4>
                        <h4>Preventive Actions</h4>
                    </div>
                    {recommendations.map((rec, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                            <p className="text-sm text-slate-600">{rec[0]}</p>
                            <p className="text-sm text-slate-600">{rec[1]}</p>
                            <p className="text-sm text-slate-600">{rec[2]}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- Reusable Total Score Bar Component ---
const TotalScoreBar = ({ label, value, colorClass }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{label}</h3>
            <div className="w-full bg-slate-200 rounded-full h-6">
                <div
                    className={`${colorClass} h-6 rounded-full transition-all duration-1000`}
                    style={{ width: `${value}%` }}
                ></div>
            </div>
        </div>
    );
};

// --- Dashboard Layout, Recommendation Data and Scoring Rules ---
const dashboardLayout = [
    { title: "Personal", questionIds: ['q4', 'q5', 'q6'] },
    { title: "Interaction", questionIds: ['q12', 'q14', 'q15', 'q16'] },
    { title: "Organizational", questionIds: ['q17', 'q18', 'q19', 'q20'] },
];

const recommendations = {
    en: {
        'q4': [
            ["If people can and are willing to isolate or take preventive measures, the risk of exposure decreases.", "Isolation may reduce quality of life by increasing anxiety and loneliness, in addition to other potential health problems. Quality of life will likely be less affected if people are comfortable and willing to be alone.", "Prepare residents by sharing the plan with them so they are prepared when a new pandemic breaks out."],
            ["If people are unable or unwilling to comply with the measures, the risk of exposure increases.", "Isolation may reduce quality of life by increasing anxiety and loneliness, in addition to other potential health problems. This will be even more pronounced if people are forced to isolate themselves when they don't want to. Autonomy will diminish, and this can lead to ethical discussions.", "Create a personalized plan for each person. Consider alternatives to stay safe around someone who can't isolate themselves."]
        ],
        'q5': [
            ["If people understand the situation and can remember the measures, they are more likely to comply, reducing the risk of exposure. They are also less likely to fear workers in personal protective equipment, allowing them to do their jobs safely and reducing the risk of exposure.", "People with good cognitive abilities understand the situation better and remember the measures better. This has a positive impact on values such as quality of life, autonomy, sense of safety, and health.", "Prepare residents by creating an action plan for a new pandemic together or sharing it with them so they are aware."],
            ["If people have difficulty understanding the situation and remembering the measures, they are less likely to comply, increasing the risk of exposure. If they are afraid of workers in personal protective equipment, this can make it difficult for them to perform their jobs safely, increasing the risk of exposure.", "People with cognitive impairments may not fully understand the situation or remember the measures. This can negatively impact values such as quality of life, autonomy, sense of safety, and health.", "Increase daily hygiene measures so they become more routine for residents. Use simple messages (such as pictograms) to increase understanding."],
            ["If people cannot understand the situation and cannot remember the measures, they are less likely to comply, increasing the risk of exposure. If they are afraid of workers in personal protective equipment, this can make it difficult for them to perform their jobs safely, increasing the risk of exposure.", "People with severe cognitive impairments are unlikely to fully understand the situation and/or remember the measures. This can negatively impact values such as quality of life, autonomy, sense of safety, and health.", "Increase daily hygiene measures so they become more routine. Display posters with simple messages (such as pictograms) to remind people of the measures. Involve familiar people (e.g., family) in the communication."]
        ],
        'q6': [
            ["Good knowledge increases the chance of good action and reduces the risk of exposure.", "Sufficient knowledge creates autonomy and a sense of security. People can assess risks themselves and act accordingly.", "Keep knowledge up to date with regular updates or refreshers (posters, flyers, courses, articles, etc.)."],
            ["A lack of knowledge increases the risk of exposure.", "A lack of knowledge reduces autonomy and prevents people from feeling safe. People cannot accurately assess risks themselves and act accordingly.", "Ensure that everyone's knowledge of infection prevention grows. This can be done, for example, through courses, flyers, posters, and articles."]
        ],
        'q12': [
            ["With recirculation, the risk of contamination will be greater because a virus can be spread within a building via the ventilation system.", "With recirculation, there will be less fresh air which could negatively impact comfort by affecting eyes, nose and throat.", "Contact the building's facility manager/HVAC supplier and ensure that recirculation is not occurring."],
            ["No recirculation ensures a constant flow of fresh air. This prevents a virus from spreading within a building through the ventilation system.", "With no recirculation, there will be more fresh air which could impact comfort positively by making people feel refreshed.", "No action is required."]
        ],
        'q14': [
            ["Good air ventilation reduces the risk of exposure. 1. Good ventilation systems improve health, sense of safety, quality of life, and quality of work.", "Good ventilation systems improve health, sense of safety, quality of life, and quality of work.", "Ensure regular maintenance. Perform regular checks to understand exactly how your system is functioning and how you can adjust it to ensure it functions properly during a pandemic."],
            ["Poor ventilation systems can reduce health, sense of safety, quality of life, and quality of work.", "Perform additional maintenance to ensure it is functioning properly. Also, perform regular checks to understand exactly how your system is functioning and how you can adjust it to ensure it functions properly during a pandemic.", "Slechte luchtventilatie verhoogt het risico op blootstelling."],
            ["Good ventilation lowers exposure risk by removing airborne viruses and bringing in fresh air.", "No ventilation system reduces health, sense of safety, quality of life, and quality of work.", "Install a ventilation system and ensure it is functioning properly. Also, perform regular checks to understand exactly how your system is functioning and how you can adjust it to ensure it functions properly during a pandemic."]
        ],
        'q15': [
            ["Good air quality reduces the risk of exposure.", "Good air quality improves health, sense of safety, quality of life, and quality of work.", "Perform regular check-ups."],
            ["Poor air quality increases the risk of exposure.", "Poor air quality can reduce health, sense of safety, quality of life, and quality of work. Poor air quality also reduces confidence in the ventilation system.", "Repair the ventilation system. Make sure it's working properly."],
            ["Poor air quality increases the risk of exposure.", "Poor air quality can reduce health, sense of safety, quality of life, and quality of work. Poor air quality also reduces confidence in the ventilation system.", "Repair the ventilation system. Make sure it's working properly."]
        ],
        'q16': [
            ["If there are no complaints, ventilation can be increased without any problems. This reduces the risk of exposure.", "Increased ventilation improves health and work quality. If residents experience no discomfort from increased ventilation, it likely won't affect values like comfort.", "Educate residents and employees about the positive effects of increased ventilation."],
            ["If there are no complaints, ventilation can be increased without any problems. This reduces the risk of exposure.", "Increased ventilation improves health and work quality. If residents experience the positive effects of ventilation, that's an additional reason to increase ventilation. This increases their sense of safety.", "No action required."],
            ["If there are many complaints, ventilation cannot be increased as much/as often as desired, which increases the risk of exposure.", "Increased ventilation improves health and work quality. However, if residents develop colds and stiff necks when ventilation is increased, their comfort level drops significantly. They're likely to complain, and it becomes a constant battle with staff, which in turn reduces work quality.", "Educate residents and employees about the positive effects of increased ventilation. Look for solutions to the negative effects of increased ventilation. For example, avoid drafts in seating areas."],
            ["If there are complaints, ventilation cannot be increased as much/as often as desired, which increases the risk of exposure. However, if positive effects are also observed, ventilation can be increased slightly, which reduces the risk of exposure.", "Increased ventilation improves health and work quality. However, if residents develop colds and stiff necks when ventilation is increased, their comfort level drops significantly. They're likely to complain, and it becomes a constant battle with staff, which in turn reduces work quality. If residents experience the positive effects of ventilation, that's an additional reason to increase ventilation. This increases their sense of safety.", "Educate residents and employees about the positive effects of increased ventilation. Look for solutions to the negative effects of increased ventilation. For example, avoid drafts in seating areas."]
        ],
        'q17': [
            ["Having sufficient PPE in stock reduces the risk of exposure.", "Having sufficient PPE increases the feeling of safety, health, and quality of work. This increases safety and familiarity. The PPE itself can reduce the quality of work because it is uncomfortable.", "Check that the PPE is not expired. If so, ensure that new items are ordered in time."],
            ["Having sufficient PPE in stock reduces the risk of exposure. However, sufficient PPE must be available for an extended period.", "Having some PPE increases the feeling of safety, health, and quality of work in the short term. This increases safety and familiarity. However, there must be enough PPE for a longer period. The PPE itself can reduce the quality of work because it is uncomfortable.", "Check that the PPE is not expired. Also, ensure that the inventory is replenished."],
            ["Not having sufficient PPE in stock increases the risk of exposure.", "The lack of sufficient PPE reduces the feeling of safety, health, and quality of work.", "Order sufficient PPE to maintain stock. Check that the PPE is not expired."]
        ],
        'q18': [
            ["Receiving all the care necessary typically means there are many contact moments. The more interactions there are, the higher the risk of exposure.", "Receiving all the care necessary is important for quality of life, autonomy and physical and mental health.", "Ensure that all the necessary care can be given in a safe manner."],
            ["Scaling back on some of the necessary care means there are less contact moments. Reducing the number of interactions also reduces the risk of exposure.", "Scaling back on some of the necessary care means scaling back on quality of life, autonomy and physical and mental health.", "Ensure that all the necessary care can be given in a safe manner. Try to find safe alternatives instead of fully stopping a certain activity."],
            ["Scaling back on most of the care means there are less contact moments. Reducing the number of interactions also reduces the risk of exposure.", "Scaling back on most of the care means scaling back on quality of life, autonomy and physical and mental health.", "Ensure that all the necessary care can be given in a safe manner. Try to find safe alternatives instead of fully stopping a certain activity."]
        ],
        'q19': [
            ["Increasing the measures without increasing the number of people in the building is positive in terms of the risk of rejection.", "In principle, there is no impact on values. Be aware that workload is not given much consideration. This could negatively impact the quality of work.", "Prepare systems and personnel to understand how tasks can be expanded if necessary."],
            ["Being able to increase capacity allows for other safe ways of working (e.g., cohorts), which reduces the risk of rejection. On the other hand, there are now more people in the building, which can lead to more interactions, increasing the risk of rejection.", "The ability to increase capacity when necessary enhances values such as quality of work, comfort, quality of life, health, and care.", "Prepare systems and personnel to understand how capacity can be expanded if necessary."],
            ["Not being able to increase capacity leads to pushing boundaries, overwork, and rushing, which entails the risk of errors and/or errors, thus increasing the risk of rejection.", "There is no possibility of increasing capacity if necessary values such as quality of work, comfort, quality of life, health, and care are affected.", "Ensure additional capacity, allowing for increased capacity when needed. Prepare systems and personnel to understand how capacity can be expanded if necessary."]
        ],
        'q20': [
            ["Being able to enhance safety measures reduces the risk of exposure.", "Being able to invest in measures (e.g., PPE, ventilation, additional staff) increases work quality, comfort, and a sense of safety and health.", "No action required. Ensure that budget remains available to invest in safety measures when needed."],
            ["Being able to enhance even a few safety measures already reduces the risk of exposure somewhat. Ideally, you should implement all measures.", "Being able to invest in measures (e.g., PPE, ventilation, additional staff) increases work quality, comfort, and a sense of safety and health. However, not being able to invest in everything puts these under pressure.", "Try to increase the budget to invest in safety measures when needed. Grants may be available to help with this."],
            ["Not enhancing safety measures increases the risk of exposure.", "If measures (e.g., PPE, ventilation, additional staff) cannot be invested in, work quality, comfort, and a sense of safety and health will deteriorate.", "Look for ways to increase or save the budget to invest in safety measures when needed. Grants may be available to help with this."]
        ]
    },
    nl: {
        'q4': [
            ["Als mensen kunnen en willen isoleren of preventieve maatregelen nemen, neemt het risico op blootstelling af.", "Isolatie zal mogelijk de kwaliteit van leven verminderen door angst en eenzaamheid te vergroten, naast mogelijke andere gezondheidsproblemen. De kwaliteit van leven zal waarschijnlijk minder worden beïnvloed als mensen prima alleen kunnen en willen zijn.", "Bereid bewoners voor door het plan met ze te delen, zodat ze voorbereid zijn wanneer een nieuwe pandemie uitbreekt."],
            ["Als mensen zich niet aan de maatregelen kunnen of willen houden, neemt het risico op blootstelling toe.", "Isolatie zal mogelijk de kwaliteit van leven verminderen door angst en eenzaamheid te vergroten, naast mogelijke andere gezondheidsproblemen. Dit zal sterker zijn als mensen zich moeten isoleren wanneer ze dat niet willen. De autonomie zal afnemen en dit kan leiden tot ethische discussies.", "Maak een persoonlijk plan per persoon. Bedenk alternatieven om veilig te blijven in de buurt van iemand die zich niet kan isoleren."]
        ],
        'q5': [
            ["Als mensen de situatie begrijpen en de maatregelen kunnen onthouden, is de kans groter dat ze zich eraan houden, waardoor het risico op blootstelling afneemt. Ze zijn waarschijnlijk ook minder bang voor werknemers in persoonlijke beschermingsmiddelen, waardoor ze hun werk veilig kunnen doen en het risico op blootstelling afneemt.", "Mensen met een hoog cognitief niveau begrijpen de situatie beter en onthouden de maatregelen beter. Dit is positief voor waarden zoals kwaliteit van leven, autonomie, gevoel van veiligheid en gezondheid.", "Bereid bewoners voor door samen een actieplan voor een nieuwe pandemie te maken of het met hen te delen, zodat ze hiervan op de hoogte zijn."],
            ["Als mensen moeite hebben met het begrijpen van de situatie en het onthouden van de maatregelen, is de kans klein dat ze zich eraan houden, waardoor het risico op blootstelling toeneemt. Als ze bang zijn voor werknemers in persoonlijke beschermingsmiddelen, kan dit het voor hen moeilijk maken om hun werk veilig uit te voeren, waardoor het risico op blootstelling toeneemt.", "Mensen met cognitieve beperkingen begrijpen de situatie mogelijk niet volledig of onthouden de maatregelen niet. Dit kan een negatieve invloed hebben op waarden zoals kwaliteit van leven, autonomie, gevoel van veiligheid en gezondheid.", "Verhoog de dagelijkse hygiënemaatregelen, zodat het voor bewoners routinematiger wordt. Gebruik simpele berichtgeving (zoals pictogrammen) om het begrip te vergroten."],
            ["Als mensen de situatie niet kunnen begrijpen en de maatregelen niet kunnen onthouden, is de kans klein dat ze zich eraan houden, waardoor het risico op blootstelling toeneemt. Als ze bang zijn voor werknemers in persoonlijke beschermingsmiddelen, kan dit het voor hen moeilijk maken om hun werk veilig uit te voeren, waardoor het risico op blootstelling toeneemt.", "Mensen met ernstige cognitieve beperkingen begrijpen de situatie waarschijnlijk niet volledig en/of onthouden de maatregelen niet. Dit kan een negatieve invloed hebben op waarden zoals kwaliteit van leven, autonomie, gevoel van veiligheid en gezondheid.", "Verhoog de dagelijkse hygiënemaatregelen, zodat het routinematiger wordt. Hang posters op met simpele berichtgeving (zoals pictogrammen) om mensen aan de maatregelen te herinneren. Betrek bekende personen bij de communicatie (bijv. familie)."]
        ],
        'q6': [
            ["Goede kennis verhoogt de kans op goed handelen en verlaagt het risico op blootstelling.", "Genoeg kennis zorgt voor autonomie en een gevoel van veiligheid. Mensen kunnen zelf gevaren inschatten en daar naar handelen.", "Houd de kennis op de hoogte met regelmatige updates of opfrissers (posters, flyers, cursussen, artikelen, etc.)"],
            ["Een gebrek aan kennis verhoogt het risico op blootstelling.", "Een gebrek aan kennis zorgt voor minder autonomie en geen gevoel van veiligheid. Mensen kunnen zelf de gevaren niet goed inschatten en daar ook niet naar handelen.", "Zorg dat de kennis over infectiepreventie bij iedereen groeit. Dit kan bijvoorbeeld door middel van cursussen, flyers, posters, artikelen."]
        ],
        'q12': [
            ["Bij recirculatie zal risico op besmetting groter zijn omdat een virus binnen een gebouw via het ventilatiesysteem verspreid kan worden.", "Met recirculatie is er minder frisse lucht, wat het comfort negatief kan beïnvloeden door de ogen, neus en keel te irriteren.", "Neem contact op met de facility manager/HVAC-leverancier van het gebouw en zorg ervoor dat er geen recirculatie plaatsvindt."],
            ["Geen recirculatie zorgt ervoor dat altijd de toestroom van lucht altijd verse lucht is. Zo zal een virus binnen een gebouw niet via het ventilatiesysteem verspreid kunnen worden.", "Zonder recirculatie is er meer frisse lucht, wat het comfort positief kan beïnvloeden doordat mensen zich frisser voelen.", "Geen actie vereist."]
        ],
        'q14': [
            ["Goede luchtventilatie vermindert het risico op blootstelling.", "Goede ventilatiesystemen verhogen gezondheid, gevoel van veiligheid, kwaliteit van leven en kwaliteit van het werk.", "Zorg voor regelmatig onderhoud. Voer regelmatig controles uit om precies te weten hoe uw systeem functioneert en hoe u het kunt aanpassen om het tijdens een pandemie goed te laten functioneren."],
            ["Slechte luchtventilatie verhoogt het risico op blootstelling.", "Slechte ventilatiesystemen kunnen gezondheid, gevoel van veiligheid, kwaliteit van leven en kwaliteit van het werk verminderen.", "Voer extra onderhoud uit om ervoor te zorgen dat het goed functioneert. Voer daarnaast regelmatig controles uit om precies te weten hoe uw systeem functioneert en hoe u het kunt aanpassen om het tijdens een pandemie goed te laten functioneren."],
            ["Geen luchtventilatie verhoogt het risico op blootstelling.", "Geen ventilatiesystemen vermindert gezondheid, gevoel van veiligheid, kwaliteit van leven en kwaliteit van het werk.", "Installeer een ventilatiesysteem en zorg ervoor dat het goed functioneert. Voer daarnaast regelmatig controles uit om precies te weten hoe uw systeem functioneert en hoe u het kunt aanpassen om het tijdens een pandemie goed te laten functioneren."]
        ],
        'q15': [
            ["Goede luchtkwaliteit vermindert het risico op blootstelling.", "Goede luchtkwaliteit verhoogt gezondheid, gevoel van veiligheid, kwaliteit van leven en kwaliteit van het werk.", "Voer regelmatig controles uit."],
            ["Slechte luchtkwaliteit vergroot het risico op blootstelling.", "Slechte luchtkwaliteit kan gezondheid, gevoel van veiligheid, kwaliteit van leven en kwaliteit van het werk verminderen. Een slechte luchtkwaliteit vermindert ook het vertrouwen in het ventilatiesysteem.", "Repareer het ventilatiesysteem. Zorg ervoor dat het goed werkt."],
            ["Slechte luchtkwaliteit verhoogt het risico op blootstelling.", "Slechte luchtkwaliteit kan gezondheid, gevoel van veiligheid, kwaliteit van leven en kwaliteit van het werk verminderen. Een slechte luchtkwaliteit vermindert ook het vertrouwen in het ventilatiesysteem.", "Repareer het ventilatiesysteem. Zorg ervoor dat het goed werkt."]
        ],
        'q16': [
            ["Als er geen klachten zijn, kan de ventilatie zonder problemen worden verhoogd. Dit vermindert het risico op blootstelling.", "Meer ventilatie verbetert de gezondheid en kwaliteit van het werk. Als bewoners geen last hebben van meer ventilatie, heeft dit waarschijnlijk geen invloed op waarden zoals comfort.", "Informeer bewoners en medewerkers over de positieve effecten van verhoogde ventilatie."],
            ["Als er geen klachten zijn, kan de ventilatie zonder problemen worden verhoogd. Dit vermindert het risico op blootstelling.", "Meer ventilatie verbetert de gezondheid en kwaliteit van het werk. Als bewoners de positieve effecten van ventilatie ervaren, is dat een extra reden om de ventilatie te verhogen. Dit verhoogt het gevoel van veiligheid.", "Geen actie vereist."],
            ["Als er veel klachten zijn, kan de ventilatie niet zo veel/vaak worden verhoogd als gewenst, wat het risico op blootstelling verhoogt.", "Meer ventilatie verbetert de gezondheid en kwaliteit van het werk. Als bewoners echter last krijgen van verkoudheid en een stijve nek wanneer de ventilatie wordt verhoogd, daalt hun comfortniveau aanzienlijk. Ze zullen waarschijnlijk klagen en het wordt elke keer een 'gevecht' met de medewerkers, wat kwaliteit van werk weer verlaagt.", "Informeer bewoners en medewerkers over de positieve effecten van verhoogde ventilatie. Zoek naar oplossingen voor de negatieve effecten van verhoogde ventilatie. Vermijd bijvoorbeeld tocht in zitgedeeltes."],
            ["Als er klachten zijn, kan de ventilatie niet zo veel/vaak worden verhoogd als gewenst, wat het risico op blootstelling verhoogt. Als echter ook de positieve effecten worden opgemerkt, kan de ventilatie iets worden verhoogd, wat het risico op blootstelling verlaagt.", "Meer ventilatie verbetert de gezondheid en kwaliteit van het werk. Als bewoners echter last krijgen van verkoudheid en een stijve nek wanneer de ventilatie wordt verhoogd, daalt hun comfortniveau aanzienlijk. Ze zullen waarschijnlijk klagen en het wordt elke keer een 'gevecht' met de medewerkers, wat kwaliteit van werk weer verlaagt. Als bewoners echter de positieve effecten van ventilatie ervaren, is dat een extra reden om de ventilatie te verhogen. Dit verhoogt het gevoel van veiligheid.", "Informeer bewoners en medewerkers over de positieve effecten van verhoogde ventilatie. Zoek naar oplossingen voor de negatieve effecten van verhoogde ventilatie. Vermijd bijvoorbeeld tocht in zitgedeeltes."]
        ],
        'q17': [
            ["Voldoende PBM op voorraad hebben vermindert het risico op blootstelling.", "Het hebben van voldoende PBM verhoogt het gevoel van veiligheid, gezondheid en kwaliteit van werk. Dit verhoogt veiligheid en herkenbaarheid. De PBM zelf kan kwaliteit van werk verminderen omdat het niet comfortabel is.", "Controleer of de PBM niet over de datum zijn. Zo ja, zorg er dan voor dat er op tijd nieuwe artikelen worden bestelt."],
            ["Voldoende PBM op voorraad hebben vermindert het risico op blootstelling. Er moeten echter voldoende PBM's zijn voor een langere periode.", "Het hebben van wat PBM verhoogt het gevoel van veiligheid, gezondheid en kwaliteit van werk op de korte termijn. Dit verhoogt veiligheid en herkenbaarheid. Er moet echter genoeg zijn voor een langere periode. De PBM zelf kan kwaliteit van werk verminderen omdat het niet comfortabel is.", "Controleer of de PBM niet over de datum zijn. Zorg er ook voor dat de voorraad aangevuld wordt."],
            ["Niet voldoende PBM op voorraad hebben verhoogt het risico op blootstelling.", "Het ontbreken van voldoende PBM verlaagt het gevoel van veiligheid, gezondheid en kwaliteit van werk.", "Bestel voldoende PBM om de voorraad op peil te houden. Controleer of de PBM niet over de datum zijn."]
        ],
        'q18': [
            ["Het ontvangen van alle noodzakelijke zorg betekent doorgaans dat er veel contactmomenten zijn. Hoe meer interacties er zijn, hoe groter het risico op blootstelling.", "Het ontvangen van alle noodzakelijke zorg is belangrijk voor de kwaliteit van leven, autonomie en fysieke en mentale gezondheid.", "Zorg ervoor dat alle noodzakelijke zorg op een veilige manier kan worden verleend."],
            ["Het terugschroeven van een deel van de noodzakelijke zorg betekent dat er minder contactmomenten zijn. Het verminderen van het aantal interacties vermindert ook het risico op blootstelling.", "Het terugschroeven van een deel van de noodzakelijke zorg betekent ook het terugschroeven van de kwaliteit van leven, autonomie en fysieke en mentale gezondheid.", "Zorg ervoor dat alle noodzakelijke zorg op een veilige manier kan worden verleend. Probeer veilige alternatieven te vinden in plaats van een bepaalde activiteit volledig te staken."],
            ["Het terugschroeven van het grootste deel van de zorg betekent dat er minder contactmomenten zijn. Het verminderen van het aantal interacties vermindert ook het risico op blootstelling.", "Het terugschroeven van het grootste deel van de zorg betekent ook het terugschroeven van de kwaliteit van leven, autonomie en fysieke en mentale gezondheid.", "Zorg ervoor dat alle noodzakelijke zorg op een veilige manier kan worden verleend. Probeer veilige alternatieven te vinden in plaats van een bepaalde activiteit volledig te staken."]
        ],
        'q19': [
            ["Het verhogen van de maatregelen zonder het aantal mensen in het gebouw te verhogen, is positief wat betreft het risico op blootstelling.", "In principe geen impact op waarden. Wees alert dat dat de werkdruk niet te veel verhoogd wordt. Dit zou kwaliteit van werk negatief kunnen beïnvloeden.", "Bereid systemen en personeel voor zodat bekend is hoe taken, indien nodig, kunnen worden uitgebreid."],
            ["Het kunnen verhogen van de capaciteit maakt andere veilige manieren van werken mogelijk (bijvoorbeeld cohorten) wat risico op blootstelling vermindert. Aan de andere kant zijn er nu meer mensen in het gebouw waardoor er meer interacties kunnen ontstaan, wat het risico op blootstelling verhoogt.", "Het vermogen om de capaciteit te verhogen indien nodig verhoogt waarden zoals kwaliteit van werk, comfort, kwaliteit van leven, gezondheid en zorg.", "Bereid systemen en personeel voor zodat bekend is hoe de capaciteit, indien nodig, kan worden uitgebreid."],
            ["Het niet kunnen verhogen van de capaciteit leidt tot het verleggen van grenzen, overwerk en haasten, wat risico's op fouten en/of naleving met zich meebrengt en dus het risico op blootstelling verhoogt.", "Geen mogelijkheid hebben om de capaciteit te verhogen indien nodig verlaagt waarden zoals kwaliteit van werk, comfort, kwaliteit van leven, gezondheid en zorg.", "Zorg voor meer capaciteit, zodat er ruimte is om de capaciteit te verhogen wanneer dat nodig is. Bereid systemen en personeel voor zodat bekend is hoe de capaciteit, indien nodig, kan worden uitgebreid."]
        ],
        'q20': [
            ["Het kunnen verhogen van de veiligheidsmaatregelen verlaagt het risico op blootstelling.", "Het kunnen investeren in maatregelen (bijv. PBM's, ventilatie, extra medewerkers) verhoogt kwaliteit van werk, comfort, gevoel van veiligheid en gezondheid.", "Geen actie vereist. Zorg ervoor dat er budget beschikbaar blijft om te investeren in veiligheidsmaatregelen wanneer nodig."],
            ["Het kunnen verhogen van een paar veiligheidsmaatregelen verlaagt het risico op blootstelling al enigszins. Liefst pas je alle maatregelen toe.", "Het kunnen investeren in maatregelen (bijv. PBM's, ventilatie, extra medewerkers) verhoogt kwaliteit van werk, comfort, gevoel van veiligheid en gezondheid. Maar het niet kunnen investeren in alles zet dit onder druk.", "Probeer het budget te verhogen om te kunnen investeren in veiligheidsmaatregelen wanneer nodig. Mogelijk zijn er subsidies beschikbaar om hierbij te helpen."],
            ["Het niet verhogen van de veiligheidsmaatregelen brengt een verhoogd risico op blootstelling met zich mee.", "Als er niet geïnvesteerd kan worden in maatregelen (bijvoorbeeld PBM, ventilatie, extra personeel) gaan kwaliteit van werk, comfort, gevoel van veiligheid en gezondheid achteruit.", "Zoek naar manieren om het budget te verhogen of te besparen om te kunnen investeren in veiligheidsmaatregelen wanneer nodig. Mogelijk zijn er subsidies beschikbaar om hierbij te helpen."]
        ]
    }
};

// --- Scoring Rules ---
const scoringRules = {
    'q4': { values: [5, 1], risk: [1, 5] },
    'q5': { values: [5, 3, 1], risk: [1, 3, 5] },
    'q6': { values: [5, 1], risk: [1, 5] },
    'q12': { values: [1, 5], risk: [5, 1] },
    'q14': { values: [5, 3, 1], risk: [1, 3, 5] },
    'q15': { values: [5, 3, 1], risk: [1, 3, 5] },
    'q16': { values: [4, 5, 1, 3], risk: [1, 1, 5, 3] },
    'q17': { values: [5, 3, 1], risk: [1, 3, 5] },
    'q18': { values: [5, 2, 1], risk: [5, 3, 1] },
    'q19': { values: [5, 3, 1], risk: [1, 3, 5] },
    'q20': { values: [5, 3, 1], risk: [1, 3, 5] }
};


// --- Main Dashboard Component ---
export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    const { answers, content } = location.state || { answers: {}, content: {} };

    const language = content.pageSubtitle === 'Zorghuis Actieplan' ? 'nl' : 'en';
    const langRecommendations = useMemo(() => recommendations[language] || {}, [language]);

    const handleRestart = () => navigate('/');

    const safeSpaceData = useMemo(() => {
        const shapeMap = { 0: 'Rectangle', 1: 'Circle', 2: 'Oval', 3: 'L-Shape' };
        const shape = shapeMap[answers['q8']] || 'Rectangle';
        const area = answers['q7'] || 50;
        let dims = {};

        switch (shape) {
            case 'Circle':
                const radius = Math.sqrt(area / Math.PI);
                dims = { diameter: radius * 2 };
                break;
            case 'Oval':
                 const minor_axis = Math.sqrt(area / (2 * Math.PI));
                 dims = { major_axis: 2 * minor_axis, minor_axis: minor_axis };
                 break;
            case 'L-Shape':
                 const legArea = area / 2;
                 const legWidth = Math.sqrt(legArea / 2);
                 dims = { l1_len: legWidth * 2, l1_wid: legWidth, l2_len: legWidth * 2, l2_wid: legWidth };
                 break;
            default:
                 const side_length = Math.sqrt(area);
                 dims = { length: side_length, width: side_length };
        }

        const socialDistance = answers['q9'] || 1.5;
        const windowsDoors = answers['q10'] || 2;
        const ventGrates = answers['q11'] || 1;
        const airRecirc = (answers['q12'] === 0);
        const usablePercent = 75;

        const { positions, fullTheoretical } = getPositionsAndTheoreticalMax(shape, dims, socialDistance);
        const theoretical = Math.floor(fullTheoretical * usablePercent / 100);

        const ventScore = Math.min((windowsDoors + ventGrates) / 20, 1);
        const recircPen = airRecirc ? 0.2 : 0;
        const riskPct = (1 - ventScore) * 50 + recircPen * 50;
        const adjustedMax = Math.floor(theoretical * (1 - riskPct / 100 * 0.3));

        let color = 'green';
        if (riskPct >= 66) color = 'red';
        else if (riskPct >= 33) color = 'orange';

        const shuffledPositions = [...positions].sort(() => 0.5 - Math.random());
        const peopleToDraw = shuffledPositions.slice(0, Math.min(adjustedMax, positions.length));

        return { shape, dims, people: peopleToDraw, socialDistance, color };
    }, [answers]);

    const analysisData = useMemo(() => {
        const normalizeScore = (score) => (score / 5) * 100;
        const getScore = (type, qId, aIdx) => {
            if (scoringRules[qId] && scoringRules[qId][type] && aIdx < scoringRules[qId][type].length) {
                return scoringRules[qId][type][aIdx];
            }
            return 0;
        };

        return dashboardLayout.map(row => {
            let totalValueScore = 0;
            let totalRiskScore = 0;
            let recommendations = [];

            row.questionIds.forEach(id => {
                const answerIndex = answers[id];
                if (answerIndex !== undefined) {
                    totalValueScore += getScore('values', id, answerIndex);
                    totalRiskScore += getScore('risk', id, answerIndex);
                    if (langRecommendations[id] && langRecommendations[id][answerIndex]) {
                        recommendations.push(langRecommendations[id][answerIndex]);
                    }
                }
            });

            const avgValueScore = row.questionIds.length > 0 ? totalValueScore / row.questionIds.length : 0;
            const avgRiskScore = row.questionIds.length > 0 ? totalRiskScore / row.questionIds.length : 0;

            return {
                title: row.title,
                score1: normalizeScore(avgValueScore),
                score2: normalizeScore(avgRiskScore),
                recommendations: recommendations
            };
        });
    }, [answers, langRecommendations]);

    const { totalScoreValues, totalScoreExposure } = useMemo(() => {
        if (analysisData.length === 0) return { totalScoreValues: 0, totalScoreExposure: 0 };
        
        const totalValuesRaw = analysisData.reduce((acc, item) => acc + item.score1, 0) / analysisData.length;
        const totalExposureRaw = analysisData.reduce((acc, item) => acc + item.score2, 0) / analysisData.length;

        return { totalScoreValues: totalValuesRaw, totalScoreExposure: totalExposureRaw };
    }, [analysisData]);


    if (!Object.keys(answers).length || !Object.keys(content).length) {
        return (
             <div className="min-h-screen bg-slate-100 text-slate-800 flex justify-center items-center p-4">
                 <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-indigo-700">No summary to display.</h2>
                    <p className="text-lg text-slate-600 mb-6">Please start the action plan first.</p>
                    <button onClick={handleRestart} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg">
                        Go to Start
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
             <div className="max-w-9xl mx-auto">
                <div className="mb-12">
                    <SpacingDiagram {...safeSpaceData} />
                </div>

                <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">Analysis per Category</h1>

                <div className="space-y-6 mb-12">
                    {analysisData.map(data => (
                        <AnalysisRow
                            key={data.title}
                            title={data.title}
                            score1={data.score1}
                            score2={data.score2}
                            recommendations={data.recommendations}
                        />
                    ))}
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">Total Scores of Analysis</h2>
                    <TotalScoreBar label="Total Score of Protection against Exposure" value={totalScoreExposure} colorClass="bg-green-500" />
                    <TotalScoreBar label="Total Score of Values" value={totalScoreValues} colorClass="bg-blue-500" />
                </div>

                <div className="text-center mt-12">
                    <button onClick={handleRestart} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-md">
                        {content.startOver || "Start Over"}
                    </button>
                </div>
            </div>
        </div>
    );
}