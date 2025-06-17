import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// --- Reusable SVG Dial Component ---
const Dial = ({ value, label }) => {
    // Convert a 0-100 value to a -90 to 90 degree rotation
    const rotation = (value / 100) * 180 - 90;

    // Determine if the color scheme should be reversed based on the label
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
    
    // Define arc colors based on the normal or reversed scheme
    const lowColor = isReversed ? "#22c55e" : "#ef4444";
    const mediumColor = "#f59e0b";
    const highColor = isReversed ? "#ef4444" : "#22c55e";

    // Define points for the 3 segments of the arc
    const p1 = { x: 30, y: 15.3 }; // Point at 120 degrees
    const p2 = { x: 70, y: 15.3 }; // Point at 60 degrees

    return (
        <div className="relative flex flex-col items-center">
            <svg viewBox="0 0 100 60" className="w-40 h-auto">
                {/* Background Arcs - using distinct paths for each color */}
                <path d={`M 10 50 A 40 40 0 0 1 ${p1.x} ${p1.y}`} stroke={lowColor} strokeWidth="10" fill="none" />
                <path d={`M ${p1.x} ${p1.y} A 40 40 0 0 1 ${p2.x} ${p2.y}`} stroke={mediumColor} strokeWidth="10" fill="none" />
                <path d={`M ${p2.x} ${p2.y} A 40 40 0 0 1 90 50`} stroke={highColor} strokeWidth="10" fill="none" />
                
                {/* Needle */}
                <g transform={`rotate(${rotation} 50 50)`}>
                    <path d="M 50 50 L 50 15" stroke={needleColor} strokeWidth="3" />
                    <circle cx="50" cy="50" r="5" fill={needleColor} />
                </g>
                
                {/* Labels */}
                <text x="10" y="58" fontSize="8" fill="#64748b" textAnchor="middle">LOW</text>
                <text x="50" y="5.5" fontSize="8" fill="#64748b" textAnchor="middle">MEDIUM</text>
                <text x="90" y="58" fontSize="8" fill="#64748b" textAnchor="middle">HIGH</text>
            </svg>
            <span className="mt-1 text-sm font-semibold text-slate-600">{label}</span>
        </div>
    );
};


// --- Reusable Analysis Row Component ---
const AnalysisRow = ({ title, score1, score2, texts }) => {
    // Using a 12-column grid for more control over layout
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-4 bg-white rounded-lg shadow">
            {/* Title column */}
            <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            </div>
            {/* Dials column - made wider to prevent overlap */}
            <div className="md:col-span-4 flex justify-around">
                <Dial value={score1} label="Values" />
                <Dial value={score2} label="Risk of exposure" />
            </div>
            {/* Recommendations columns - made narrower */}
            <div className="md:col-span-6 grid grid-cols-3 gap-4">
                <div>
                    <h4 className="font-semibold text-slate-700 mb-1">Risk of exposure</h4>
                    <p className="text-sm text-slate-600">{texts[0]}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-700 mb-1">Values</h4>
                    <p className="text-sm text-slate-600">{texts[1]}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-700 mb-1">Preventive Actions</h4>
                    <p className="text-sm text-slate-600">{texts[2]}</p>
                </div>
            </div>
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


// --- Recommendation Data (as before) ---
const recommendations = {
    'self_isolate' : [
        ["If people can and will self-isolate or take preventive measures, the risk of exposure decreases", "Isolation will reduce quality of life by increasing anxiety and loneliness in addition to possible health struggles. Quality of life will likely not be impacted as much if people can and like to be on their own.", "Prepare residents with the plan so they are prepared when a new pandemic hits. "],
        ["If people can or will not stick to the measures, risk of exposure increases" , "Isolation will reduce quality of life by increasing anxiety and loneliness in addition to possible health struggles. This will be stronger if people need to self-isolate when they do not want to. Autonomy will be reduced and can lead to ethical discussions.", "Prepare a personalised plan and alternatives to stay safe around a person who cannot self-isolate."],
        ["","","Achieve to find out per resident so that it is known when a new pandemic hits."],
        ["","",""]
    ],
    'cognitive_level' : [
        ["If people understand the situation and can remember the measures, they are more likely to stick to them, reducing risk of exposure. They are likely less frightened by employees in protective equipment as well, allowing them to do their work safely and reducing risk of exposure.", "People with high cognitive levels are more likely to understand the situation and remember the measures. This is positive for values such as quality of life, autonomy, feelings of safety and health.", "Prepare residents by sharing the plan of action with them for when a new pandemic hits so it is known." ],
        ["If people have dificulty understanding the situation and remembering the measures, they are not likely to stick to them, increasing risk of exposure. If they are frightened by employees in protective equipment, this would make it difficult for them to do their work safely, increasing risk of exposure.","People with cognitive difficulties might not fully understand the situation or remember the measures. This can negatively impact values such as quality of life, autonomy, feelings of safety and health.", "Increase sanitary measures on a daily basis so it becomes more routine for residents. Use simplified messaging (pictograms) to enhance understanding."],
        ["If people cannot understand the situation and remember the measures, they are not likely to stick to them, increasing risk of exposure. If they are frightened by employees in protective equipment, this would make it difficult for them to do their work safely, increasing risk of exposure.", "People with large cognitive impairments will probably not fully understand the situation or remember the measures. This can negatively impact values such as quality of life, autonomy, feelings of safety and health.", "Increase sanitary measures on a daily basis so it becomes more routine. Put up posters with simplified messaging (pictograms) to remind people of the measures. Include familiar persons in communication (e.g. family)."],
        ["","","Achieve to find out per resident so that it is known when a new pandemic hits."]
    ],
    'ventilation_status': [
        ["Good air ventilation decreases the risk of exposure.", "Good air ventilation systems increase health, sense of safety, quality of life and quality of work.", "Keep regular maintenace. Do regular check-ups."],
        ["Poor air ventilation increases the risk of exposure.", "Poor air ventilation systems can decrease health, sense of safety, quality of life and quality of work.", "Increase maintenance to make sure it is functioning well. "],
        ["No air ventilation increases the risk of exposure.", "No air ventilation system decreases health, sense of safety, quality of life and quality of work.", "Install a ventilation system and make sure it is functioning well."],
        ["", "", "Achieve to find out so that it is known when a new pandemic hits."]
    ],
    'air_quality': [
        ["Good air quality decreases the risk of exposure.", "Good air quality increases health, sense of safety, quality of life and quality of work.", "Do regular check-ups. Do regular ventilation check-ups to know exactly how your system is functioning and how it can be adapted  to function during a pandemic. "],
        ["Questionable air quality increases the risk of exposure.", "Poor air quality can decrease health, sense of safety, quality of life and quality of work.", "Fix ventilation system. Make sure it is functioning well. Do regular ventilation check-ups to know exactly how your system is functioning and how it can be adapted  to function during a pandemic. "],
        ["Poor air quality increases the risk of exposure.", "Poor air quality can decrease health, sense of safety, quality of life and quality of work.", "Fix ventilation system. Make sure it is functioning well. Do regular ventilation check-ups to know exactly how your system is functioning and how it can be adapted  to function during a pandemic. "],
        ["", "", "Achieve to find out so that it is known when a new pandemic hits."]
    ],
    'ventilation_effects': [
        ["If there are no complaints, ventilation can be increased with no problem. This reduces risk of exposure.", "Increased ventilation will improve health and quality of work. If residents do not notice increased ventilation, this will likely not affect values such as comfort. ", "Inform the residents and employees of the positive effects of increased ventilation. "],
        ["If there are no complaints, ventilation can be increased with no problem. This reduces risk of exposure.", "Increased ventilation will improve health and quality of work. If residents feel the positive effects of ventilation, that is an additional reason to increase ventilation. This increases feelings of safety.", "No action required. "],
        ["If there are complaints, ventilation cannot be increased as much/often as wanted and this increases risk of exposure. However, if the positive effects are noticed as well, ventilation can be turned up a little bit which decreases risk of exposure.","Increased ventilation will improve health and quality of work. However, if residents get cold and stiff necks when ventilation is increased, their comfort level goes down a lot. They will likely complain and it becomes a 'battle' with the employees every time. However, if residents feel the positive effects of ventilation, that is an additional reason to increase ventilation. This increases feelings of safety.", "Inform the residents and employees of the positive effects of increased ventilation. Find solutions to the negative effects of increased ventilation. For example, avoid draughts in seating areas."],
        ["If there are many complaints, ventilation cannot be increased as much/often as wanted and this increases risk of exposure.", "Increased ventilation will improve health and quality of work. However, if residents get cold and stiff necks when ventilation is increased, their comfort level goes down a lot. They will likely complain and it becomes a 'battle' with the employees every time", "Inform the residents and employees of the positive effects of increased ventilation. Find solutions to the negative effects of increased ventilation. For example, avoid draughts in seating areas."],
        ["", "", "Achieve to find out so that it is known when a new pandemic hits."]
    ],
    'ppe_stock': [
        ["Having enough PPE to be used when necessary will decrease risk of exposure.", "Having enough PPE increases sense of safety, health, quality of work in terms of safety and recognition. The PPE itself can decrease quality of work in terms of comfort.", "Make sure the PPE is not out of date. If so, make sure to order new items on time. "],
        ["Having enough PPE to be used when necessary will decrease risk of exposure. However, there needs to be enough for a longer period of time", "Having some PPE increases sense of safety, health, quality of work in terms of safety and recognition in the short term. To ensure this for the longer term there must be enough in stock. The PPE itself can decrease quality of work in terms of comfort.", "Check that the PPE is not expired. Also ensure that the stock is replenished."],
        ["Not having enough PPE to be used when necessary will increase risk of exposure.", "Not having enough PPE decreases sense of safety, health, quality of work in terms of safety and recognition.", "Order enough PPE to stock the supply. Make sure it is not out of date."],
        ["", "", "Achieve to find out so that it is known when a new pandemic hits."]
    ],
    'care_safety': [
        ["No impact on risk of exposure.", "No impact on values.", "Do regular check-ups."],
        ["Not safely receiving all the care a person needs can increase risk of exposure during the contact moments. This can also decrease general health, leading to a risk of larger consequences if one is exposed to the virus. ", "Impact on the value of healthcare and quality of life. ", "Make sure people can receive all the care they need in a safe manner."],
        ["Stopping care can decrease number of interactions, which decreases risk of exposure. However, it will also decrease general fitness, which leads to a risk of larger consequences if one is exposed to the virus. ", "This has large impacts on values such as healthcare, quality of life and comfort. Will lead to ethical dilemma's.", "Make sure people can receive all the care they need in a safe manner. Discuss predicted ethical dilemma's ahead of time."],
        ["", "", "Achieve to find out so that it is known when a new pandemic hits."]
    ],
    'staff_capacity': [
        ["Increasing measures without increasing number of people in the building is positive in terms of risk of exposure.", "Be aware not to increase workload too much such that it negatively impacts quality of work, which in turn could impact quality of life and healthcare.", "Prepare systems and staff so that it is known how tasks will be capacity can be increased whennecessary. "],
        ["Being able to increase capacity allows for other safe ways of working (e.g. cohorts) which reduces the risk of exposure. On the other hand, there are now more people in the building which can lead to more interactions, which increases the risk of exposure.", "Having capacity to increase number of employees when necessary increases values such as quality of work, comfort, quality of life and health & care. ", "Prepare systems and staff so that it is known how capacity will be increased when necessary. "],
        ["Not being able to increase capacity leads to pushing limits, overwork and rushing, which are all risks for mistakes and/or adherence and thus increases risk of exposure. ", "Not having pace to increase capacity when necessary decreases values such as quality of work, comfort, quality of life and health & care.", "Achieve to create more capacity so that there is room to increase capacity when needed. Prepare systems and staff so that it is known how capacity can be increased when necessary."],
        ["", "", "Achieve to find out so that it is known when a new pandemic hits."]
    ],
    'budget_status': [
        ["Increasing safety measures decreases risk of exposure.", "Being able to invest in measures (e.g. PPE, ventilation, extra employees) increases quality of work, comfort, sense of safety, health.", "No action required. Ensure budget remains available to invest in safety measures when necessary."],
        ["Increasing safety measures decreases risk of exposure.", "Being able to invest in measures (e.g. PPE, ventilation, extra employees) increases quality of work, comfort, sense of safety, health. But not being able to invest in everything puts pressure on this.", "Try to increase budget to be able to invest in safety measures when necessary. There might be subsidies to help."],
        ["Not increasing safety measures poses an increased risk of exposure.", "Not being able to invest in measures (e.g. PPE, ventilation, extra employees) decreases quality of work, comfort, sense of safety, health.", "Look at ways to increase or save budget to invest in safety measures when necessary."],
        ["If this is unknown, that is a risk in itself. ", "", "Achieve to find out so that it is known when a new pandemic hits."]
    ],
};

// --- Scoring Rules ---
const scoringRules = {
    'self_isolate': {
        values: [1, 5, 5],
        risk: [5, 1, 1]
    },
    'cognitive_level': {
        values: [1, 3, 5, 1],
        risk: [5, 3, 1, 5]
    },
    'ventilation_effects': {
        values: [1,1, 3, 5, 3],
        risk: [4, 5, 3, 1,3]
    },
    'ventilation_status': {
        values: [1, 3, 5, 0],
        risk: [5, 3, 1, 0]
    },
    'air_quality': {
        values: [5, 3, 1, 0],
        risk: [1, 3, 5, 0]
    },
    'ppe_stock': {
        values: [5, 3, 1, 0],
        risk: [1, 3, 5, 0]
    },
    'care_safety': {
        values: [5, 3, 1, 0],
        risk: [1, 3, 5, 0]
    },
    'staff_capacity': {
        values: [5, 3, 1, 0],
        risk: [1, 3, 5, 0]
    },
    'budget_status': {
        values: [5, 3, 1, 0],
        risk: [1, 3, 5, 0]
    },
};

// --- Main Dashboard Component ---
export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { answers, content } = location.state || { answers: {}, content: {} };

    const handleRestart = () => {
        navigate('/');
    };
    
    // --- Scoring Logic ---
    const normalizeScore = (score) => (score / 5) * 100;

    const getValuesScore = (questionId, answerIndex) => {
        const rule = scoringRules[questionId];
        if (rule && rule.values && answerIndex < rule.values.length) {
            return rule.values[answerIndex];
        }
        return 0; // Default score if no rule is found
    };

    const getRiskScore = (questionId, answerIndex) => {
        const rule = scoringRules[questionId];
        if (rule && rule.risk && answerIndex < rule.risk.length) {
            return rule.risk[answerIndex];
        }
        return 0; // Default score if no rule is found
    };
    
    // --- Category Data Processing ---
    const analysisData = [
        {
            title: "Building & Ventilation (System)",
            score1: getValuesScore('ventilation_status', answers['ventilation_status']),
            score2: getRiskScore('ventilation_status', answers['ventilation_status']),
            texts: recommendations['ventilation_status'] ? recommendations['ventilation_status'][answers['ventilation_status'] || 0] : ["", "", ""]
        },
        {
            title: "Building & Ventilation (Air Quality)",
            score1: getValuesScore('air_quality', answers['air_quality']),
            score2: getRiskScore('air_quality', answers['air_quality']),
            texts: recommendations['air_quality'] ? recommendations['air_quality'][answers['air_quality'] || 0] : ["", "", ""]
        },
        {
            title: "Health & Care (Readiness)",
            score1: (getValuesScore('ppe_stock', answers['ppe_stock']) + getValuesScore('care_safety', answers['care_safety'])) / 2,
            score2: (getRiskScore('ppe_stock', answers['ppe_stock']) + getRiskScore('care_safety', answers['care_safety'])) / 2,
            texts: getRiskScore('ppe_stock', answers['ppe_stock']) > getRiskScore('care_safety', answers['care_safety'])
                   ? (recommendations['ppe_stock'] ? recommendations['ppe_stock'][answers['ppe_stock'] || 0] : ["", "", ""])
                   : (recommendations['care_safety'] ? recommendations['care_safety'][answers['care_safety'] || 0] : ["", "", ""])
        },
        {
            title: "Operational Readiness",
            score1: (getValuesScore('staff_capacity', answers['staff_capacity']) + getValuesScore('budget_status', answers['budget_status'])) / 2,
            score2: (getRiskScore('staff_capacity', answers['staff_capacity']) + getRiskScore('budget_status', answers['budget_status'])) / 2,
            texts: getRiskScore('staff_capacity', answers['staff_capacity']) > getRiskScore('budget_status', answers['budget_status'])
                   ? (recommendations['staff_capacity'] ? recommendations['staff_capacity'][answers['staff_capacity'] || 0] : ["", "", ""])
                   : (recommendations['budget_status'] ? recommendations['budget_status'][answers['budget_status'] || 0] : ["", "", ""])
        },
    ];

    const totalScoreValues = normalizeScore(analysisData.reduce((acc, item) => acc + item.score1, 0) / analysisData.length);
    const totalScoreExposure = normalizeScore(analysisData.reduce((acc, item) => acc + item.score2, 0) / analysisData.length);
    

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
                <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">Analysis per Categories</h1>
                
                {/* Analysis Rows */}
                <div className="space-y-6 mb-12">
                    {analysisData.map(data => (
                        <AnalysisRow 
                            key={data.title}
                            title={data.title}
                            score1={normalizeScore(data.score1)}
                            score2={normalizeScore(data.score2)}
                            texts={data.texts}
                        />
                    ))}
                </div>

                {/* Total Scores */}
                <div className="max-w-4xl mx-auto space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">Total Scores of Analysis</h2>
                    <TotalScoreBar label="Total Score of Protection against Exposure" value={totalScoreExposure} colorClass="bg-green-500" />
                    <TotalScoreBar label="Total Score of Values" value={totalScoreValues} colorClass="bg-blue-500" />
                </div>
                
                 {/* Restart Button */}
                <div className="text-center mt-12">
                    <button onClick={handleRestart} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-md">
                        {content.startOver || "Start Over"}
                    </button>
                </div>
            </div>
        </div>
    );
}