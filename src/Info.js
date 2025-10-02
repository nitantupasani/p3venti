import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const STYLES = {
  getStartedButton:
  'bg-[#971547] hover:bg-[#caabbf] text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg',
};

const translations = {
  nl: {
    title: 'Handleiding Pandemic Readiness Assessment & Action Tool (PARAAT)',
    sections: [
      {
        heading: 'Welkom!',
        body: `PARAAT (Pandemic Readiness Assessment & Action Tool) geeft locatiemanagers van zorginstellingen een concreet handelingsperspectief tijdens een luchtgedragen pandemie. Per woonkamer of andere gemeenschappelijke ruimte ontvangt u een PARAAT-score en PARAAT-resultaatkaart met prioriteiten.`,
      },
      {
        heading: 'Over PARAAT',
        body: `• Deze tool is ontwikkeld door de Technische Universiteit Eindhoven in opdracht van TNO binnen P3Venti (Programma Pandemische Paraatheid en Ventilatie).
• Op basis van wetenschappelijk onderzoek en praktijkinzichten van de Covid-19 pandemie (zie rapportages ).
• De resultaten zijn advies. Er zijn vaak meerdere passende oplossingen.`,
      },
      {
        heading: 'Wat is het?',
        body: `PARAAT beoordeelt de pandemische paraatheid van één ruimte in uw locatie. De uitkomst bestaat uit:
• een PARAAT-score (0–100);
• een Betrouwbaarheidsindicator;
• een PARAAT-resultaatkaart met acties: Snelle aanpassingen, Langetermijnaanpassingen, Informatie.`,
      },
      {
        heading: 'Voor wie?',
        body: `Voor locatiemanagers in de langdurige zorg. De PARAAT-scan is praktisch en kost circa 10 minuten per ruimte.`,
      },
      {
        heading: 'Wat heeft u nodig vóór u start?',
        body: `• Oppervlakte van de ruimte (m²); schatting mag
• Aantal personen tegelijk aanwezig (bewoners, bezoekers, medewerkers)
• Informatie over aanwezigheid ramen, deuren en ventilatieroosters 
• Is er een CO₂-meter aanwezig? Zo ja: maximale waarde bij drukte
• Onderhoudsdatum ventilatiesysteem (laatste 12 maanden)
• Isolatiemogelijkheid (iemand tijdelijk isoleren op diens kamer)
• Vaste teams & vaste bewonersgroepen 
• Aantal onbezet gebleven diensten in de afgelopen 14 dagen`,
      },
      {
        heading: 'Hoe werkt de PARAAT-scan?',
        body: `• Kies één ruimte. Heeft u meerdere woonkamers? Herhaal de scan per kamer.
• Beantwoord 20 korte vragen in drie blokken:
  ◦ Mensen & gebruik (wie, hoeveel, isoleren, mengen)
  ◦ Ruimte & lucht (m², 1,5 m mogelijk, ramen/roosters, recirculatie, CO₂, onderhoud)
  ◦ Afspraken & middelen (instructies, PBM, diensten, vaste teams, budget)
• Bekijk de uitkomst. U ziet de PARAAT-score, de Betrouwbaarheid en de PARAAT-resultaatkaart met acties op volgorde van impact.
• Bewaar of deel de kaart (download/e-mail) en plan de opvolging.`,
      },
      {
        heading: 'Resultaat',
        body: `• PARAAT-score

0–100; hoger = beter voorbereid.

• Betrouwbaarheid

Betrouwbaarheid van deze uitkomst hangt af van wat u invult. We beginnen op 100%. Elke vraag waar u “Weet ik niet” antwoord, gaat de betrouwbaarheid omlaag.

• PARAAT-resultaatkaart (prioriteiten)

We zetten acties op volgorde van effect en inspanning. Zo pakt u eerst de acties met veel winst en weinig moeite. Elk item heeft een label:
  ◦ Snelle aanpassing
  ◦ Langetermijnaanpassing
  ◦ Informatie`,
      },
      {
        heading: 'Wat meet PARAAT?',
        body: `• Dichtheid: personen per m²
• Luchtverversing: open ramen/deuren, roosters, CO₂-niveau, HVAC-onderhoud
• Organisatie: vaste teams/groepen, onbezet gebleven diensten (14 dagen), PBM, instructies
• Let op: CO₂ is een indicatie voor ventilatie en hoeveelheid frisse lucht. Hoe lager de CO₂, hoe meer frisse lucht (= beter), dit is geen harde veiligheidsgrens.`,
      },
      {
        heading: 'Hoe komt het advies tot stand?',
        body: `• Per vraag: classificatie goed / middel / risico
• Weging per blok: Mensen & gebruik 22% · Ruimte & lucht 59% · Afspraken & middelen 19%
• Veiligheidsregels (gaan vóór):
  ◦ CO₂ > 1200ppm én geen ramen/deur open → actie nodig
  ◦ Geen onderhoud <12 mnd en wel recirculatie → actie nodig`,
      },
      {
        heading: 'Begrippen',
        body: `• Cohorteren: werken met vaste teams en vaste bewonersgroepen; zo min mogelijk wisselen tussen afdelingen/woonkamers
• Recirculatie: binnenlucht wordt deels hergebruikt
• PBM: persoonlijke beschermingsmiddelen`,
      },
      {
        heading: 'Privacy en data',
        body: `Geen persoonsgegevens worden gevraagd. Analyse is ruimte-gebaseerd. Resultaten gebruikt u binnen uw organisatie. Uw data wordt niet centraal opgeslagen.`,
      },
      {
        heading: 'Veelgestelde vragen',
        body: `• Kan ik de scan opslaan? Ja, download de PARAAT-resultaatkaart of e-mail deze naar uzelf.
• Wat als ik iets niet weet? Kies “Weet ik niet”. De uitkomst blijft bruikbaar; de Betrouwbaarheid daalt en er ontstaat een actiepunt.
• Meerdere ruimtes? Herhaal de PARAAT-scan per woonkamer.`,
      },
    ],
    start: 'Begin de PARAAT-scan',
  },
  en: {
    title: 'Manual - Pandemic Readiness Assessment & Action Tool (PARAAT)',
    sections: [
      {
        heading: 'Welcome!',
        body: `PARAAT (Pandemic Readiness Assessment & Action Tool) provides long-term care facility managers with a concrete course of action during an airborne pandemic. For each living room or other common area, you will receive a PARAAT score and a PARAAT results card with priorities.`,
      },
      {
        heading: 'About PARAAT',
        body: `• This tool was developed by Eindhoven University of Technology on behalf of TNO within P3Venti (Pandemic Preparedness and Ventilation Program).
• Based on scientific research and practical insights on the Covid-19 pandemic.
• The results serve as recommendations. There are often multiple suitable solutions.`,
      },
      {
        heading: 'What is it?',
        body: `PARAAT assesses the pandemic preparedness of a single room at your location. The results include:
• a PARAAT-score (0–100);
• a Reliability indicator;
• a PARAAT-results card with actions: Quickly to do, Investment, and Information.`,
      },
      {
        heading: 'For whom?',
        body: `For location managers in long-term care. The PARAAT-scan is practical and takes approximately 10 minutes per room.`,
      },
      {
        heading: 'What do you need before you start?',
        body: `• Surface area of the room (m²); an estimate is fine
• Number of people present at the same time (residents, visitors, staff)
• Information about the presence of windows, doors, and ventilation grilles
• Is there a CO₂ meter? If yes: maximum value during busy times
• Maintenance date of the ventilation system (within the last 12 months)
• Possibility for isolation (temporarily isolating someone in their room)
• Fixed teams & fixed resident groups
• Number of unstaffed shifts in the past 14 days`,
      },
      {
        heading: 'How does the PARAAT-scan work?',
        body: `• Select one room. Do you have multiple living rooms? Repeat the scan for each room.
• Answer 20 short questions in three blocks:
  ◦ People & use (who, how many, isolation, mixing)
  ◦ Space & air (m², 1.5 m possible, windows/vents, recirculation, CO₂, maintenance)
  ◦ Agreements & resources (instructions, PPE, services, permanent teams, budget)
• View the results. You will see the PARAAT-score, the Reliability, and the PARAAT-results card with actions in order of impact.
• Save or share the card (download/email) and plan the follow-up.`,
      },
      {
        heading: 'Results',
        body: `• PARAAT-score

  0–100; higher = better prepared.
• Reliability

  The reliability of this result depends on your input. We start at 100%. For each question where you answer "I don't know," the reliability decreases.

• PARAAT-result card (priorities)

  Actions are ranked by impact and effort. You start with actions that offer high impact and low effort. Each item is labeled:
  ◦ Quick adjustment
  ◦ Long-term adjustment
  ◦ Information`,
      },
      {
        heading: 'What does PARAAT measure?',
        body: `• Density: persons per m²
• Ventilation: open windows/doors, vents, CO₂ level, HVAC maintenance
• Organization: permanent teams/groups, unoccupied shifts (14 days), PPE, instructions
• Note: CO₂ is an indicator of ventilation and the amount of fresh air. The lower the CO₂, the more fresh air (= better); this is not a strict safety limit.`,
      },
      {
        heading: 'How is the advice formed?',
        body: `• Per question: classification good / medium / risk
• Weighing per block: People & use 22% · Space & air 59% · Agreements & resources 19%
• Safety rules (take precedence):
  ◦ CO₂ >1200ppm and no windows/doors open → action required
  ◦ No maintenance <12 months and recirculation → action required`,
      },
      {
        heading: 'Phrases',
        body: `• Cohorts: working with permanent teams and resident groups; switching between departments/living rooms as little as possible.
• Recirculation: indoor air is partially reused.
• PPE: personal protective equipment.`,
      },
      {
        heading: 'Privacy en data',
        body: `No personal data is requested. The analysis is space-based. You use the results within your organization.`,
      },
      {
        heading: 'Frequently asked questions',
        body: `• Can I save the scan? Yes, download the PARAAT-results card or e-mail it to yourself.
• What if I don't know something? Select "I don't know." The result remains usable; the Reliability decreases, and an action item is created.
• Multiple rooms? Repeat the PARAAT-scan for each living room`,
      },
    ],
    start: 'Start the PARAAT-scan',
  },
};

function renderInline(text) {
  const parts = text.split('**');
  return parts.map((seg, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{seg}</strong> : <span key={i}>{seg}</span>
  );
}

function SectionBody({ text }) {
  const lines = text.split('\n');

  const items = [];
  let paraBuffer = [];
  let list = [];
  let listSubOnly = [];
  let lastLi = null;

  const flushPara = () => {
    if (paraBuffer.length) {
      items.push(
        <p key={`p-${items.length}`} className="text-base text-justify mb-3" style={{ color: "#431325" }}>
          {renderInline(paraBuffer.join(' '))}
        </p>
      );
      paraBuffer = [];
    }
  };

  const flushTopList = () => {
    if (list.length) {
      items.push(
        <ul
          key={`ul-${items.length}`}
          className="list-disc ml-6 sm:ml-8 pl-2 space-y-1 text-slate-700"
        >
          {list.map((li, idx) => (
            <li key={`li-${idx}`}>
              <span>{renderInline(li.text)}</span>
              {li.sub && li.sub.length > 0 && (
                <ul className="list-[circle] ml-10 sm:ml-12 pl-2 space-y-1">
                  {li.sub.map((s, j) => (
                    <li key={`sub-${idx}-${j}`}>{renderInline(s)}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      );
      list = [];
      lastLi = null;
    }
  };

  const flushSubOnly = () => {
    if (listSubOnly.length) {
      items.push(
        <ul
          key={`subonly-${items.length}`}
          className="list-[circle] ml-10 sm:ml-12 pl-2 space-y-1 text-slate-700"
        >
          {listSubOnly.map((s, j) => (
            <li key={`solo-${j}`}>{renderInline(s)}</li>
          ))}
        </ul>
      );
      listSubOnly = [];
    }
  };

  const flushAllLists = () => {
    flushTopList();
    flushSubOnly();
  };

  lines.forEach((raw) => {
    const line = raw.replace(/\s+$/g, '');
    const t = line.trim();

    if (!t) {
      flushPara();
      flushAllLists();
      return;
    }

    if (t.startsWith('• ')) {
      flushPara();
      const text = t.slice(2);
      const liObj = { text, sub: [] };
      list.push(liObj);
      lastLi = liObj;
      return;
    }

    if (/^(◦|o)\s/.test(t)) {
      flushPara();
      const subText = t.replace(/^(◦|o)\s/, '');
      if (lastLi) {
        lastLi.sub.push(subText);
      } else {
        listSubOnly.push(subText);
      }
      return;
    }
        const indentMatch = line.match(/^(\t| {2,})(.*)$/);
    if (indentMatch) {
      flushPara();
      flushAllLists();
      const indentText = indentMatch[2];
      items.push(
        <p
          key={`indent-${items.length}`}
          className="text-slate-700 text-base text-justify mb-3 ml-5 sm:ml-6"
        >
          {renderInline(indentText)}
        </p>
      );
      return;
    }
    paraBuffer.push(t);
  });

  flushPara();
  flushAllLists();

  return <div>{items}</div>;
}

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
    <div
  className="min-h-screen flex flex-col items-center p-4 sm:p-8"
  style={{ backgroundColor: "#dfdfe0", color: "#431325" }}
>
      <div className="w-full max-w-7xl mx-auto">
        <header className="relative flex justify-between items-center w-full mb-8">
          <div className="flex justify-start items-center gap-2" style={{ flex: 1 }}>
            <button
              onClick={handleHomeClick}
              className="p-2 flex items-center gap-2 text-[#1f1f21] hover:text-[#1f1f21] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M12 21.75V12m0 0l-3.75 3.75M12 12l3.75 3.75M4.5 9.75v10.5a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5V9.75M8.25 21.75h7.5"
                />
              </svg>
              <span className="font-semibold hidden sm:inline">Home</span>
            </button>
            <button
              onClick={handleInfoClick}
              className="p-2 flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3m0 4h.01M12 21.75a9.75 9.75 0 100-19.5 9.75 9.75 0 000 19.5z"
                />
              </svg>
              <span className="font-semibold hidden sm:inline">Info</span>
            </button>
          </div>

          <div className="text-center" style={{ flex: 3 }}>
            <div className="flex justify-center items-center gap-x-3">
              <img src="/p3venti.png" alt="P3Venti Logo" className="h-12 lg:h-14" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: "#971547" }}>
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
                className="bg-white border-2 border-slate-300 rounded-lg py-2 px-4 text-base font-semibold text-[#1f1f21] focus:outline-none focus:ring-2 focus:ring-[#971547] transition-colors"
              >
                <option value="en">English</option>
                <option value="nl">Nederlands</option>
              </select>
            </div>
          </div>
        </header>
      </div>

      <div className="w-full max-w-4xl mx-auto flex-grow">
        <main className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center" style={{ color: "#431325" }}>
            {content.title}
          </h2>

          {content.sections.map((sec, i) => (
            <section key={i} className="mb-8">
              <h3 className="text-lg sm:text-xl font-semibold mb-3" style={{ color: "#431325" }}>
                {sec.heading}
              </h3>
              <SectionBody text={sec.body} />
            </section>
          ))}

          <div className="text-center mt-10">
            <button onClick={handleStart} className={STYLES.getStartedButton}>
              {content.start}
            </button>
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
