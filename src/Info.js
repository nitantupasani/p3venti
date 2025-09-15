import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const STYLES = {
  getStartedButton:
    'bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg',
  featureCard:
    'bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-700',
};

const translations = {
  nl: {
    title: 'Welkom!',
    intro:
      'PARAAT (Pandemic Readiness Assessment & Action Tool) geeft locatiemanagers van zorginstellingen een concreet handelingsperspectief tijdens een luchtgedragen pandemie. Per woonkamer of andere gemeenschappelijke ruimte ontvangt u een PARAAT-score en PARAAT-resultaatkaart met prioriteiten.',
    bullets: [
      'Kies één ruimte en beantwoord 20 korte vragen over mensen & gebruik, ruimte & lucht, en afspraken & middelen.',
      'Herhaal de scan per ruimte als er meerdere woonkamers zijn.',
      'Analyse van de weerbaarheid van de woonkamer (hoe hoger de score hoe beter).',
      'Praktische suggesties voor maatregelen: snel te doen, investering, informatie.',
      'Duur: ±5-10 minuten per ruimte.',
      'Handig: info over bezetting en technische aspecten van het gebouw.',
    ],
    start: 'Begin met één woonkamer',
  },
  en: {
    title: 'Welcome!',
    intro:
      'PARAAT (Pandemic Readiness Assessment & Action Tool) provides long-term care facility managers with a concrete course of action during an airborne pandemic. For each living room or other common area, you will receive a PARAAT score and a PARAAT results card with priorities.',
    bullets: [
      'Choose one room and answer 20 short questions about people & use, space & air quality, and resources.',
      'Repeat the scan for each living room if there are multiple.',
      'Analysis of the resilience of the room (the higher the score, the better).',
      'Practical suggestions for measures: quick to implement, investment, information.',
      'Duration: ±10-15 minutes per room.',
      'Useful: info about occupancy and technical aspects of the building.',
    ],
    start: 'Start with one living room',
  },
};

export default function Info() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialLang = params.get('lang') || 'nl';
  const [language, setLanguage] = useState(initialLang);
  const navigate = useNavigate();
  const content = translations[language];

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleInfoClick = () => {
    navigate(`/info?lang=${language}`);
  };

  const handleStart = () => {
    navigate(`/tool?lang=${language}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <header className="relative flex justify-between items-center w-full mb-8">
          <div className="flex justify-start items-center gap-2" style={{ flex: 1 }}>
            <button
              onClick={handleHomeClick}
              className="p-2 flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                   strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M12 21.75V12m0 0l-3.75 3.75M12 12l3.75 3.75M4.5 9.75v10.5a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5V9.75M8.25 21.75h7.5"/>
              </svg>
              <span className="font-semibold hidden sm:inline">Home</span>
            </button>
            <button
              onClick={handleInfoClick}
              className="p-2 flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                   strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 9v3m0 4h.01M12 21.75a9.75 9.75 0 100-19.5 9.75 9.75 0 000 19.5z"/>
              </svg>
              <span className="font-semibold hidden sm:inline">Info</span>
            </button>
          </div>

          <div className="text-center" style={{ flex: 3 }}>
            <div className="flex justify-center items-center gap-x-3">
              <img src="/p3venti.png" alt="P3Venti Logo" className="h-12 lg:h-14"/>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-600">
                <span className="sm:hidden">PARAAT</span>
                <span className="hidden sm:inline">
                  Pandemic Readiness Assessment & Action Tool (PARAAT)
                </span>
              </h1>
            </div>
          </div>

          <div className="flex justify-end items-center" style={{ flex: 1 }}>
            <div className="hidden lg:block">
              <select
                onChange={handleLanguageChange}
                value={language}
                className="bg-white border-2 border-slate-300 rounded-lg py-2 px-4 text-base font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                <option value="en">English</option>
                <option value="nl">Nederlands</option>
              </select>
            </div>
          </div>
        </header>
      </div>

      {/* Main content */}
      <div className="w-full max-w-4xl mx-auto flex-grow">
        <main className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 text-center">
            {content.title}
          </h2>
          <p className="text-slate-700 text-base mb-8 text-justify">
            {content.intro}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            {content.bullets.map((point, index) => (
              <div key={index} className={STYLES.featureCard}>
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-600 rounded-full p-2 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                         className="w-4 h-4 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"/>
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base">{point}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button onClick={handleStart} className={STYLES.getStartedButton}>
              {content.start}
            </button>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto flex justify-center sm:justify-end mt-16 px-4 sm:px-8">
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
}
