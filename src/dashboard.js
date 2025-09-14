import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SpacingDiagram, { getPositionsAndTheoreticalMax } from './spacingDiagram';
import { AnalysisRow, recommendations, scoringRules } from './recommendations';

const dashboardLayout = [
  { title: "Personal", questionIds: ['q4', 'q5', 'q6'] },
  { title: "Interaction", questionIds: ['q12', 'q14', 'q15', 'q16'] },
  { title: "Organizational", questionIds: ['q17', 'q18', 'q19', 'q20'] },
];

const translations = {
  en: {
    pageTitle: 'P3 Venti',
    pageSubtitle: 'For location managers in long-term care.',
    analysisTitle: 'Analysis per Category',
    totalScoresTitle: 'Total Scores of Analysis',
    totalExposureScoreLabel: 'Total Score of Protection against Exposure',
    totalValuesScoreLabel: 'Total Score of Values',
    visualizationTitle: 'Living Room Occupancy Visualization',
    startOver: 'Start Over',
    noSummaryTitle: 'No summary to display.',
    noSummaryText: 'Please start the action plan first.',
    goToStart: 'Go to Start',
    paraatScore: 'PARAAT Score',
    reliabilityScore: 'Reliability Score',
    topRecommendationsTitle: 'Top Recommendations',
    topRecommendationsText: 'Based on your results, focusing on improving ventilation and ensuring staff have up-to-date knowledge on infection prevention will have the highest impact on your pandemic readiness.',
    cardsTitle: 'Always keep in mind these factors when making changes',
    card1Title: 'Quality of life resident',
    card1Back: 'Well-being of the resident. Consists of several components that are important for that person to give a valuable meaning to their life. This also includes humanity, autonomy and comfort. This should be priority.',
    card2Title: 'Quality of work (work-life balance)',
    card2Back: 'There is a good work-life balance. The workload is not too high, both physically and mentally. The wishes of the employees are taken into account.',
    card3Title: 'Social contacts',
    card3Back: 'Social interactions are essential. This includes visits from family, friends and volunteers.',
    card4Title: 'Emotions',
    card4Back: 'The emotions of all involved must be taken into account. This includes a sense of safety and the absence of fear.',
    card5Title: 'Ethical Dilemma',
    card5Back: 'Ethical dilemmas can arise, especially in the event of a health crisis. It is important to discuss these with clients, family members, employees, and an ethically trained professional. Individual wishes must be identified, after which a joint decision can be made about what constitutes proportionate action.',
    card6Title: 'Support',
    card6Back: 'Support for a measure largely determines its implementation and effectiveness. This is strongly related to the organizational climate, i.e., the working atmosphere, risk perception, personal responsibility for mistakes, and previous experiences.',
    card7Title: 'Communication',
    card7Back: 'Good and clear communication is crucial, both between the facility and users and between the government and citizens. There must be room for the professional perspective of employees and the subjective perspective of the client and family members. Management must proactively communicate about measures and decisions.',
    card8Title: 'Participation',
    card8Back: 'Participation from clients, family members, and employees is crucial and must be guaranteed.',
    card9Title: 'Knowledge',
    card9Back: 'It is important to continuously improve knowledge of infection prevention measures. Good information is essential.',
    card10Title: 'Legislation & Regulations',
    card10Back: 'Monitor legislation and regulations within the field.',
    emailLabel: 'Email the report to me!',
    sendEmailButton: 'Send PDF to Email',
    downloadPdfButton: 'Download PDF Report',
  },
  nl: {
    pageTitle: 'P3 Venti',
    pageSubtitle: 'Voor locatiemanagers in de langdurige zorg.',
    analysisTitle: 'Analyse per Categorie',
    totalScoresTitle: 'Totale Scores van Analyse',
    totalExposureScoreLabel: 'Totaalscore Bescherming tegen Blootstelling',
    totalValuesScoreLabel: 'Totaalscore Waarden',
    visualizationTitle: 'Visualisatie Bezetting Woonkamer',
    startOver: 'Opnieuw Beginnen',
    noSummaryTitle: 'Geen overzicht om weer te geven.',
    noSummaryText: 'Start eerst het actieplan.',
    goToStart: 'Ga naar Start',
    paraatScore: 'PARAAT Score',
    reliabilityScore: 'Betrouwbaarheidsscore',
    topRecommendationsTitle: 'Topaanbevelingen',
    topRecommendationsText: 'Op basis van uw resultaten zal het focussen op het verbeteren van de ventilatie en het zorgen voor actuele kennis over infectiepreventie bij het personeel de grootste impact hebben op uw pandemische paraatheid.',
    cardsTitle: 'Houd bij het maken van veranderingen altijd rekening met deze factoren',
    card1Title: 'Kwaliteit van leven bewoner',
    card1Back: 'Welzijn van de bewoner. Bestaat uit verschillende componenten die voor die persoon belangrijk zijn om een waardevolle invulling aan zijn leven te geven. Dit omvat ook menselijkheid, autonomie en comfort. Dit zou prioriteit moeten hebben.',
    card2Title: 'Kwaliteit van werk (werk-privébalans)',
    card2Back: 'Er is een goede werk-privébalans. De werkdruk is niet te hoog, zowel fysiek als mentaal. Er wordt rekening gehouden met de wensen van de medewerkers.',
    card3Title: 'Sociale contacten',
    card3Back: 'Sociale interacties zijn essentieel. Dit omvat bezoeken van familie, vrienden en vrijwilligers.',
    card4Title: 'Emoties',
    card4Back: 'Er moet rekening gehouden worden met de emoties van alle betrokkenen. Dit omvat een gevoel van veiligheid en de afwezigheid van angst.',
    card5Title: 'Ethisch dilemma',
    card5Back: 'Ethische dilemma\'s kunnen ontstaan, vooral in het geval van een gezondheidscrisis. Het is belangrijk om deze te bespreken met cliënten, familieleden, medewerkers en een ethisch geschoolde professional. Individuele wensen moeten worden geïnventariseerd, waarna een gezamenlijk besluit kan worden genomen over wat proportioneel handelen inhoudt.',
    card6Title: 'Ondersteuning',
    card6Back: 'Ondersteuning voor een maatregel bepaalt grotendeels de implementatie en effectiviteit ervan. Dit hangt sterk samen met het organisatieklimaat, d.w.z. de werksfeer, risicoperceptie, persoonlijke verantwoordelijkheid voor fouten en eerdere ervaringen.',
    card7Title: 'Communicatie',
    card7Back: 'Goede en duidelijke communicatie is cruciaal, zowel tussen de instelling en gebruikers als tussen de overheid en burgers. Er moet ruimte zijn voor het professionele perspectief van medewerkers en het subjectieve perspectief van de cliënt en familieleden. Het management moet proactief communiceren over maatregelen en beslissingen.',
    card8Title: 'Participatie',
    card8Back: 'Participatie van cliënten, familieleden en medewerkers is cruciaal en moet worden gegarandeerd.',
    card9Title: 'Kennis',
    card9Back: 'Het is belangrijk om de kennis van infectiepreventiemaatregelen voortdurend te verbeteren. Goede informatie is essentieel.',
    card10Title: 'Wet- & regelgeving',
    card10Back: 'Monitor de wet- en regelgeving binnen het vakgebied.',
    emailLabel: 'Uw e-mail:',
    sendEmailButton: 'Stuur PDF naar e-mail',
    downloadPdfButton: 'Download PDF-rapport',
  }
};

const reliabilityWeights = {
  q1: 0.05, q2: 0, q3: 0.05, q4: 0.07, q5: 0.05,
  q6: 0.03, q7: 0.03, q8: 0.07, q9: 0.05, q10: 0.05,
  q11: 0.07, q12: 0.07, q13: 0.03, q14: 0.07, q15: 0.07,
  q16: 0.05, q17: 0.03, q18: 0.05, q19: 0.03, q20: 0.05,
  q21: 0.03
};

/* ------------------------------- FlipCard ---------------------------------- */
const FlipCard = ({ id, frontContent, backContent, isFlipped, onEnter, onLeave }) => {
  const handleMouseEnter = () => onEnter?.(id);
  const handleMouseLeave = () => onLeave?.(id);

  return (
    <div
      className="w-48 h-36 md:w-56 md:h-40 perspective-1000 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`w-full h-full relative transition-transform duration-700 ease-in-out transform-style-preserve-3d rounded-xl shadow-lg ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center rounded-xl p-4 text-center font-bold text-base">
          {frontContent}
        </div>
        {/* Back */}
        <div className="absolute w-full h-full backface-hidden bg-white text-slate-700 flex flex-col justify-center rounded-xl p-4 text-left text-sm rotate-y-180 border-t-4 border-indigo-500 overflow-hidden">
          <p className="overflow-y-auto">{backContent}</p>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------- FancyParaatDial ----------------------------- */
const FancyParaatDial = ({ score, label }) => {
  const v = Math.max(0, Math.min(100, Math.round(score)));
  const uid = useMemo(() => Math.random().toString(36).slice(2), []);
  const gradId = `grad-${uid}`;

  const trackRef = useRef(null);
  const [arcLen, setArcLen] = useState(0);
  useEffect(() => {
    if (trackRef.current) setArcLen(trackRef.current.getTotalLength());
  }, []);
  const progressLen = (v / 100) * arcLen;
  const strokeDasharray = `${arcLen} ${arcLen}`;
  const strokeDashoffset = arcLen - progressLen;

  return (
    <div className="flex flex-col items-center select-none p-6 bg-white rounded-2xl shadow-xl">
      <svg viewBox="0 0 100 60" className="w-80 h-auto">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={`url(#${gradId})`} strokeWidth="12" strokeLinecap="round" opacity="0.3" />

        {/* Hidden path for length */}
        <path ref={trackRef} d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" style={{ display: 'none' }} />

        {/* Progress */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="12"
          strokeLinecap="round"
          style={{ strokeDasharray, strokeDashoffset, transition: 'stroke-dashoffset 700ms cubic-bezier(.22,.61,.36,1)' }}
        />

        <text x="50" y="40" textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="800" className="fill-slate-800">
          {v}
        </text>
      </svg>
      <div className="mt-4 text-xl font-bold text-slate-800 text-center">{label}</div>
    </div>
  );
};

/* --------------------------- ReliabilityScoreBar --------------------------- */
const ReliabilityScoreBar = ({ score, label }) => {
  const v = Math.max(0, Math.min(100, Math.round(score)));
  const getScoreColorClass = (value) => (value < 33 ? 'text-red-500' : value < 66 ? 'text-amber-500' : 'text-green-500');
  const scoreColorClass = getScoreColorClass(v);
  const gradientStyle = { background: 'linear-gradient(to right, #ef4444, #f59e0b, #22c55e)' };

  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-white rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-semibold text-slate-700">{label}</h3>
        <span className={`text-lg font-bold ${scoreColorClass}`}>{v}%</span>
      </div>
      <div className="relative w-full h-5 rounded-full overflow-hidden">
        <div className="absolute inset-0 w-full h-full opacity-25 rounded-full" style={gradientStyle}></div>
        <div className="relative h-full rounded-full overflow-hidden" style={{ width: `${v}%`, transition: 'width 700ms cubic-bezier(.22,.61,.36,1)' }}>
          <div className="absolute inset-0 h-full rounded-full" style={{ width: `${100 * 100 / Math.max(v, 1)}%`, background: 'linear-gradient(to right, #ef4444, #f59e0b, #22c55e)' }}></div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------- Dashboard -------------------------------- */
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const params = new URLSearchParams(location.search);
  const initialLang = params.get('lang') || 'nl'; // Read lang from URL
   const [language, setLanguage] = useState(initialLang);

  const { answers = {}, content: questions = {} } = location.state || {};

  const [flippedCards, setFlippedCards] = useState(new Array(10).fill(false));
  const unflipTimers = useRef({}); // { [index]: timeoutId }

  const content = translations[language];

  // Parent-controlled hover behavior
  const onCardEnter = (id) => {
    const t = unflipTimers.current[id];
    if (t) {
      clearTimeout(t);
      delete unflipTimers.current[id];
    }
    // Flip ONLY the hovered card
    setFlippedCards(prev => prev.map((_, idx) => idx === id));
  };

  const onCardLeave = (id) => {
    // Schedule unflip for this card after 1s
    const existing = unflipTimers.current[id];
    if (existing) clearTimeout(existing);
    unflipTimers.current[id] = setTimeout(() => {
      setFlippedCards(prev => {
        const next = [...prev];
        next[id] = false;
        return next;
      });
      delete unflipTimers.current[id];
    }, 1000);
  };

  // Auto flip the first card twice with a 1s pause after the first close
  useEffect(() => {
    const tids = [];

    const flipIndex = (idx, val) => {
      if (idx === 0 && unflipTimers.current[idx]) {
        clearTimeout(unflipTimers.current[idx]);
        delete unflipTimers.current[idx];
      }
      setFlippedCards(curr => {
        const next = [...curr];
        next[idx] = val;
        return next;
      });
    };

    // Flip 1 — open at 0.5s, close at 1.5s
    tids.push(setTimeout(() => flipIndex(0, true), 500));
    tids.push(setTimeout(() => flipIndex(0, false), 1500));

    // Pause 1s → second flip open at 2.5s, close at 3.5s
    // tids.push(setTimeout(() => flipIndex(0, true), 2500));
    // tids.push(setTimeout(() => flipIndex(0, false), 3500));

    return () => tids.forEach(clearTimeout);
  }, []);

  const handleRestart = () => navigate(`/tool?lang=${language}`);
  const handleHomeClick = () => navigate('/');

  const safeSpaceData = useMemo(() => {
    const shapeMap = { 0: 'Rectangle', 1: 'Circle', 2: 'Oval', 3: 'L-Shape' };
    const shape = shapeMap[answers['q8']] || 'Rectangle';
    const area = answers['q7'] || 50;
    let dims = {};

    switch (shape) {
      case 'Circle': {
        const radius = Math.sqrt(area / Math.PI);
        dims = { diameter: radius * 2 };
        break;
      }
      case 'Oval': {
        const minor_axis = Math.sqrt((2 * area) / Math.PI);
        dims = { major_axis: 2 * minor_axis, minor_axis: minor_axis };
        break;
      }
      case 'L-Shape': {
        const legArea = area / 2;
        const legWidth = Math.sqrt(legArea / 2);
        dims = { l1_len: legWidth * 2, l1_wid: legWidth, l2_len: legWidth * 2, l2_wid: legWidth };
        break;
      }
      default: {
        const side_length = Math.sqrt(area);
        dims = { length: side_length, width: side_length };
      }
    }

    const socialDistance = answers['q9'] || 1.5;
    const windowsDoors = answers['q10'] || 2;
    const ventGrates = answers['q11'] || 1;
    const airRecirc = (answers['q12'] === 0);
    const usablePercent = 75;

    const { positions, fullTheoretical } = getPositionsAndTheoreticalMax(shape, dims, socialDistance);

    const geometricCapacity = Math.floor(fullTheoretical * usablePercent / 100);
    const ventScore = Math.min((windowsDoors + ventGrates) / 20, 1);
    const recircPen = airRecirc ? 0.2 : 0;
    const riskPct = (1 - ventScore) * 50 + recircPen * 50;
    const ventilationDerate = 1 - (riskPct / 100) * 0.3;
    const ventilationCapacity = Math.max(1, Math.floor(geometricCapacity * ventilationDerate));

    const capacityMax = geometricCapacity;
    const limiting = 'geometry';
    const roomArea = answers['q7'] || 50;

    const shuffledPositions = [...positions].sort(() => 0.5 - Math.random());
    const peopleToDraw = shuffledPositions.slice(0, Math.min(capacityMax, positions.length));

    return {
      shape,
      dims,
      people: peopleToDraw,
      socialDistance,
      color: '#22c55e',
      meta: { geometricCapacity, ventilationCapacity, capacityMax, limiting, roomArea, usablePercent }
    };
  }, [answers]);

  const analysisData = useMemo(() => {
    const normalizeScore = (score) => (score / 5) * 100;

    if (Object.keys(answers).length === 0) {
      return dashboardLayout.map(row => ({ title: row.title, score1: 0, score2: 0, recommendations: [] }));
    }

    const getScore = (type, qId, aIdx) => (scoringRules[qId]?.[type]?.[aIdx] ?? 0);

    return dashboardLayout.map(row => {
      let totalValueScore = 0;
      let totalRiskScore = 0;
      let recommendationsList = [];

      row.questionIds.forEach(id => {
        const answerIndex = answers[id];
        if (answerIndex !== undefined) {
          totalValueScore += getScore('values', id, answerIndex);
          totalRiskScore += getScore('risk', id, answerIndex);
          const rec = recommendations[language]?.[id]?.[answerIndex];
          if (rec) recommendationsList.push(rec);
        }
      });

      const avgValueScore = row.questionIds.length > 0 ? totalValueScore / row.questionIds.length : 0;
      const avgRiskScore = row.questionIds.length > 0 ? totalRiskScore / row.questionIds.length : 0;

      return { title: row.title, score1: normalizeScore(avgValueScore), score2: normalizeScore(avgRiskScore), recommendations: recommendationsList };
    });
  }, [answers, language]);

  const { totalScoreValues, totalScoreExposure } = useMemo(() => {
    if (analysisData.length === 0) return { totalScoreValues: 0, totalScoreExposure: 0 };
    const totalValuesRaw = analysisData.reduce((acc, item) => acc + item.score1, 0) / analysisData.length;
    const totalExposureRaw = analysisData.reduce((acc, item) => acc + item.score2, 0) / analysisData.length;
    return { totalScoreValues: totalValuesRaw, totalScoreExposure: totalExposureRaw };
  }, [analysisData]);

  const paraatScore = useMemo(() => {
    const protectionScore = 100 - totalScoreExposure;
    return (protectionScore + totalScoreValues) / 2;
  }, [totalScoreExposure, totalScoreValues]);

  const reliabilityScore = useMemo(() => {
    if (Object.keys(answers).length === 0) return 0;

    let currentReliability = 1;
    const allQuestions = Object.values(questions).flat();

    allQuestions.forEach(question => {
      if (question.type === 'slider') return;
      const answerIndex = answers[question.id];
      const iDontKnowIndex = question.answerOptions.length - 1;
      if (answerIndex === iDontKnowIndex) currentReliability -= reliabilityWeights[question.id] || 0;
    });

    return Math.max(0, currentReliability * 100);
  }, [answers, questions]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
            <header className="relative flex justify-between items-center w-full mb-8">
                <div className="flex justify-start" style={{ flex: 1 }}>
                    <button onClick={handleHomeClick} className="p-2 flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M12 21.75V12m0 0l-3.75 3.75M12 12l3.75 3.75M4.5 9.75v10.5a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5V9.75M8.25 21.75h7.5" />
                        </svg>
                        <span className="font-semibold">Home</span>
                    </button>
                </div>

                <div className="text-center" style={{ flex: 3 }}>
                    <div className="flex justify-center items-center gap-x-3">
                        <img src="/p3venti.png" alt="P3Venti Logo" className="h-12 lg:h-14" />
                        <h1 className="text-2xl lg:text-1xl font-bold text-indigo-600">Pandemic Readiness Assessment & Action Tool (PARAAT)</h1>
                    </div>
                    <p className="text-slate-500 mt-2 text-base font-medium">{content.pageSubtitle}</p>
                </div>

                <div className="flex justify-end items-center" style={{ flex: 1 }}>
                    <div className="hidden lg:block">
                        <select
                            onChange={e => setLanguage(e.target.value)}
                            value={language}
                            className="bg-white border-2 border-slate-300 rounded-lg py-2 px-4 text-base font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                        >
                            <option value="en">English</option>
                            <option value="nl">Nederlands</option>
                        </select>
                    </div>
                </div>
            </header>

            <div className="flex flex-col items-center justify-center space-y-4 mb-8">
  <div className="w-full max-w-md">
    {/* Small title-style label on top */}
    <label
      htmlFor="email"
      className="block text-s uppercase tracking-wide font-semibold text-slate-700 mb-1"
    >
      {content.emailLabel}
    </label>

    {/* Email input + compact send button on one row */}
    <div className="flex items-center gap-2">
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                   focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        placeholder="Enter your email here"
      />
      <button
        onClick={() => console.log('Send email to:', email)}
        className="shrink-0 text-sm px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
      >
        {content.sendEmailButton}
      </button>
    </div>
  </div>

  {/* Download button under the row */}
  <div className="w-full max-w-md">
    <button
      onClick={() => console.log('Downloading PDF...')}
      className="text-sm px-3 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white transition-colors"
    >
      {content.downloadPdfButton}
    </button>
  </div>
</div>

        </div>

        <div className="max-w-9xl mx-auto">
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-8">
                <FancyParaatDial score={paraatScore} label={content.paraatScore} />
                <div className="text-center max-w-sm p-6 bg-white rounded-2xl shadow-xl">
                    <h3 className="text-xl font-bold text-slate-800 mb-3">{content.topRecommendationsTitle}</h3>
                    <p className="text-slate-600 leading-relaxed">{content.topRecommendationsText}</p>
                </div>
            </div>

            <div className="flex justify-center mb-12">
                <ReliabilityScoreBar score={reliabilityScore} label={content.reliabilityScore} />
            </div>

            {/* Flip Cards Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">{content.cardsTitle}</h2>
                <div className="flex flex-col items-center gap-6">
                    {/* First Row */}
                    <div className="flex flex-wrap justify-center gap-6">
                        {[...Array(5)].map((_, i) => (
                            <FlipCard
                                key={`card-${i + 1}`}
                                id={i}
                                frontContent={content[`card${i + 1}Title`]}
                                backContent={content[`card${i + 1}Back`]}
                                isFlipped={flippedCards[i]}
                                onEnter={onCardEnter}
                                onLeave={onCardLeave}
                            />
                        ))}
                    </div>
                    {/* Second Row */}
                    <div className="flex flex-wrap justify-center gap-6">
                        {[...Array(5)].map((_, i) => (
                            <FlipCard
                                key={`card-${i + 6}`}
                                id={i + 5}
                                frontContent={content[`card${i + 6}Title`]}
                                backContent={content[`card${i + 6}Back`]}
                                isFlipped={flippedCards[i + 5]}
                                onEnter={onCardEnter}
                                onLeave={onCardLeave}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">{content.analysisTitle}</h1>

            <div className="space-y-6 mb-12">
                {analysisData.map(data => (
                    <AnalysisRow key={data.title} title={data.title} score1={data.score1} score2={data.score2} recommendations={data.recommendations} />
                ))}
            </div>

            <div className="mt-12">
                <SpacingDiagram {...safeSpaceData} visualizationTitle={content.visualizationTitle} />
            </div>

            <div className="text-center mt-12">
                <button onClick={handleRestart} className="bg-blue-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-md">
                    {content.startOver || 'Start Over'}
                </button>
            </div>
        </div>
    </div>
  );
}