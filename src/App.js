import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        pageSubtitle: 'Care Home Action Plan',
        categoryPersonal: 'Stage 1: Personal',
        categoryInteraction: 'Stage 2: Interaction',
        categoryOrganizational: 'Stage 3: Organizational',
        step: 'Step',
        of: 'of',
        summaryTitle: 'Action Plan Summary',
        summarySubtitle: 'The following priorities have been selected:',
        startOver: 'Start Over',
        previousStep: 'Previous Step',
        nextStep: 'Next Step',
        viewSummary: 'View Summary',
        questionSets: {
            personal: [
              { id: "q1", questionText: "How many people live in this residential group?", type: "slider", min: 0, max: 50, unit: "people" },
              { id: "q2", questionText: "On average, how many employees are present in the living room during the day? (This includes all employees: caregivers, cleaners, etc. Please provide an average as this may vary.)", type: "slider", min: 0, max: 50, unit: "employees" },
              { id: "q3", questionText: "On average, how many visitors are present in the living room on a given day? (This includes all employees: caregivers, cleaners, etc. Please provide an average as this may vary.)", type: "slider", min: 0, max: 50, unit: "visitors" },
              { id: "q4", questionText: "Can the residents self-isolate?", answerOptions: [{ answerText: "Yes, they can all self-isolate" }, { answerText: "No, not everyone can self-isolate (e.g., due to wandering, aggression, loneliness, etc.)" }] },
              { id: "q5", questionText: "What is the cognitive level of the residents?", answerOptions: [{ answerText: "No one has cognitive problems" }, { answerText: "Some cognitive decline" }, { answerText: "Major cognitive problems" }] },
              { id: "q6", questionText: "Does everyone have sufficient knowledge of infection prevention measures?", answerOptions: [{ answerText: "Yes, there is sufficient knowledge of infection prevention measures" }, { answerText: "No, there is not enough knowledge of infection prevention measures" }] },
            ],
            interaction: [
              { id: "q7", questionText: "What is the area of the living room in square meters?", type: "slider", min: 0, max: 200, unit: "m²" },
              { id: "q8", questionText: "What is the shape of the living room?", answerOptions: [{ answerText: "Rectangle" }, { answerText: "Circle" }, { answerText: "Oval" }, { answerText: "L-shape" }] },
              { id: "q9", questionText: "How much space should be between people (in meters)?", type: "slider", min: 0, max: 5, unit: "meters", step: 0.5 },
              { id: "q10", questionText: "How many windows and doors that open to the outside are present?", type: "slider", min: 0, max: 10, unit: "items" },
              { id: "q11", questionText: "How many ventilation grilles to the outside are present?", type: "slider", min: 0, max: 10, unit: "grilles" },
              { id: "q12", questionText: "Is air recirculated through the building?", answerOptions: [{ answerText: "Yes" }, { answerText: "No" }, { answerText: "I don't know" }] },
              { id: "q13", questionText: "Which air quality sensors are present in the room? (Multiple choice)", multiple: true, answerOptions: [{ answerText: "CO2 meter (carbon dioxide in the air)" }, { answerText: "Relative humidity" }, { answerText: "VOC meter (volatile organic compounds in the air)" }, { answerText: "TVOC (total volatile organic compounds in the air)" }, { answerText: "PM2.5 (particulate matter smaller than 2.5 micrometers)" }, { answerText: "PM10 (particulate matter smaller than 10 micrometers)" }, { answerText: "No sensors present" }] },
              { id: "q14", questionText: "What is the status of the ventilation system?", answerOptions: [{ answerText: "Maintenance is up to date" }, { answerText: "Maintenance is not up to date" }, { answerText: "There is no ventilation system" }] },
              { id: "q15", questionText: "How good is the air quality normally?", answerOptions: [{ answerText: "Good air quality" }, { answerText: "Sometimes good, sometimes bad (e.g., occasional complaints of dry skin, eyes, nose, throat, or respiratory issues)" }, { answerText: "Poor air quality (e.g., frequent complaints of dry skin, eyes, nose, throat, or respiratory issues)" }] },
              { id: "q16", questionText: "Do residents feel the effects of increased ventilation? Positive effects can include more fresh air, fewer breathing problems, or the elimination of unpleasant odors. Negative effects include drafts, cold, and a stiff neck.", answerOptions: [{ answerText: "Residents feel no effects of increased ventilation (positive or negative)" }, { answerText: "Residents feel only the positive effects of increased ventilation" }, { answerText: "Residents feel only the negative effects of increased ventilation" }, { answerText: "Residents feel both the positive and negative effects of increased ventilation" }] },
            ],
            organizational: [
                { id: "q17", questionText: "Are there enough personal protective equipment (PPE) in stock?", answerOptions: [{ answerText: "Yes, enough in stock" }, { answerText: "There is some in stock to last a few weeks" }, { answerText: "There is not enough in stock" }] },
                { id: "q18", questionText: "Can residents receive the physical and mental care they need?", answerOptions: [{ answerText: "Yes" }, { answerText: "No, we need to scale back some" }, { answerText: "No, we need to scale back as much as possible" }] },
                { id: "q19", questionText: "What is the staff capacity?", answerOptions: [{ answerText: "Employees have room in their workload to take on extra tasks" }, { answerText: "No room for extra tasks per employee, but possible deployment of extra staff" }, { answerText: "The capacity is fully utilized. No room for more tasks or more deployment of extra staff" }] },
                { id: "q20", questionText: "Is there sufficient budget to invest in possible measures if necessary?", answerOptions: [{ answerText: "Sufficient budget to finance possible measures" }, { answerText: "Some budget to finance possible measures, but not enough to cover all costs" }, { answerText: "No budget to finance possible measures" }] }
            ]
        }
    },
    nl: {
        pageSubtitle: 'Zorghuis Actieplan',
        categoryPersonal: 'Stap 1: Persoonlijk',
        categoryInteraction: 'Stap 2: Interactie',
        categoryOrganizational: 'Stap 3: Organisatorisch',
        step: 'Stap',
        of: 'van',
        summaryTitle: 'Overzicht Actieplan',
        summarySubtitle: 'De volgende prioriteiten zijn geselecteerd:',
        startOver: 'Opnieuw Beginnen',
        previousStep: 'Vorige Stap',
        nextStep: 'Volgende Stap',
        viewSummary: 'Bekijk Overzicht',
        questionSets: {
            personal: [
              { id: "q1", questionText: "Hoeveel mensen wonen in deze woongroep?", type: "slider", min: 0, max: 50, unit: "mensen" },
              { id: "q2", questionText: "Hoeveel medewerkers zijn gemiddeld aanwezig in de woonkamer in de loop van een dag? Hieronder vallen alle medewerkers (zorgverleners, schoonmakers, etc.). Dit kan varieren over de dag. Graag een gemiddelde geven.", type: "slider", min: 0, max: 50, unit: "medewerkers" },
              { id: "q3", questionText: "Hoeveel bezoekers zijn gemiddeld aanwezig in de woonkamer op een dag? Dit kan varieren over de dag. Graag een gemiddelde geven.", type: "slider", min: 0, max: 50, unit: "bezoekers" },
              { id: "q4", questionText: "Kunnen de bewoners zichzelf isoleren?", answerOptions: [{ answerText: "Ja, ze kunnen zichzelf allemaal isoleren" }, { answerText: "Nee, niet iedereen kan zichzelf isoleren (bijvoorbeeld door loopdrang, agressie, eenzaamheid, etc.)" }] },
              { id: "q5", questionText: "Wat is het cognitief niveau van de bewoners?", answerOptions: [{ answerText: "Niemand heeft cognitieve problemen" }, { answerText: "Wat cognitieve achteruitgang" }, { answerText: "Grote cognitieve problemen" }] },
              { id: "q6", questionText: "Is er bij iedereen genoeg kennis over infectiepreventiemaatregelen?", answerOptions: [{ answerText: "Ja, er is genoeg kennis over infectiepreventiemaatregelen" }, { answerText: "Nee, er is niet genoeg kennis over infectiepreventiemaatregelen" }] },
            ],
            interaction: [
              { id: "q7", questionText: "Wat is het oppervlakte van de woonkamer in vierkante meters?", type: "slider", min: 0, max: 200, unit: "m²" },
              { id: "q8", questionText: "Wat is de vorm van de woonkamer?", answerOptions: [{ answerText: "Rechthoek" }, { answerText: "Cirkel" }, { answerText: "Ovaal" }, { answerText: "L-vorm" }] },
              { id: "q9", questionText: "Hoeveel ruimte moet er tussen mensen zitten in meters?", type: "slider", min: 0, max: 5, unit: "meters", step: 0.5 },
              { id: "q10", questionText: "Hoeveel ramen en deuren zijn er aanwezig die open kunnen naar de buitenlucht?", type: "slider", min: 0, max: 10, unit: "items" },
              { id: "q11", questionText: "Hoeveel ventilatieroosters zijn er aanwezig naar buiten?", type: "slider", min: 0, max: 10, unit: "roosters" },
              { id: "q12", questionText: "Wordt er lucht gerecirculeerd door het gebouw?", answerOptions: [{ answerText: "Ja" }, { answerText: "Nee" }, { answerText: "Weet ik niet" }] },
              { id: "q13", questionText: "Welke er luchtkwaliteitsensoren zijn aanwezig in de ruimte? (Meerdere keuzes mogelijk)", multiple: true, answerOptions: [{ answerText: "CO2 meter (koolstofdioxide in de lucht)" }, { answerText: "Relatieve luchtvochtigheid" }, { answerText: "VOC meter (vluchtige organische stoffen in de lucht)" }, { answerText: "TVOC (totale vluchtige organische stoffen in de lucht)" }, { answerText: "PM2.5 (fijnstofdeeltjes kleiner dan 2,5 micrometer)" }, { answerText: "PM10 (fijnstofdeeltjes kleiner dan 10 micrometer)" }, { answerText: "Geen sensoren aanwezig" }] },
              { id: "q14", questionText: "Wat is de status van het ventilatiesysteem?", answerOptions: [{ answerText: "Onderhoud is op orde" }, { answerText: "Onderhoud is niet op orde" }, { answerText: "Er is geen ventilatiesysteem" }] },
              { id: "q15", questionText: "Hoe goed is de luchtkwaliteit normaalgesproken?", answerOptions: [{ answerText: "Goede luchtkwaliteit" }, { answerText: "Soms goed, soms slecht (bijvoorbeeld soms klachten over droge huid, ogen, neus, keel of ademhalingsklachten)" }, { answerText: "Slechte luchtkwaliteit (bijvoorbeeld vaak klachten over droge huid, ogen, neus, keel of ademhalingsklachten)" }] },
              { id: "q16", questionText: "Voelen de bewoners de effecten van toegenomen ventilatie? Positieve effecten kunnen zijn bijvoorbeeld meer frisse lucht, minder ademhalingsproblemen of onaangename geuren verwijderen. Negatieve effecten zijn bijvoorbeeld tocht, kou, een stijve nek.", answerOptions: [{ answerText: "Bewoners voelen geen effecten van verhoogde ventilatie (positief of negatief)" }, { answerText: "Bewoners voelen alleen de positieve effecten van verhoogde ventilatie" }, { answerText: "Bewoners voelen alleen de negatieve effecten van verhoogde ventilatie" }, { answerText: "Bewoners voelen zowel de positieve als de negatieve effecten van verhoogde ventilatie" }] },
            ],
            organizational: [
                { id: "q17", questionText: "Zijn er genoeg persoonlijke beschermingsmiddelen (PBM) op voorraad?", answerOptions: [{ answerText: "Ja, genoeg op voorraad" }, { answerText: "Er is wat op voorraad om een paar weken vooruit te kunnen" }, { answerText: "Er is niet genoeg op voorraad" }] },
                { id: "q18", questionText: "Kunnen bewoners de fysieke en mentale zorg ontvangen die ze nodig hebben?", answerOptions: [{ answerText: "Ja" }, { answerText: "Nee, we moeten wat afschalen" }, { answerText: "Nee, we moeten zo veel mogelijk afschalen" }] },
                { id: "q19", questionText: "Wat is de personeelscapaciteit?", answerOptions: [{ answerText: "Medewerkers hebben ruimte in de werklast om extra taken op zich te nemen" }, { answerText: "Geen ruimte voor extra taken per medewerker, wel mogelijke inzet van extra personeel" }, { answerText: "De capaciteit wordt volledig benut. Geen ruimte voor meer taken of meer inzet van extra personeel" }] },
                { id: "q20", questionText: "Is er voldoende budget om te investeren in mogelijke maatregelen indien nodig?", answerOptions: [{ answerText: "Voldoende budget om mogelijke maatregelen te financieren" }, { answerText: "Enig budget om mogelijke maatregelen te financieren, maar niet genoeg om alle kosten te dekken" }, { answerText: "Geen budget om mogelijke maatregelen te financieren" }] }
            ]
        }
    }
};

const categoryOrder = ['personal', 'interaction', 'organizational'];

// --- Main Application Component ---
export default function App() {
  // --- State Management ---
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [activeCategory, setActiveCategory] = useState('personal');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stepsCompleted, setStepsCompleted] = useState({ personal: false, interaction: false, organizational: false });

  // --- Dynamic Content Variables ---
  const content = translations[language];
  const activeQuestions = content.questionSets[activeCategory];

  // --- Effect for restoring state ---
  useEffect(() => {
    const currentQuestion = activeQuestions[currentQuestionIndex];
    const answer = answers[currentQuestion.id];

    if (currentQuestion.type === 'slider') {
        const initialValue = answer ?? currentQuestion.min;
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


  // --- Event Handlers ---
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setIsMenuOpen(false);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentQuestionIndex(0);
    // Note: We don't clear answers here to allow users to go back and change them
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
            navigate('/summary', { 
                state: { 
                    questions: content.questionSets, 
                    answers: answers, 
                    content: content 
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
    setAnswers({});
    setSelectedAnswerIndex(null);
    setIsAnswered(false);
    setIsMenuOpen(false);
    setStepsCompleted({ personal: false, interaction: false, organizational: false });
    navigate('/');
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
          <div className="flex-1 flex justify-start">
            <button onClick={handleHomeClick} className="p-2 flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M12 21.75V12m0 0l-3.75 3.75M12 12l3.75 3.75M4.5 9.75v10.5a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5V9.75M8.25 21.75h7.5" />
              </svg>
              <span className="font-semibold">Home</span>
            </button>
          </div>

          <div className="flex-1 text-center">
              <div className="flex justify-center items-center gap-x-3">
                <img src="/p3venti.png" alt="P3Venti Logo" className="h-12 lg:h-14" />
                <h1 className="text-4xl lg:text-5xl font-extrabold text-indigo-600">P3Venti</h1>
              </div>
              <p className="text-slate-500 mt-2 text-base font-medium">{content.pageSubtitle}</p>
          </div>
          
          <div className="flex-1 flex justify-end items-center">
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

      <div className="w-full flex items-center justify-center">
          <aside className="hidden lg:flex flex-col gap-4 mr-8">
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
                  {content.step} {currentQuestionIndex + 1} {content.of} {activeQuestions.length}
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
                  value={answers[currentQuestion.id] || currentQuestion.min}
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
    </div>
  );
}