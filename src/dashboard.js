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
    // Recommendations for Question 3 (index 2): "What is the status of the ventilation system?"
    2: [
        ["Good air ventilation decreases the risk of exposure.", "Good air ventilation systems increase health, sense of safety, quality of life and quality of work.", "Keep regular maintenace. Do regular check-ups."],
        ["Poor air ventilation increases the risk of exposure.", "Poor air ventilation systems can decrease health, sense of safety, quality of life and quality of work.", "Increase maintenance to make sure it is functioning well. "],
        ["No air ventilation increases the risk of exposure.", "No air ventilation system decreases health, sense of safety, quality of life and quality of work.", "Install a ventilation system and make sure it is functioning well."],
        ["", "", "Achieve to find out so that it is known when a new pandemic hits."]
    ],
    // Recommendations for Question 4 (index 3): "What is the air quality usually like?"
    3: [
        ["Good air quality decreases the risk of exposure.", "Good air quality increases health, sense of safety, quality of life and quality of work.", "Do regular check-ups. Do regular ventilation check-ups to know exactly how your system is functioning and how it can be adapted  to function during a pandemic. "],
        ["Questionable air quality increases the risk of exposure.", "Poor air quality can decrease health, sense of safety, quality of life and quality of work.", "Fix ventilation system. Make sure it is functioning well. Do regular ventilation check-ups to know exactly how your system is functioning and how it can be adapted  to function during a pandemic. "],
        ["Poor air quality increases the risk of exposure.", "Poor air quality can decrease health, sense of safety, quality of life and quality of work.", "Fix ventilation system. Make sure it is functioning well. Do regular ventilation check-ups to know exactly how your system is functioning and how it can be adapted  to function during a pandemic. "],
        ["", "", "Achieve to find out so that it is known when a new pandemic hits."]
    ],
    // Recommendations for Question 5 (index 4): "Do you have enough personal protective equipment in store?"
    4: [
        ["Having enough PPE to be used when necessary will decrease risk of exposure.", "Having enough PPE increases sense of safety, health, quality of work in terms of safety and recognition. The PPE itself can decrease quality of work in terms of comfort.", "Make sure the PPE is not out of date. If so, make sure to order new items on time. "],
        ["Having enough PPE to be used when necessary will decrease risk of exposure. However, there needs to be enough for a longer period of time", "Having some PPE increases sense of safety, health, quality of work in terms of safety and recognition in the short term. To ensure this for the longer term there must be enough in stock. The PPE itself can decrease quality of work in terms of comfort.", "Check that the PPE is not expired. Also ensure that the stock is replenished."],
        ["Not having enough PPE to be used when necessary will increase risk of exposure.", "Not having enough PPE decreases sense of safety, health, quality of work in terms of safety and recognition.", "Order enough PPE to stock the supply. Make sure it is not out of date."],
        ["", "", "Achieve to find out so that it is known when a new pandemic hits."]
    ],
    // Recommendations for Question 6 (index 5): "Can residents safely receive the (physical and mental) care they need?"
    5: [
        ["No impact on risk of exposure.", "No impact on values.", "Do regular check-ups."],
        ["Not safely receiving all the care a person needs can increase risk of exposure during the contact moments. This can also decrease general health, leading to a risk of larger consequences if one is exposed to the virus. ", "Impact on the value of healthcare and quality of life. ", "Make sure people can receive all the care they need in a safe manner."],
        ["Stopping care can decrease number of interactions, which decreases risk of exposure. However, it will also decrease general fitness, which leads to a risk of larger consequences if one is exposed to the virus. ", "This has large impacts on values such as healthcare, quality of life and comfort. Will lead to ethical dilemma's.", "Make sure people can receive all the care they need in a safe manner. Discuss predicted ethical dilemma's ahead of time."],
        ["", "", "Achieve to find out so that it is known when a new pandemic hits."]
    ],
    // Recommendations for Question 7 (index 6): "What is the status of staff capacity?"
    6: [
        ["Increasing measures without increasing number of people in the building is positive in terms of risk of exposure.", "Be aware not to increase workload too much such that it negatively impacts quality of work, which in turn could impact quality of life and healthcare.", "Prepare systems and staff so that it is known how tasks will be capacity can be increased whennecessary. "],
        ["Being able to increase capacity allows for other safe ways of working (e.g. cohorts) which reduces the risk of exposure. On the other hand, there are now more people in the building which can lead to more interactions, which increases the risk of exposure.", "Having capacity to increase number of employees when necessary increases values such as quality of work, comfort, quality of life and health & care. ", "Prepare systems and staff so that it is known how capacity will be increased when necessary. "],
        ["Not being able to increase capacity leads to pushing limits, overwork and rushing, which are all risks for mistakes and/or adherence and thus increases risk of exposure. ", "Not having pace to increase capacity when necessary decreases values such as quality of work, comfort, quality of life and health & care.", "Achieve to create more capacity so that there is room to increase capacity when needed. Prepare systems and staff so that it is known how capacity can be increased when necessary."],
        ["", "", "Achieve to find out so that it is known when a new pandemic hits."]
    ],
    // Recommendations for Question 8 (index 7): "Is there enough budget to invest in possible measures if needed?"
    7: [
        ["Increasing safety measures decreases risk of exposure.", "Being able to invest in measures (e.g. PPE, ventilation, extra employees) increases quality of work, comfort, sense of safety, health.", "No action required. Ensure budget remains available to invest in safety measures when necessary."],
        ["Increasing safety measures decreases risk of exposure.", "Being able to invest in measures (e.g. PPE, ventilation, extra employees) increases quality of work, comfort, sense of safety, health. But not being able to invest in everything puts pressure on this.", "Try to increase budget to be able to invest in safety measures when necessary. There might be subsidies to help."],
        ["Not increasing safety measures poses an increased risk of exposure.", "Not being able to invest in measures (e.g. PPE, ventilation, extra employees) decreases quality of work, comfort, sense of safety, health.", "Look at ways to increase or save budget to invest in safety measures when necessary."],
        ["If this is unknown, that is a risk in itself. ", "", "Achieve to find out so that it is known when a new pandemic hits."]
    ],
};

// --- Main Dashboard Component ---
export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { answers, content } = location.state || { answers: [], content: {} };

    const handleRestart = () => {
        navigate('/');
    };
    
    // --- Scoring Logic ---

    // Converts a raw score (0-5) to a percentage (0-100) for the dial
    const normalizeScore = (score) => (score / 5) * 100;

    // Calculates the "Score of values" based on the question and answer
    const getValuesScore = (questionIndex, answerIndex) => {
        if (answerIndex === undefined) return 0;
        if (questionIndex === 2) { // Special logic for question 3
            const scores = [1, 3, 5, 0];
            return scores[answerIndex] || 0;
        } else { // Logic for all other questions
            const scores = [5, 3, 1, 0];
            return scores[answerIndex] || 0;
        }
    };

    // Calculates the "Risk of exposure" score based on the question and answer
    const getRiskScore = (questionIndex, answerIndex) => {
        if (answerIndex === undefined) return 0;
        if (questionIndex === 2) { // Special logic for question 3
            const scores = [5, 3, 1, 0];
            return scores[answerIndex] || 0;
        } else { // Logic for all other questions
            const scores = [1, 3, 5, 0];
            return scores[answerIndex] || 0;
        }
    };
    
    // --- Category Data Processing ---
    const analysisData = [
        {
            title: "Building & Ventilation (System)",
            score1: getValuesScore(2, answers[2]),
            score2: getRiskScore(2, answers[2]),
            texts: recommendations[2] ? recommendations[2][answers[2] || 0] : ["", "", ""]
        },
        {
            title: "Building & Ventilation (Air Quality)",
            score1: getValuesScore(3, answers[3]),
            score2: getRiskScore(3, answers[3]),
            texts: recommendations[3] ? recommendations[3][answers[3] || 0] : ["", "", ""]
        },
        {
            title: "Health & Care (Readiness)",
            score1: (getValuesScore(4, answers[4]) + getValuesScore(5, answers[5])) / 2,
            score2: (getRiskScore(4, answers[4]) + getRiskScore(5, answers[5])) / 2,
            // Show recommendations for the item with the higher risk score
            texts: getRiskScore(4, answers[4]) > getRiskScore(5, answers[5])
                   ? (recommendations[4] ? recommendations[4][answers[4] || 0] : ["", "", ""])
                   : (recommendations[5] ? recommendations[5][answers[5] || 0] : ["", "", ""])
        },
        {
            title: "Operational Readiness",
            score1: (getValuesScore(6, answers[6]) + getValuesScore(7, answers[7])) / 2,
            score2: (getRiskScore(6, answers[6]) + getRiskScore(7, answers[7])) / 2,
            // Show recommendations for the item with the higher risk score
            texts: getRiskScore(6, answers[6]) > getRiskScore(7, answers[7])
                   ? (recommendations[6] ? recommendations[6][answers[6] || 0] : ["", "", ""])
                   : (recommendations[7] ? recommendations[7][answers[7] || 0] : ["", "", ""])
        },
    ];

    const totalScoreValues = normalizeScore(analysisData.reduce((acc, item) => acc + item.score1, 0) / analysisData.length);
    const totalScoreExposure = normalizeScore(analysisData.reduce((acc, item) => acc + item.score2, 0) / analysisData.length);
    

    if (!answers.length || !Object.keys(content).length) {
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
