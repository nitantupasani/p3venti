import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CustomSlider from './CustomSlider';

// --- Style Definitions ---
const STYLES = {
    languageSelect: {
      menu: 'bg-white border-2 border-slate-300 rounded-lg py-2 px-4 text-base font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors w-full',
      header: 'bg-white border-2 border-slate-300 rounded-lg py-2 px-4 text-base font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors'
    },
    categoryButton: {
        base: 'px-6 py-3 rounded-full text-base font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap w-full text-center',
        get active() { return `${this.base} bg-indigo-600 text-white shadow-lg`; },
        get inactive() { return `${this.base} bg-white text-slate-700 hover:bg-slate-100 border-2 border-slate-300`; },
        get completed() { return `${this.base} bg-green-500 text-white shadow-lg cursor-default`; },
        get disabled() { return `${this.base} bg-slate-200 text-slate-400 cursor-not-allowed`; },
    },
    answerButton: {
        base: 'p-5 rounded-xl text-left text-base font-semibold transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
        get default() { return `${this.base} bg-white hover:bg-indigo-50 border-2 border-slate-300 hover:border-indigo-400 cursor-pointer`; },
        get selected() { return `${this.base} bg-indigo-600 text-white border-2 border-indigo-600 cursor-default`; },
    },
    navButton: 'font-bold py-2 px-5 sm:py-3 sm:px-8 rounded-lg transition-transform transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base',
    get nextButton() { return `${this.navButton} bg-indigo-600 hover:bg-indigo-700 text-white`; },
    get previousButton() { return `${this.navButton} bg-slate-500 hover:bg-slate-600 text-white`; },
};

// --- Multi-language Content ---
const translations = {
    en: {
        pageSubtitle: 'For location managers in long-term care.',
        categoryPersonal: 'Step 1: People & use',
        categoryInteraction: 'Step 2: Space & air',
        categoryOrganizational: 'Step 3: Agreements & resources',
        step: 'Question',
        of: 'of',
        summaryTitle: 'Action Plan Summary',
        summarySubtitle: 'The following priorities have been selected:',
        startOver: 'Start Over',
        previousStep: 'Previous Step',
        nextStep: 'Next Step',
        viewSummary: 'View Dashboard',
        questionSets: {
            personal: [
                { id: "q1", questionText: "How many people are usually in the living room at the same time (residents + staff + visitors)?", type: "slider", min: 1, max: 50, unit: "people" },
                { id: "q2", questionText: "Which group primarily uses this living room?", answerOptions: [{ answerText: "Psychogeriatrics" }, { answerText: "Somatics" }, { answerText: "Intellectual impairments" }, { answerText: "Mixed" }, { answerText: "I don't know" }] },
                { id: "q3", questionText: "How long are residents in this room on average per day?", answerOptions: [{ answerText: "<1 hour" }, { answerText: "1-3 hours" }, { answerText: "> 3 hours" }, { answerText: "I don't know" }] },
                { id: "q4", questionText: "Can you temporarily isolate someone if they have symptoms?", answerOptions: [{ answerText: "Yes" }, { answerText: "Partly" }, { answerText: "No" }, { answerText: "I don't know" }] },
                { id: "q5", questionText: "Do different departments/groups regularly mix here?", answerOptions: [{ answerText: "Often" }, { answerText: "Sometimes" }, { answerText: "Rarely" }, { answerText: "I don't know" }] },
            ],
            interaction: [
              { id: "q6", questionText: "How large is the living room (in m²)?", type: "slider", min: 0, max: 200, unit: "m²" },
              { id: "q7", questionText: "What is the shape of the room?", answerOptions: [{ answerText: "Square" }, { answerText: "Rectangle" }, { answerText: "L-shaped" }, { answerText: "Long and narrow" }, { answerText: "Other" }, { answerText: "I don't know" }] },
              { id: "q8", questionText: "Can people maintain a distance of approximately 1.5 meters when sitting/doing activities?", answerOptions: [{ answerText: "Usually" }, { answerText: "Sometimes" }, { answerText: "Almost never" }, { answerText: "I don't know" }] },
              { id: "q9", questionText: "Can windows or an outside door be opened?", answerOptions: [{ answerText: "Yes, several" }, { answerText: "Yes, but limited" }, { answerText: "No" }, { answerText: "I don't know" }] },
              { id: "q10", questionText: "Are there ventilation grilles (above a window or in the wall)?", answerOptions: [{ answerText: "Yes" }, { answerText: "No" }, { answerText: "I don't know" }] },
              { id: "q11", questionText: "What type of ventilation system is installed?", answerOptions: [{ answerText: "Type A: Natural air supply + natural air exhaust" }, { answerText: "Type B: Mechanical air supply + natural air exhaust" }, { answerText: "Type C: Natural air supply + mechanical air exhaust" }, { answerText: "Type D: Mechanical air supply + mechanical air exhaust" }, { answerText: "I don't know" }] },
              { id: "q12", questionText: "Is indoor air (partially) recirculated in the building (reused/backflow)?", answerOptions: [{ answerText: "Yes" }, { answerText: "No" }, { answerText: "I don't know" }] },
              { id: "q13", questionText: "Is there an air quality meter (e.g., CO₂) in this living room?", answerOptions: [{ answerText: "Yes" }, { answerText: "No" }, { answerText: "I don't know" }] },
              { id: "q14", questionText: "What is the maximal CO₂ level during busy periods?", answerOptions: [{ answerText: "<800 ppm" }, { answerText: "800–1200 ppm" }, { answerText: ">1200 ppm" }, { answerText: "No meter" }] },
              { id: "q15", questionText: "Has the ventilation system been inspected and maintained in the past 12 months?", answerOptions: [{ answerText: "Yes" }, { answerText: "No" }, { answerText: "I don't know" }] },
              { id: "q16", questionText: "Do residents experience discomfort (drafts/cold/noise) when you provide additional ventilation?", answerOptions: [{ answerText: "Often" }, { answerText: "Sometimes" }, { answerText: "Rarely/Never" }, { answerText: "I don't know" }] },
            ],
            organizational: [
                { id: "q17", questionText: "Are there brief instructions for windows/grids/settings in this room?", answerOptions: [{ answerText: "Yes" }, { answerText: "No" }, { answerText: "I don't know" }] },
                { id: "q18", questionText: "Is personal protective equipment (PPE) available where needed?", answerOptions: [{ answerText: "Often" }, { answerText: "Sometimes" }, { answerText: "Rarely/Never" }, { answerText: "I don't know" }] },
                { id: "q19", questionText: "How many shifts were unstaffed in the past 14 days?", answerOptions: [{ answerText: "0" }, { answerText: "1-2" }, { answerText: "3-5" }, { answerText: "6+" }, { answerText: "I don't know" }] },
                { id: "q20", questionText: "Do you work with permanent teams per room, and do residents stay in fixed groups (little mixing between departments)?", answerOptions: [{ answerText: "Yes" }, { answerText: "Sometimes" }, { answerText: "No" }, { answerText: "I don't know" }] },
                { id: "q21", questionText: "Is there a budget or plan for adjustments or measures (maintenance, sensors, grids, PPE, additional staff)?", answerOptions: [{ answerText: "Yes, now" }, { answerText: "Within 12 months" }, { answerText: "Not yet" }, { answerText: "I don't know" }] }
            ]
        }
    },
    nl: {
        pageSubtitle: 'Voor locatiemanagers in de langdurige zorg.',
        categoryPersonal: 'Stap 1: Mensen & gebruik',
        categoryInteraction: 'Stap 2: Ruimte & lucht',
        categoryOrganizational: 'Stap 3: Afspraken & middelen',
        step: 'Vraag',
        of: 'van',
        summaryTitle: 'Overzicht Actieplan',
        summarySubtitle: 'De volgende prioriteiten zijn geselecteerd:',
        startOver: 'Opnieuw Beginnen',
        previousStep: 'Vorige Stap',
        nextStep: 'Volgende Stap',
        viewSummary: 'Bekijk Dashboard',
        questionSets: {
            personal: [
              { id: "q1", questionText: "Hoeveel mensen zijn meestal tegelijk in de woonkamer (bewoners + medewerkers + bezoekers)?", type: "slider", min: 1, max: 50, unit: "mensen" },
              { id: "q2", questionText: "Welke groep gebruikt deze woonkamer vooral?", answerOptions: [{ answerText: "Psychogeriatrie" }, { answerText: "Somatiek" }, { answerText: "Verstandelijke beperkingen" }, { answerText: "Gemengd" }, { answerText: "Weet ik niet" }] },
              { id: "q3", questionText: "Hoelang zijn bewoners gemiddeld per dag in deze kamer?", answerOptions: [{ answerText: "<1 uur" }, { answerText: "1-3 uur" }, { answerText: "> 3 uur" }, { answerText: "Weet ik niet" }] },
              { id: "q4", questionText: "Kunt u iemand tijdelijk apart laten verblijven bij klachten?", answerOptions: [{ answerText: "Ja" }, { answerText: "Gedeeltelijk" }, { answerText: "Nee" }, { answerText: "Weet ik niet" }] },
              { id: "q5", questionText: "Mengen verschillende afdelingen/groepen hier regelmatig?", answerOptions: [{ answerText: "Vaak" }, { answerText: "Soms" }, { answerText: "Zelden" }, { answerText: "Weet ik niet" }] },
            ],
            interaction: [
              { id: "q6", questionText: "Hoe groot is de woonkamer (in m²)?", type: "slider", min: 0, max: 200, unit: "m²" },
              { id: "q7", questionText: "Wat is de vorm van de kamer?", answerOptions: [{ answerText: "Vierkant" }, { answerText: "Rechthoek" }, { answerText: "L-vorm" }, { answerText: "Lang en smal" }, { answerText: "Anders" }, { answerText: "Weet ik niet" }] },
              { id: "q8", questionText: "Kunnen mensen ongeveer 1,5 meter afstand houden bij zitten/activiteiten?", answerOptions: [{ answerText: "Meestal" }, { answerText: "Soms" }, { answerText: "Bijna nooit" }, { answerText: "Weet ik niet" }] },
              { id: "q9", questionText: "Kunnen ramen of een buitendeur open?", answerOptions: [{ answerText: "Ja, meerdere" }, { answerText: "Ja, maar beperkt" }, { answerText: "Nee" }, { answerText: "Weet ik niet" }] },
              { id: "q10", questionText: "Zijn er ventilatieroosters (boven raam of in de muur)?", answerOptions: [{ answerText: "Ja" }, { answerText: "Nee" }, { answerText: "Weet ik niet" }] },
              { id: "q11", questionText: "Welk type ventilatiesysteem is geinstalleerd?", answerOptions: [{ answerText: "Type A: Natuurlijke luchttoevoer + natuurlijke luchtafvoer" }, { answerText: "Type B: Mechanische luchttoevoer + natuurlijke luchtafvoer" }, { answerText: "Type C: Natuurlijke luchttoevoer + mechanische luchtafvoer" }, { answerText: "Type D: Mechanische luchttoevoer + mechanische luchtafvoer" }, { answerText: "Weet ik niet" }] },
              { id: "q12", questionText: "Wordt binnenlucht (deels) gerecirculeerd in het gebouw (hergebruikt/teruggeblazen)?", answerOptions: [{ answerText: "Ja" }, { answerText: "Nee" }, { answerText: "Weet ik niet" }] },
              { id: "q13", questionText: "Is er een luchtkwaliteitsmeter (bijv. CO₂) in deze woonkamer?", answerOptions: [{ answerText: "Ja" }, { answerText: "Nee" }, { answerText: "Weet ik niet" }] },
              { id: "q14", questionText: "Wat is de maximale CO₂‑waarde tijdens drukte?", answerOptions: [{ answerText: "<800 ppm" }, { answerText: "800–1200 ppm" }, { answerText: ">1200 ppm" }, { answerText: "Geen meter" }] },
              { id: "q15", questionText: "Is het ventilatiesysteem in de afgelopen 12 maanden gecontroleerd en onderhouden?", answerOptions: [{ answerText: "Ja" }, { answerText: "Nee" }, { answerText: "Weet ik niet" }] },
              { id: "q16", questionText: "Ervaren bewoners last (tocht/koud/geluid) als u extra ventileert?", answerOptions: [{ answerText: "Vaak" }, { answerText: "Soms" }, { answerText: "Zelden/nooit" }, { answerText: "Weet ik niet" }] },
            ],
            organizational: [
                { id: "q17", questionText: "Is er een korte instructie voor ramen/roosters/instellingen in deze kamer?", answerOptions: [{ answerText: "Ja" }, { answerText: "Nee" }, { answerText: "Weet ik niet" }] },
                { id: "q18", questionText: "Zijn persoonlijke beschermingsmiddelen (PBM) beschikbaar waar nodig?", answerOptions: [{ answerText: "Altijd" }, { answerText: "Soms" }, { answerText: "Zelden/niet" }, { answerText: "Weet ik niet" }] },
                { id: "q19", questionText: "Hoeveel diensten bleven onbezet in de laatste 14 dagen?", answerOptions: [{ answerText: "0" }, { answerText: "1-2" }, { answerText: "3-5" }, { answerText: "6+" }, { answerText: "Weet ik niet" }] },
                { id: "q20", questionText: "Werkt u met vaste teams per woonkamer en blijven bewoners in vaste groepen (weinig menging tussen afdelingen)?", answerOptions: [{ answerText: "Ja" }, { answerText: "Soms" }, { answerText: "Nee" }, { answerText: "Weet ik niet" }] },
                { id: "q21", questionText: "Is er budget of een plan voor aanpassingen of maatregelen (onderhoud, sensoren, roosters, PBM, extra personeel)?", answerOptions: [{ answerText: "Ja, nu" }, { answerText: "Binnen 12 maanden" }, { answerText: "Nog niet" }, { answerText: "Weet ik niet" }] }
            ]
        }
    }
};

const categoryOrder = ['personal', 'interaction', 'organizational'];

// --- Main Application Component ---
const App = () => {
    // The routing is now managed entirely by the top-level router in index.js.
    // The App component, rendered at the '/tool' path, should only contain the questionnaire tool.
    return <Tool />;
};

// --- Questionnaire Component ---
const Tool = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialLang = params.get('lang') || 'nl';
  const [language, setLanguage] = useState(initialLang);
  const [activeCategory, setActiveCategory] = useState('personal');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({'q1': 25});
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stepsCompleted, setStepsCompleted] = useState({ personal: false, interaction: false, organizational: false });

  const content = translations[language];
  const activeQuestions = content.questionSets[activeCategory];

  const totalQuestions = categoryOrder.reduce((total, category) => total + content.questionSets[category].length, 0);

  const getAbsoluteQuestionIndex = () => {
    let index = 0;
    for (const category of categoryOrder) {
      if (category === activeCategory) {
        index += currentQuestionIndex;
        break;
      }
      index += content.questionSets[category].length;
    }
    return index;
  };

  const absoluteQuestionIndex = getAbsoluteQuestionIndex();

  useEffect(() => {
    const currentQuestion = activeQuestions[currentQuestionIndex];
    const answer = answers[currentQuestion.id];

    if (currentQuestion.type === 'slider') {
        const initialValue = answer ?? (currentQuestion.id === 'q1' ? 25 : currentQuestion.min);
        if (answer === undefined) {
            setAnswers(prev => ({...prev, [currentQuestion.id]: initialValue}));
        }
        setIsAnswered(true);
    } else if (currentQuestion.multiple) {
        setSelectedAnswerIndex(null);
        setIsAnswered(answer && answer.length > 0);
    } else {
        setSelectedAnswerIndex(answer ?? null);
        setIsAnswered(answer !== undefined);
    }
  }, [currentQuestionIndex, activeCategory, activeQuestions, answers]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setIsMenuOpen(false);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setIsAnswered(false);
    setIsMenuOpen(false);
  };

  const handleAnswerOptionClick = (answerText, index) => {
    const currentQuestion = activeQuestions[currentQuestionIndex];
    const newAnswers = { ...answers };

    if (currentQuestion.multiple) {
      let selectedAnswers = newAnswers[currentQuestion.id] || [];
      const noSensorsIndex = currentQuestion.answerOptions.length - 1;

      if (index === noSensorsIndex) {
        selectedAnswers = selectedAnswers.includes(noSensorsIndex) ? [] : [noSensorsIndex];
      } else {
        const answerIndex = selectedAnswers.indexOf(index);
        if (answerIndex > -1) {
            selectedAnswers.splice(answerIndex, 1);
        } else {
            selectedAnswers.push(index);
        }
        const noSensorsInList = selectedAnswers.indexOf(noSensorsIndex);
        if (noSensorsInList > -1) {
            selectedAnswers.splice(noSensorsInList, 1);
        }
      }

      newAnswers[currentQuestion.id] = selectedAnswers;
      setAnswers(newAnswers);
      setIsAnswered(selectedAnswers.length > 0);
    } else {
      newAnswers[currentQuestion.id] = index;
      setAnswers(newAnswers);
      setSelectedAnswerIndex(index);
      setIsAnswered(true);
    }
  };

  const handleSliderChange = (e) => {
    const currentQuestion = activeQuestions[currentQuestionIndex];
    const value = parseFloat(e.target.value);
    setAnswers(prev => ({...prev, [currentQuestion.id]: value}));
  };
  
  const handleNext = () => {
    const isLastQuestionInCategory = currentQuestionIndex === activeQuestions.length - 1;
    const currentCategoryIndex = categoryOrder.indexOf(activeCategory);
    const isLastCategory = currentCategoryIndex === categoryOrder.length - 1;

    if (isLastQuestionInCategory) {
        setStepsCompleted(prev => ({ ...prev, [activeCategory]: true }));
        if (!isLastCategory) {
            const nextCategory = categoryOrder[currentCategoryIndex + 1];
            setActiveCategory(nextCategory);
            setCurrentQuestionIndex(0);
        } else {
            navigate(`/summary?lang=${language}`, { 
                state: { 
                    answers: answers,
                    content: content,
                } 
            });
        }
    } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    setSelectedAnswerIndex(null);
    setIsAnswered(false);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      const currentCategoryIndex = categoryOrder.indexOf(activeCategory);
      if (currentCategoryIndex > 0) {
        const prevCategory = categoryOrder[currentCategoryIndex - 1];
        setActiveCategory(prevCategory);
        setCurrentQuestionIndex(content.questionSets[prevCategory].length - 1);
      }
    }
  };

  const handleHomeClick = () => {
    setLanguage('en');
    setActiveCategory('personal');
    setCurrentQuestionIndex(0);
    setAnswers({'q1': 25});
    setSelectedAnswerIndex(null);
    setIsAnswered(false);
    setIsMenuOpen(false);
    setStepsCompleted({ personal: false, interaction: false, organizational: false });
    navigate('/');
  };

   const handleInfoClick = () => {
    navigate(`/info?lang=${language}`);
  };

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const isLastQuestion = activeCategory === 'organizational' && currentQuestionIndex === activeQuestions.length - 1;

  const MobileMenuContent = () => (
    <>
      <button
        onClick={() => handleCategoryChange('personal')}
        className={stepsCompleted.personal ? STYLES.categoryButton.completed : (activeCategory === 'personal' ? STYLES.categoryButton.active : STYLES.categoryButton.inactive)}
      >
        {content.categoryPersonal} {stepsCompleted.personal && '✔'}
      </button>
      <button
        onClick={() => handleCategoryChange('interaction')}
        disabled={!stepsCompleted.personal}
        className={stepsCompleted.interaction ? STYLES.categoryButton.completed : (activeCategory === 'interaction' ? STYLES.categoryButton.active : (stepsCompleted.personal ? STYLES.categoryButton.inactive : STYLES.categoryButton.disabled))}
      >
        {content.categoryInteraction} {stepsCompleted.interaction && '✔'}
      </button>
      <button
        onClick={() => handleCategoryChange('organizational')}
        disabled={!stepsCompleted.interaction}
        className={stepsCompleted.organizational ? STYLES.categoryButton.completed : (activeCategory === 'organizational' ? STYLES.categoryButton.active : (stepsCompleted.interaction ? STYLES.categoryButton.inactive : STYLES.categoryButton.disabled))}
      >
        {content.categoryOrganizational} {stepsCompleted.organizational && '✔'}
      </button>
      <div className="pt-2">
        <select 
            onChange={handleLanguageChange} 
            value={language}
            className={STYLES.languageSelect.menu}
        >
            <option value="en">English</option>
            <option value="nl">Nederlands</option>
        </select>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="relative flex justify-between items-center w-full mb-8">
          <div className="flex justify-start items-center gap-2" style={{ flex: 1 }}>
            <button onClick={handleHomeClick} className="p-2 flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M12 21.75V12m0 0l-3.75 3.75M12 12l3.75 3.75M4.5 9.75v10.5a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5V9.75M8.25 21.75h7.5" />
              </svg>
              <span className="font-semibold hidden sm:inline">Home</span>
            </button>
            <button onClick={handleInfoClick} className="p-2 flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M12 21.75a9.75 9.75 0 100-19.5 9.75 9.75 0 000 19.5z" />
              </svg>
              <span className="font-semibold hidden sm:inline">Info</span>
            </button>
          </div>

          <div className="text-center" style={{ flex: 3 }}>
              <div className="flex justify-center items-center gap-x-3">
                <img src="/p3venti.png" alt="P3Venti Logo" className="h-12 lg:h-14" />
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-600">
                    <span className="sm:hidden">PARAAT</span>
                    <span className="hidden sm:inline">Pandemic Readiness Assessment & Action Tool (PARAAT)</span>
                </h1>
              </div>
              <p className="text-slate-500 mt-2 text-sm sm:text-base font-medium">{content.pageSubtitle}</p>
          </div>
          
          <div className="flex justify-end items-center" style={{ flex: 1 }}>
            <div className="lg:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                {isMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                )}
              </button>
            </div>
            <div className="hidden lg:block">
              <select
                  onChange={handleLanguageChange}
                  value={language}
                  className={STYLES.languageSelect.header}
              >
                  <option value="en">English</option>
                  <option value="nl">Nederlands</option>
              </select>
            </div>
          </div>
        </header>

        {isMenuOpen && (
          <div className="lg:hidden bg-white rounded-lg shadow-xl p-4 mb-8 space-y-4">
            <MobileMenuContent />
          </div>
        )}
      </div>

      <div className="w-full flex items-start justify-center">
          <aside className="hidden lg:flex flex-col gap-4 mt-16 mr-8">
              <button
                onClick={() => handleCategoryChange('personal')}
                className={stepsCompleted.personal ? STYLES.categoryButton.completed : (activeCategory === 'personal' ? STYLES.categoryButton.active : STYLES.categoryButton.inactive)}
              >
                  {content.categoryPersonal} {stepsCompleted.personal && '✔'}
              </button>
              <button
                onClick={() => handleCategoryChange('interaction')}
                disabled={!stepsCompleted.personal}
                className={stepsCompleted.interaction ? STYLES.categoryButton.completed : (activeCategory === 'interaction' ? STYLES.categoryButton.active : (stepsCompleted.personal ? STYLES.categoryButton.inactive : STYLES.categoryButton.disabled))}
              >
                  {content.categoryInteraction} {stepsCompleted.interaction && '✔'}
              </button>
              <button
                onClick={() => handleCategoryChange('organizational')}
                disabled={!stepsCompleted.interaction}
                className={stepsCompleted.organizational ? STYLES.categoryButton.completed : (activeCategory === 'organizational' ? STYLES.categoryButton.active : (stepsCompleted.interaction ? STYLES.categoryButton.inactive : STYLES.categoryButton.disabled))}
              >
                  {content.categoryOrganizational} {stepsCompleted.organizational && '✔'}
              </button>
          </aside>

          <main className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 sm:p-10 transition-all duration-500">
              <div className="mb-12">
                <h2 className="text-base font-bold text-indigo-600 mb-2 tracking-wider uppercase">
                  {content.step} {absoluteQuestionIndex + 1} {content.of} {totalQuestions}
                </h2>
                <p className="text-2xl font-bold text-slate-900 leading-snug">
                  {activeQuestions[currentQuestionIndex].questionText}
                </p>
              </div>

              {currentQuestion.type === 'slider' ? (
                <CustomSlider
                  min={currentQuestion.min}
                  max={currentQuestion.max}
                  step={currentQuestion.step}
                  value={answers[currentQuestion.id] || (currentQuestion.id === 'q1' ? 25 : currentQuestion.min)}
                  onChange={handleSliderChange}
                  unit={currentQuestion.unit}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {activeQuestions[currentQuestionIndex].answerOptions.map((option, index) => {
                    const isSelected = currentQuestion.multiple
                      ? (answers[currentQuestion.id] || []).includes(index)
                      : index === selectedAnswerIndex;
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerOptionClick(option.answerText, index)}
                        className={isSelected ? STYLES.answerButton.selected : STYLES.answerButton.default}
                      >
                        <span className={isSelected ? 'text-white' : 'text-slate-800'}>
                          {option.answerText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              
              <footer className="flex flex-col-reverse sm:flex-row sm:justify-between items-center mt-16 gap-4 sm:gap-0">
                <div className="w-full sm:w-auto">
                  { (currentQuestionIndex > 0 || categoryOrder.indexOf(activeCategory) > 0) && (
                    <button onClick={handlePrevious} className={`${STYLES.previousButton} w-full sm:w-auto`}>
                      {content.previousStep}
                    </button>
                  )}
                </div>
                <div className="w-full sm:w-auto">
                  {isAnswered && (
                    <button onClick={handleNext} className={`${STYLES.nextButton} w-full sm:w-auto`}>
                      {isLastQuestion ? content.viewSummary : content.nextStep}
                    </button>
                  )}
                </div>
              </footer>
          </main>
      </div>

      <footer className="w-full max-w-7xl mx-auto flex justify-end mt-16 px-4 sm:px-8">
          <div className="flex items-center gap-4">
              <a href="https://www.tue.nl" target="_blank" rel="noopener noreferrer">
                <img src="/tue.svg" alt="TU/e Logo" className="h-8" />
              </a>
              <a href="https://www.tno.nl" target="_blank" rel="noopener noreferrer">
                <img src="/tno.svg" alt="TNO Logo" className="h-6" />
              </a>
          </div>
      </footer>
    </div>
  );
};

export default App;