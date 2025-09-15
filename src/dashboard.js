import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SpacingDiagram, { getPositionsAndTheoreticalMax } from './spacingDiagram';
import { AnalysisRow, recommendations, scoringRules, topRecommendationsData } from './recommendations';
import { downloadDashboardFullPDF } from "./DownloadPDF";

const dashboardLayout = [
  { title: "People & Use", questionIds: ['q1','q2','q3', 'q4', 'q5'], totalWeight: 0.22 },
  { title: "Space & Air", questionIds: ['q6','q7','q8','q9','q10','q11','q12','q13', 'q14', 'q15', 'q16'], totalWeight: 0.59 },
  { title: "Agreements & Resources", questionIds: ['q17', 'q18', 'q19', 'q20', 'q21'], totalWeight: 0.19 },
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
    noRecommendations: "No high-priority recommendations based on your answers.",
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
    noRecommendations: "Geen aanbevelingen met hoge prioriteit op basis van uw antwoorden.",
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
    card9Back: 'Het is belangrijk om de kennis van infectiepreventiemaatregelegen voortdurend te verbeteren. Goede informatie is essentieel.',
    card10Title: 'Wet- & regelgeving',
    card10Back: 'Monitor de wet- en regelgeving binnen het vakgebied.',
    emailLabel: 'Uw e-mail:',
    sendEmailButton: 'Stuur PDF naar e-mail',
    downloadPdfButton: 'Download PDF-rapport',
  }
};

const PRIORITY_ARRAY = [
  "q14", "q12", "q15", "q8",  "q4",  "q11", "q1",  "q3",  "q10",
  "q9",  "q20", "q5",  "q18", "q16", "q19", "q6",  "q7",
  "q13", "q21", "q17", "q2"
];

const TopRecommendations = ({ userAnswers, content, language }) => {
    // 1. Define the conditions for removing questions from the priority queue.
    const questionsToRemoveOnIndexZero = ["q4", "q8", "q14", "q15", "q18", "q19", "q21"];

    // 2. Filter the PRIORITY_ARRAY based on the user's answers.
    const remainingPriorityQueue = PRIORITY_ARRAY.filter(questionId => {
        const answerIndex = userAnswers[questionId];

        // Specific rule for q12. If answer is index 1 ("No"), it's a good answer, so remove it.
        if (questionId === "q12" && answerIndex === 1) {
            return false; // Remove from queue
        }

        // Rule for the general list of questions. If answer is index 0 (best answer), remove it.
        if (questionsToRemoveOnIndexZero.includes(questionId) && answerIndex === 0) {
            return false; // Remove from queue
        }

        // If no removal conditions are met, keep the question in the queue.
        return true;
    });

    // 3. Get the top 5 question IDs from the filtered queue.
    const top5QuestionIds = remainingPriorityQueue.slice(0, 5);

    // 4. Retrieve the recommendation string for each of the top 5 questions.
    const top5Recommendations = top5QuestionIds
        .map(questionId => topRecommendationsData[language]?.[questionId])
        .filter(Boolean); // Filter out any undefined recommendations

    if (top5Recommendations.length > 0) {
        return (
            <ul className="list-decimal pl-5 space-y-3">
                {top5Recommendations.map((rec, index) => (
                    <li key={index} className="font-semibold text-slate-700">
                        {rec}
                    </li>
                ))}
            </ul>
        );
    }
    
    return <p className="text-slate-600 text-center">{content.noRecommendations}</p>;
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
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center rounded-xl p-4 text-center font-bold text-base">
          {frontContent}
        </div>
        <div className="absolute w-full h-full backface-hidden bg-white text-slate-700 flex flex-col justify-center rounded-xl p-4 text-left text-sm rotate-y-180 border-t-4 border-indigo-500 overflow-hidden">
          <p className="overflow-y-auto">{backContent}</p>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------- FancyParaatDial ----------------------------- */
const FancyParaatDial = ({ score, label }) => {
  const v = Math.max(0, Math.min(100, Math.round(score || 0)));
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
        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={`url(#${gradId})`} strokeWidth="12" strokeLinecap="round" opacity="0.3" />
        <path ref={trackRef} d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" style={{ display: 'none' }} />
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
  const v = Math.max(0, Math.min(100, Math.round(score || 0)));
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
          <div className="absolute inset-0 h-full rounded-full" style={{ width: `${100 * 100 / Math.max(v, 1)}%`, ...gradientStyle }}></div>
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
  const initialLang = params.get('lang') || 'nl';
  const [language, setLanguage] = useState(initialLang);

  const { answers = {}, content: questionsData = {} } = location.state || {};

  const [flippedCards, setFlippedCards] = useState(new Array(10).fill(false));
  const unflipTimers = useRef({});

  const content = translations[language];
  const userAnswers = location.state?.answers || {};

  // const handleDownloadPdf = async () => {
  //   // 1. Prepare the data for the PDF
  //   const pdfData = {
  //     paraatScore: Math.round(overallParaatScore),
  //     topRecommendations: new TopRecommendations({ userAnswers, content, language }).props.children.props.children.map(child => child.props.children),
  //     factors: [
  //       { title: content.card1Title, text: content.card1Back },
  //       { title: content.card2Title, text: content.card2Back },
  //       { title: content.card3Title, text: content.card3Back },
  //       { title: content.card4Title, text: content.card4Back },
  //       { title: content.card5Title, text: content.card5Back },
  //       { title: content.card6Title, text: content.card6Back },
  //       { title: content.card7Title, text: content.card7Back },
  //       { title: content.card8Title, text: content.card8Back },
  //       { title: content.card9Title, text: content.card9Back },
  //       { title: content.card10Title, text: content.card10Back }
  //     ],
  //     categories: analysisData.map(category => ({
  //       title: category.title,
  //       score: Math.round(category.paraatScore),
  //       reliability: Math.round(category.reliabilityScore)
  //     }))
  //   };

  //   try {
  //     // 2. Send the data to your backend API
  //     const response = await fetch('http://localhost:10000/generate-pdf', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(pdfData),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     // 3. Handle the PDF response from the server
  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = "PARAAT-Report.pdf";
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     window.URL.revokeObjectURL(url);

  //   } catch (error) {
  //     console.error('Error downloading the PDF:', error);
  //     // You could show an error message to the user here
  //   }
  // };


  const onCardEnter = (id) => {
    const t = unflipTimers.current[id];
    if (t) clearTimeout(t);
    delete unflipTimers.current[id];
    setFlippedCards(prev => prev.map((_, idx) => idx === id));
  };

  const onCardLeave = (id) => {
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
  
  const handleRestart = () => navigate(`/tool?lang=${language}`);
  const handleHomeClick = () => navigate('/');
  
  const allQuestions = useMemo(() => {
    return questionsData && questionsData.questionSets ? Object.values(questionsData.questionSets).flat() : [];
  }, [questionsData]);

  const analysisData = useMemo(() => {
    const normalizeScore = (score) => (score / 5) * 100;

    if (!answers || Object.keys(answers).length === 0) {
      return dashboardLayout.map(row => ({
        title: row.title, paraatScore: 0, reliabilityScore: 100, recommendations: []
      }));
    }

    const getScore = (type, qId, aIdx) => scoringRules[qId]?.[type]?.[aIdx] ?? 0;

    return dashboardLayout.map(row => {
      let totalValueScore = 0;
      let totalRiskScore = 0;
      let recommendationsList = [];
      let reliabilityDeduction = 0;
      let answeredQuestions = 0;

      row.questionIds.forEach(id => {
        const answerIndex = answers[id];
        const question = allQuestions.find(q => q && q.id === id);

        if (answerIndex !== undefined && question) {
          answeredQuestions++;
          totalValueScore += getScore('values', id, answerIndex);
          totalRiskScore += getScore('risk', id, answerIndex);
          
          const rec = recommendations[language]?.[id]?.[answerIndex];
          if (rec) recommendationsList.push(rec);

          const iDontKnowIndex = question.answerOptions ? question.answerOptions.length - 1 : -1;
          if (answerIndex === iDontKnowIndex) {
            reliabilityDeduction += reliabilityWeights[id] || 0;
          }
        }
      });

      const avgValueScore = answeredQuestions > 0 ? totalValueScore / answeredQuestions : 0;
      const avgRiskScore = answeredQuestions > 0 ? totalRiskScore / answeredQuestions : 0;

      const normalizedValueScore = normalizeScore(avgValueScore);
      const normalizedRiskScore = normalizeScore(avgRiskScore);

      const protectionScore = 100 - normalizedRiskScore;
      const paraatScore = (protectionScore + normalizedValueScore) / 2;
      
      const categoryBaseReliability = row.totalWeight;
      const finalCategoryReliability = ((categoryBaseReliability - reliabilityDeduction) / categoryBaseReliability) * 100;

      return {
        title: row.title,
        paraatScore: isNaN(paraatScore) ? 0 : paraatScore,
        reliabilityScore: isNaN(finalCategoryReliability) ? 0 : Math.max(0, finalCategoryReliability),
        recommendations: recommendationsList
      };
    });
  }, [answers, language, allQuestions]);

  const { totalScoreValues, totalScoreExposure } = useMemo(() => {
    const normalizeScore = (score) => (score / 5) * 100;
    
    if (!answers || allQuestions.length === 0) {
        return { totalScoreValues: 0, totalScoreExposure: 0 };
    }
    
    let totalValue = 0;
    let totalRisk = 0;
    let answeredCount = 0;
    const getScore = (type, qId, aIdx) => scoringRules[qId]?.[type]?.[aIdx] ?? 0;

    allQuestions.forEach(q => {
        if(q) {
            const answerIndex = answers[q.id];
            if (answerIndex !== undefined) {
                answeredCount++;
                totalValue += getScore('values', q.id, answerIndex);
                totalRisk += getScore('risk', q.id, answerIndex);
            }
        }
    });

    const avgValue = answeredCount > 0 ? totalValue / answeredCount : 0;
    const avgRisk = answeredCount > 0 ? totalRisk / answeredCount : 0;

    return {
        totalScoreValues: normalizeScore(avgValue),
        totalScoreExposure: normalizeScore(avgRisk)
    };
}, [answers, allQuestions]);

  const overallParaatScore = useMemo(() => {
    const protectionScore = 100 - totalScoreExposure;
    const score = (protectionScore + totalScoreValues) / 2;
    return isNaN(score) ? 0 : score;
  }, [totalScoreExposure, totalScoreValues]);

  const overallReliabilityScore = useMemo(() => {
    if (!answers || allQuestions.length === 0) return 0;

    let currentReliability = 1;
    allQuestions.forEach(question => {
      if (!question || typeof question !== 'object' || !question.answerOptions) return;
      const answerIndex = answers[question.id];
      const iDontKnowIndex = question.answerOptions.length - 1;
      if (answerIndex === iDontKnowIndex) {
        currentReliability -= reliabilityWeights[question.id] || 0;
      }
    });
    return Math.max(0, currentReliability * 100);
  }, [answers, allQuestions]);
  
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
    const { positions, fullTheoretical } = getPositionsAndTheoreticalMax(shape, dims, socialDistance);
    const usablePercent = 75;
    const geometricCapacity = Math.floor(fullTheoretical * usablePercent / 100);

    return {
      shape,
      dims,
      people: positions.slice(0, Math.min(geometricCapacity, positions.length)),
      socialDistance,
      color: '#22c55e',
      meta: { geometricCapacity, roomArea: area, usablePercent }
    };
  }, [answers]);

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
                    <label
                    htmlFor="email"
                    className="block text-s uppercase tracking-wide font-semibold text-slate-700 mb-1"
                    >
                    {content.emailLabel}
                    </label>
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
                <div className="w-full max-w-md">
                    <button
  onClick={() =>
    downloadDashboardFullPDF({
      language,
      content,
      userAnswers,
      overallParaatScore,
      overallReliabilityScore,
      analysisData,
      safeSpaceData,
      filename: "PARAAT_dashboard.pdf",
    })
  }
  className="text-sm px-3 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white transition-colors"
>
  {content.downloadPdfButton}
</button>
                </div>
            </div>
        </div>

        <div className="max-w-9xl mx-auto">
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-8">
                <FancyParaatDial score={overallParaatScore} label={content.paraatScore} />
                <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center">{content.topRecommendationsTitle}</h3>
                    <TopRecommendations userAnswers={userAnswers} content={content} language={language} />
                </div>
            </div>

            <div className="flex justify-center mb-12">
                <ReliabilityScoreBar score={overallReliabilityScore} label={content.reliabilityScore} />
            </div>

            <div className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">{content.cardsTitle}</h2>
                <div className="flex flex-col items-center gap-6">
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
                    <AnalysisRow 
                        key={data.title} 
                        title={data.title} 
                        paraatScore={data.paraatScore} 
                        reliabilityScore={data.reliabilityScore} 
                        recommendations={data.recommendations} 
                    />
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