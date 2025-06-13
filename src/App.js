import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Style Definitions ---
const STYLES = {
    languageSelect: 'bg-white border border-slate-300 rounded-md py-2 px-3 text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500',
    categoryButton: {
        // Added whitespace-nowrap to prevent text wrapping and increased padding
        base: 'px-8 py-2 rounded-full text-base font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap',
        get active() { return `${this.base} bg-indigo-600 text-white shadow-md`; },
        get inactive() { return `${this.base} bg-white text-slate-600 hover:bg-slate-100 border border-slate-300`; },
    },
    answerButton: {
        base: 'p-4 rounded-lg text-left text-base font-medium transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
        get default() { return `${this.base} bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 cursor-pointer`; },
        get selected() { return `${this.base} bg-indigo-600 border-indigo-600 cursor-default`; },
    },
    nextButton: 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 shadow-md hover:shadow-lg',
    restartButton: 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-md hover:shadow-lg',
};

// --- Multi-language Content ---
const translations = {
    en: {
        pageSubtitle: 'Care Home Action Plan',
        categoryOrganization: 'Organizational Actions',
        categoryPersonal: 'Individual Actions',
        step: 'Step',
        of: 'of',
        summaryTitle: 'Action Plan Summary',
        summarySubtitle: 'The following priorities have been selected:',
        startOver: 'Start Over',
        nextStep: 'Next Step',
        viewSummary: 'View Summary',
        questionSets: {
            clinical: [
                { questionText: 'How many people live in this living group/department?', type: 'slider', min: 1, max: 50, step: 1, unit: 'People' },
                { questionText: 'How many employees are present in the living/activity room at the same time (e.g. during dinner or an activity)?', type: 'slider', min: 1, max: 50, step: 1, unit: 'People' },
                { questionText: 'What is the status of the ventilation system?', answerOptions: [{ answerText: 'Good maintenance air ventilation system' }, { answerText: 'Sometimes good, sometimes bad' }, { answerText: 'No ventilation system' }, { answerText: 'Unknown' }] },
                { questionText: 'What is the air quality usually like?', answerOptions: [{ answerText: 'Air quality generally good' }, { answerText: 'Sometimes good, sometimes bad' }, { answerText: 'Air quality generally poor (e.g. complaints about dry eyes, mouth, skin)' }, { answerText: 'Unknown' }] },
                { questionText: 'Do you have enough personal protective equipment in store?', answerOptions: [{ answerText: 'There is enough PPE in stock' }, { answerText: 'There is some PPE in stock to get through the first weeks' }, { answerText: 'There is not enough PPE in stock' }, { answerText: 'Unknown' }] },
                { questionText: 'Can residents safely receive the (physical and mental) care they need?', answerOptions: [{ answerText: 'Yes' }, { answerText: 'No, need to scale down' }, { answerText: 'No, most care must be stopped' }, { answerText: 'Unknown' }] },
                { questionText: 'What is the status of staff capacity?', answerOptions: [{ answerText: 'Staff have room in workload to take on extra measures' }, { answerText: 'No room for extra measures in workload but possible extra staff deployment' }, { answerText: 'Staff capacity is at its fullest' }, { answerText: 'Unknown' }] },
                { questionText: 'Is there enough budget to invest in possible measures if needed?', answerOptions: [{ answerText: 'Enough budget to finance possible measures' }, { answerText: 'Some budget to finance possible measures, but not enough to cover all costs' }, { answerText: 'No budget to finance possible measures' }, { answerText: 'Unknown' }] }
            ],
            operational: [
                { questionText: 'Which operational improvement should be prioritized?', answerOptions: [{ answerText: 'Optimizing Staff Scheduling and Rotas' }, { answerText: 'Renovating Common Areas for Comfort' }, { answerText: 'Improving Kitchen and Nutritional Facilities' }, { answerText: 'Upgrading the Family Visitation System' }] },
                { questionText: 'How should we approach updating family members about operational changes?', answerOptions: [{ answerText: 'Scheduled Weekly Email Newsletter' }, { answerText: 'Secure Online Family Portal Announcement' }, { answerText: 'Bi-weekly Town Hall Meetings (Virtual & In-person)' }, { answerText: 'Individual Phone Calls for Major Disruptions' }] },
                { questionText: 'What is our primary goal for community engagement?', answerOptions: [{ answerText: 'Partnering with Local Health Providers' }, { answerText: 'Hosting Events for Residents and Families' }, { answerText: 'Recruiting Local Volunteers' }, { answerText: 'Building a Stronger Online Presence' }] }
            ]
        }
    },
    nl: {
        pageSubtitle: 'Zorghuis Actieplan',
        categoryOrganization: 'Organisatorische Acties',
        categoryPersonal: 'Individuele Acties',
        step: 'Stap',
        of: 'van',
        summaryTitle: 'Overzicht Actieplan',
        summarySubtitle: 'De volgende prioriteiten zijn geselecteerd:',
        startOver: 'Opnieuw Beginnen',
        nextStep: 'Volgende Stap',
        viewSummary: 'Bekijk Overzicht',
        questionSets: {
            clinical: [
                { questionText: 'Wat is de meest directe klinische prioriteit voor vandaag?', answerOptions: [{ answerText: 'Medicatieschema\'s van patiënten beoordelen' }, { answerText: 'Valrisicobeoordelingen uitvoeren' }, { answerText: 'Wondzorgprotocollen bijwerken' }, { answerText: 'Naleving van infectiebeheersing controleren' }] },
                { questionText: 'Wat is de belangrijkste focus voor klinische personeelstraining deze maand?', answerOptions: [{ answerText: 'Geavanceerde dementiezorgtechnieken' }, { answerText: 'Noodhulp oefeningen' }, { answerText: 'Empathie en communicatie met de patiënt' }, { answerText: 'Gebruik van nieuwe medische apparatuur' }] },
                { questionText: 'Hoeveel medewerkers moeten worden toegewezen aan het nieuwe trainingsprogramma?', type: 'slider', min: 1, max: 20, step: 1, unit: 'medewerkers' }
            ],
            operational: [
                { questionText: 'Welke operationele verbetering moet worden geprioriteerd?', answerOptions: [{ answerText: 'Optimaliseren van personeelsplanning en roosters' }, { answerText: 'Renoveren van gemeenschappelijke ruimtes voor comfort' }, { answerText: 'Verbeteren van keuken- en voedingsfaciliteiten' }, { answerText: 'Upgraden van het familiebezoek-systeem' }] },
                { questionText: 'Hoe moeten we familieleden informeren over operationele wijzigingen?', answerOptions: [{ answerText: 'Geplande wekelijkse e-mailnieuwsbrief' }, { answerText: 'Aankondiging via beveiligd online familieportaal' }, { answerText: 'Twee-wekelijkse bijeenkomsten (virtueel & persoonlijk)' }, { answerText: 'Individuele telefoontjes bij grote verstoringen' }] },
                { questionText: 'Wat is ons primaire doel voor gemeenschapsbetrokkenheid?', answerOptions: [{ answerText: 'Samenwerken met lokale zorgaanbieders' }, { answerText: 'Evenementen organiseren voor bewoners en families' }, { answerText: 'Lokale vrijwilligers werven' }, { answerText: 'Een sterkere online aanwezigheid opbouwen' }] }
            ]
        }
    }
};

// --- Main Application Component ---
export default function App() {
  // --- State Management ---
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [activeCategory, setActiveCategory] = useState('clinical');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sliderValue, setSliderValue] = useState(null);

  // --- Dynamic Content Variables ---
  const content = translations[language];
  const activeQuestions = content.questionSets[activeCategory];

  // --- Effect for slider initialization ---
  useEffect(() => {
    const currentQuestion = activeQuestions[currentQuestionIndex];
    if (currentQuestion.type === 'slider') {
        const initialValue = answers[currentQuestionIndex] || currentQuestion.min;
        setSliderValue(initialValue);
        const newAnswers = [...answers];
        if (newAnswers[currentQuestionIndex] === undefined) {
             newAnswers[currentQuestionIndex] = initialValue;
             setAnswers(newAnswers);
        }
        setIsAnswered(true);
    }
  }, [currentQuestionIndex, activeCategory, activeQuestions, answers]);


  // --- Event Handlers ---
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswerIndex(null);
    setIsAnswered(false);
  };

  const handleAnswerOptionClick = (answerText, index) => {
    setSelectedAnswerIndex(index);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = index;
    setAnswers(newAnswers);
    if (!isAnswered) setIsAnswered(true);
  };

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setSliderValue(value);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };
  
  const handleNextQuestion = () => {
    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < activeQuestions.length) {
        setCurrentQuestionIndex(nextQuestion);
        setSelectedAnswerIndex(null);
        setIsAnswered(false);
        if (activeQuestions[nextQuestion].type !== 'slider') {
            setSliderValue(null);
        }
    } else {
        navigate('/summary', { 
            state: { 
                questions: activeQuestions, 
                answers: answers, 
                content: content 
            } 
        });
    }
  }
  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex justify-center p-4 pt-10 sm:pt-12 font-sans">
      <div className="w-full max-w-8xl mx-auto">
        
        <div className="grid grid-cols-3 items-center mb-12">
            <div className="flex justify-start items-center space-x-4">
                <button
                    onClick={() => handleCategoryChange('clinical')}
                    className={activeCategory === 'clinical' ? STYLES.categoryButton.active : STYLES.categoryButton.inactive}
                >
                    {content.categoryOrganization}
                </button>
                <button
                    onClick={() => handleCategoryChange('operational')}
                    className={activeCategory === 'operational' ? STYLES.categoryButton.active : STYLES.categoryButton.inactive}
                >
                    {content.categoryPersonal}
                </button>
            </div>
            
            <div className="text-center">
                <h1 className="text-4xl font-bold text-indigo-600">P3Venti</h1>
                <p className="text-slate-500 mt-1 text-lg">{content.pageSubtitle}</p>
            </div>

            <div className="flex justify-end">
                <select 
                    onChange={handleLanguageChange} 
                    value={language}
                    className={STYLES.languageSelect}
                >
                    <option value="en">English</option>
                    <option value="nl">Nederlands</option>
                </select>
            </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 transition-all duration-500 max-w-2xl mx-auto">
            <>
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-slate-500 mb-2 tracking-wide uppercase">
                  {content.step} {currentQuestionIndex + 1} {content.of} {activeQuestions.length}
                </h2>
                <p className="text-2xl font-bold text-slate-900">
                  {activeQuestions[currentQuestionIndex].questionText}
                </p>
              </div>

              {activeQuestions[currentQuestionIndex].type === 'slider' ? (
                <div className="mt-8">
                    <input
                        type="range"
                        min={activeQuestions[currentQuestionIndex].min}
                        max={activeQuestions[currentQuestionIndex].max}
                        step={activeQuestions[currentQuestionIndex].step}
                        value={sliderValue || activeQuestions[currentQuestionIndex].min}
                        onChange={handleSliderChange}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-center text-xl font-semibold text-indigo-600 mt-4">
                        {sliderValue} {activeQuestions[currentQuestionIndex].unit}
                    </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                  {activeQuestions[currentQuestionIndex].answerOptions.map((option, index) => {
                    const isSelected = index === selectedAnswerIndex;
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerOptionClick(option.answerText, index)}
                        className={isSelected ? STYLES.answerButton.selected : STYLES.answerButton.default}
                      >
                        <span className={isSelected ? 'text-white' : 'text-slate-700'}>
                          {option.answerText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              
              {isAnswered && (
                  <div className="flex justify-end mt-8">
                      <button onClick={handleNextQuestion} className={STYLES.nextButton}>
                          {currentQuestionIndex < activeQuestions.length - 1 ? content.nextStep : content.viewSummary}
                      </button>
                  </div>
              )}
            </>
        </div>
      </div>
    </div>
  );
}