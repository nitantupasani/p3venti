import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const translations = {
    en: {
        pageSubtitle: 'For location managers in long-term care.',
        welcomeTitle: 'Welcome to this PARAAT scan!',
        description1: 'Are you a location manager of a long-term care facility? Then this web application can help you.',
        description2: 'This web application was developed based on the results of scientific research conducted for the P3Venti project. If you answer the questions about your care facility, you will receive advice on its resilience for the next pandemic. Suggestions are made on how your facility can best prepare. These are just suggestions; multiple and/or different solutions are possible. This information can help you make decisions within your organization.',
        instructions: 'The questions are about the living room as a communal space. Please complete the questions about one living room in your facility. If there are multiple living rooms, please complete the questions again for the other living rooms.',
        getStarted: 'Get Started',
        features: [
            'Assess your facility\'s pandemic readiness',
            'Receive personalized recommendations',
            'Evidence-based guidance from P3Venti research',
            'Focus on communal living spaces'
        ]
    },
    nl: {
        pageSubtitle: 'Voor locatiemanagers in de langdurige zorg.',
        welcomeTitle: 'Welkom bij deze PARAAT scan!',
        description1: 'Ben je een locatiemanager van een langdurige zorgfaciliteit? Dan kan deze webapplicatie je helpen.',
        description2: 'Deze webapplicatie is ontwikkeld op basis van de resultaten van wetenschappelijk onderzoek uitgevoerd voor het P3Venti project. Als je de vragen over je zorgfaciliteit beantwoordt, krijg je advies over de veerkracht voor de volgende pandemie. Er worden suggesties gedaan over hoe je faciliteit zich het beste kan voorbereiden. Dit zijn slechts suggesties; meerdere en/of verschillende oplossingen zijn mogelijk. Deze informatie kan je helpen bij het nemen van beslissingen binnen je organisatie.',
        instructions: 'De vragen gaan over de woonkamer als gemeenschappelijke ruimte. Beantwoord de vragen voor één woonkamer in je faciliteit. Als er meerdere woonkamers zijn, beantwoord de vragen dan opnieuw voor de andere woonkamers.',
        getStarted: 'Aan de slag',
        features: [
            'Beoordeel de paraatheid van je faciliteit voor pandemieën',
            'Ontvang gepersonaliseerde aanbevelingen',
            'Evidence-based begeleiding uit P3Venti onderzoek',
            'Focus op gemeenschappelijke leefruimtes'
        ]
    }
};

const STYLES = {
    languageSelect: {
      header: 'bg-white border-2 border-slate-300 rounded-lg py-2 px-4 text-base font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors'
    },
    getStartedButton: 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg',
    featureCard: 'bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-700'
};

export default function ParaatHome() {
    const [language, setLanguage] = useState('en');
    const navigate = useNavigate();
    const content = translations[language];

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    const handleGetStarted = () => {
        navigate('/tool');
    };

    const handleHomeClick = () => {
        // Already on home page, maybe refresh state
        setLanguage('en');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center p-4 sm:p-8">
            <div className="w-full max-w-7xl mx-auto">
                <header className="relative flex justify-between items-center w-full mb-12">
                    <div className="flex justify-start" style={{ flex: 1 }}>
                        <button onClick={handleHomeClick} className="p-2 flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M12 21.75V12m0 0l-3.75 3.75M12 12l3.75 3.75M4.5 9.75v10.5a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5V9.75M8.25 21.75h7.5" />
                            </svg>
                            <span className="font-semibold hidden sm:inline">Home</span>
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
                        <select
                            onChange={handleLanguageChange}
                            value={language}
                            className={STYLES.languageSelect.header}
                        >
                            <option value="en">English</option>
                            <option value="nl">Nederlands</option>
                        </select>
                    </div>
                </header>
            </div>

            <div className="w-full max-w-4xl mx-auto">
                <main className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                            {content.welcomeTitle}
                        </h2>
                        
                        <div className="space-y-6 text-base sm:text-lg text-slate-700 leading-relaxed text-justify">
                            <p>{content.description1}</p>
                            <p>{content.description2}</p>
                            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-lg text-left">
                                <p className="font-medium text-indigo-900">{content.instructions}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                        {content.features.map((feature, index) => (
                            <div key={index} className={STYLES.featureCard}>
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-600 rounded-full p-2 flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-sm sm:text-base">{feature}</span>
                                </div>
                            </div>
                        ))}
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
                                Based on scientific research from the P3Venti project
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