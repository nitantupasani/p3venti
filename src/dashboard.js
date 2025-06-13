import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const STYLES = {
    restartButton: 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-md hover:shadow-lg',
};

// --- Recommendation Data ---
// This object holds the 2D string arrays for each multiple-choice question.
// The key (e.g., '2') corresponds to the index of the question in the `clinical` question set.
// Each array has 4 rows (for the 4 answer options) and 3 columns.
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
  
  // Recommendations for Question 7 (index 6): "What is the status of staff capacity?"
  5: [
    ["No impact on risk of exposure.", "No impact on values.", "Do regular check-ups."],
    ["Not safely receiving all the care a person needs can increase risk of exposure during the contact moments. This can also decrease general health, leading to a risk of larger consequences if one is exposed to the virus. ", "Impact on the value of healthcare and quality of life. ", "Make sure people can receive all the care they need in a safe manner."],
    ["Stopping care can decrease number of interactions, which decreases risk of exposure. However, it will also decrease general fitness, which leads to a risk of larger consequences if one is exposed to the virus. ", "This has large impacts on values such as healthcare, quality of life and comfort. Will lead to ethical dilemma's.", "Make sure people can receive all the care they need in a safe manner. Discuss predicted ethical dilemma's ahead of time."],
    ["", "", "Achieve to find out so that it is known when a new pandemic hits."]
  ],
  // Recommendations for Question 6 (index 5): "Can residents safely receive the (physical and mental) care they need?"
  6: [
    ["Increasing measures without increasing number of people in the building is positive in terms of risk of exposure.", "Be aware not to increase workload too much such that it negatively impacts quality of work, which in turn could impact quality of life and healthcare.", "Prepare systems and staff so that it is known how tasks will be capacity can be increased when necessary. "],
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


export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get data passed from App.js via route state
    const { questions, answers, content } = location.state || { questions: [], answers: [], content: {} };

    const handleRestart = () => {
        navigate('/'); // Navigate back to the main question page
    };

    // A fallback for when the page is accessed directly without state
    if (!questions.length || !Object.keys(content).length) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-800 flex justify-center items-center">
                 <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-indigo-700">No summary to display.</h2>
                    <p className="text-lg text-slate-600 mb-6">Please start the action plan first.</p>
                    <button onClick={handleRestart} className={STYLES.restartButton}>
                        Go to Start
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex justify-center p-4 pt-10 sm:pt-12 font-sans">
             <div className="w-full max-w-2xl mx-auto">
                <div className="text-center bg-white rounded-2xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-semibold mb-4 text-indigo-700">{content.summaryTitle}</h2>
                  <p className="text-lg text-slate-600 mb-6">{content.summarySubtitle}</p>
                  
                  {/* Container for the summary list */}
                  <div className="text-left space-y-6">
                     {questions.map((q, index) => {
                        const answer = answers[index];
                        const recommendationData = recommendations[index]; // Get 2D array for the current question
                        let answerDisplay = '...';

                        if (answer !== undefined) {
                            if (q.type === 'slider') {
                                answerDisplay = `${answer} ${q.unit || ''}`;
                            } else if (q.answerOptions) {
                                // The answer is the index of the selected option
                                answerDisplay = q.answerOptions[answer]?.answerText;
                            }
                        }

                        return (
                            <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                {/* Question and Answer */}
                                <p className="font-semibold text-slate-500 text-sm">{q.questionText}</p>
                                <p className="text-indigo-800 font-medium text-lg mt-1">
                                    {answerDisplay}
                                </p>

                                {/* Corresponding Recommendations */}
                                {recommendationData && answer !== undefined && q.type !== 'slider' && (
                                  <div className="mt-4 pt-3 border-t border-slate-200">
                                    <h4 className="font-semibold text-sm text-indigo-800 mb-2">Recommended Actions:</h4>
                                    <ul className="list-disc list-inside text-indigo-700 text-sm space-y-1">
                                      {recommendationData[answer].map((rec, recIndex) => (
                                        <li key={recIndex}>{rec}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                            </div>
                        );
                     })}
                  </div>

                  <button onClick={handleRestart} className={`${STYLES.restartButton} mt-8`}>
                    {content.startOver}
                  </button>
                </div>
            </div>
        </div>
    );
}
