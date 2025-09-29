import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

// Component for handling markdown links and custom styling
// Component for handling markdown links and custom styling
const markdownComponents = {
  a: ({ node, children, ...props }) => (
    <a
      {...props}
      className="text-indigo-600 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  h3: ({ node, children, ...props }) => (
    <h3 className="text-xl font-bold text-indigo-700 mt-8 mb-4" {...props}>
      {children}
    </h3>
  ),
  ul: ({ node, depth = 0, ...props }) => {
    const padding = depth === 0 ? "pl-6" : depth === 1 ? "pl-10" : "pl-14";
    return <ul className={`space-y-2 ${padding}`} {...props} />;
  },
  li: ({ node, children, ...props }) => {
    const depth = node.position?.start?.column <= 4 ? 0 : node.position?.start?.column <= 6 ? 1 : 2;
    let bullet;

    if (depth === 0) {
      bullet = <div className="w-2 h-2 bg-black rounded-full flex-shrink-0 mt-2"></div>;
    } else if (depth === 1) {
      bullet = <div className="w-2 h-2 border-2 border-black rounded-full flex-shrink-0 mt-2"></div>;
    } else {
      bullet = <div className="w-2 h-0.5 bg-black flex-shrink-0 mt-3"></div>;
    }

    return (
      <li className="flex items-start gap-3" {...props}>
        {bullet}
        <div className="flex-1">{children}</div>
      </li>
    );
  },
};


// Translations for the component
const translations = {
    en: {
        pageSubtitle: 'For location managers in long-term care.',
        welcomeTitle: 'Welcome to this PARAAT scan!',
        description1: 'Are you a location manager of a long-term care facility? Then this web application can help you.',
        description2: 'This web application was developed based on the results of scientific research conducted for the P3Venti project (see [website](https://www.p3venti.nl/)). By answering questions about your care facility, you will receive advice on how resilient your facility is to a future pandemic. Suggestions are also provided on how your facility can become more prepared.',
        instructions: 'The questions focus on the living room as a communal space. Please answer the questions for one living room in your facility. If there are multiple living rooms, you can repeat the scan for each one.',
        getStarted: 'Get Started',
        mainContent: `### What you do
* Choose one room and answer 20 short questions about people & use, space & air, and agreements & resources.
* Do you have multiple living rooms? Repeat the scan for each room.
### What you get
* An analysis of the pandemic preparedness of this living room. The higher the score, the better prepared you are.
* Practical suggestions for preventive measures:
    * Quick adjustments
    * Long-term adjustments
    * Information
### Time & what’s useful to have on hand
* Duration: ±10 minutes per room.
* Useful to have: information about occupancy and technical aspects of the living room.`,
        footerText: 'Based on scientific research from the P3Venti project'
    },
    nl: {
        pageSubtitle: 'Voor locatiemanagers in de langdurige zorg.',
        welcomeTitle: 'Welkom bij deze PARAAT-scan!',
        description1: 'Bent u locatiemanager van een langdurige zorginstelling? Dan kan deze webapplicatie u helpen.',
        description2: 'Deze webapplicatie is ontwikkeld op basis van de resultaten van wetenschappelijk onderzoek dat gedaan is voor het project P3Venti (zie [website](https://www.p3venti.nl/)). Als u de vragen beantwoordt over uw zorginstelling, dan krijgt u een advies over hoe weerbaar uw zorginstelling is voor een volgende pandemie. Ook worden er voorstellen gedaan voor hoe uw zorginstelling zich mogelijk kan voorbereiden.',
        instructions: 'De vragen die gesteld worden gaan over de woonkamer als gemeenschappelijke ruimte. Vul de vragen in over één woonkamer in uw instelling. Als er meerdere woonkamers zijn, vult u de vragen opnieuw in voor de andere woonkamers.',
        getStarted: 'Aan de slag',
        mainContent: `### Wat u doet
* Kies één ruimte en beantwoord 20 korte vragen over mensen & gebruik, ruimte & lucht, en afspraken & middelen.
* Heeft u meerdere woonkamers? Herhaal de scan per ruimte.
### Wat u krijgt
* Een analyse van de pandemische paraatheid van deze woonkamer. Hoe hoger de score hoe beter voorbereid u bent. 
* Praktische suggesties voor preventieve maatregelen:
    * Snelle aanpassing
    * Langetermijnaanpassing
    * Informatie
### Tijd & wat handig is om bij de hand te hebben
* Duur: ±10 minuten per ruimte.
* Handig om bij de hand te hebben: informatie over bezetting en technische aspecten van de woonkamer.`,
        footerText: 'Gebaseerd op wetenschappelijk onderzoek van het P3Venti project'
    }
};


// Styles for the component
const STYLES = {
    languageSelect: {
      header: 'bg-white border-2 border-slate-300 rounded-lg py-2 px-4 text-base font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors',
      menu: 'bg-white border-2 border-slate-300 rounded-lg py-2 px-4 text-base font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors w-full'
    },
    getStartedButton: 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg',
    featureCard: 'bg-white border border-white rounded-lg p-4 text-slate-700 cursor-default select-none'
};

export default function ParaatHome() {
    const [language, setLanguage] = useState('nl');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const content = translations[language];

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
        setIsMenuOpen(false);
    };

    const handleGetStarted = () => {
        navigate(`/tool?lang=${language}`);
    };

    const handleHomeClick = () => {
        // Resets to the default language or could navigate to home
        setLanguage('nl'); 
    };

    const handleInfoClick = () => {
        navigate(`/info?lang=${language}`);
    };

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
                        <p className="text-slate-500 mt-2 text-sm sm:text-base font-medium whitespace-nowrap">{content.pageSubtitle}</p>
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
                  <div className="lg:hidden bg-white rounded-lg shadow-xl p-4 mb-8">
                    <select 
                        onChange={handleLanguageChange} 
                        value={language}
                        className={STYLES.languageSelect.menu}
                    >
                        <option value="en">English</option>
                        <option value="nl">Nederlands</option>
                    </select>
                  </div>
                )}
            </div>

            <div className="w-full max-w-4xl mx-auto">
                <main className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl sm:text-3xl font-bold text-slate-900 mb-6">
                            {content.welcomeTitle}
                        </h2>
                        
                        <div className="space-y-6 text-base sm:text-base text-slate-700 leading-relaxed text-justify">
                            <p>{content.description1}</p>
                            <ReactMarkdown components={markdownComponents}>
                                {content.description2}
                            </ReactMarkdown>
                            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-lg text-left">
                                <p className="font-medium text-indigo-900">{content.instructions}</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-left text-base sm:text-base text-slate-700 leading-relaxed my-12">
                        <ReactMarkdown components={markdownComponents}>
                            {content.mainContent}
                        </ReactMarkdown>
                    </div>

                    <div className="text-center">
                        <button 
                            onClick={handleGetStarted}
                            className={STYLES.getStartedButton}
                        >
                            {content.getStarted}
                        </button>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <div className="text-center text-slate-500">
                            <p className="text-sm">
                                {content.footerText}
                            </p>
                        </div>
                    </div>
                </main>
            </div>

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