import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SpacingDiagram, { getPositionsAndTheoreticalMax } from './spacingDiagram';
import { AnalysisRow, recommendations, scoringRules, topRecommendationsData } from './recommendations';
import { downloadDashboardFullPDF } from "./DownloadPDF";
import { sendDashboardSummaryEmail } from "./emailService";

const DEFAULT_USABLE_SPACE_PERCENT = 60;

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
    emailPlaceholder: 'Enter your email here',
    sendEmailButton: 'Send PDF to Email',
    sendingEmailButton: 'Sending…',
    emailRequiredMessage: 'Please enter an email address.',
    emailInvalidMessage: 'Please enter a valid email address.',
    emailSendingMessage: 'Sending email…',
    emailSuccessMessage: 'Dashboard PDF sent to your inbox!',
    emailErrorMessage: 'Could not send email:',
    emailGenericError: 'Something went wrong while sending the email. Please try again later.',
    emailNetworkErrorMessage: 'We could not reach the email service. Please check your connection or try again later.',
    emailServerErrorMessage: 'The email service responded with status {status}. Please try again later.',
    emailReferenceLabel: 'reference',
    downloadPdfButton: 'Download PDF Report',
    categoryNames: {
      personal: 'People & Use',
      interaction: 'Space & Air',
      organizational: 'Agreements & Resources'
    },
    recHeaderQuick: 'Quick to do',
    recHeaderInvestment: 'Investment',
    recHeaderInformation: 'Information',
    maxPeopleLabel: 'Max people',
    geometryLimitedLabel: 'Geometry-limited',
    ventilationLimitedLabel: 'Ventilation-limited',
    roomAreaLabel: 'Room area',
    usableAreaLabel: 'Usable area (packing)',
    socialDistanceLabel: 'Social distance',
  },
  nl: {
    pageTitle: 'P3 Venti',
    pageSubtitle: 'Voor locatiemanagers in de langdurige zorg.',
    analysisTitle: 'Analyse per Categorie',
    totalScoresTitle: 'Totale Scores van Analyse',
    totalExposureScoreLabel: 'Totaalscore Bescherming tegen Blootstelling',
    totalValuesScoreLabel: 'Totaalscore Waarden',
    visualizationTitle: 'Bezetting van de woonkamer',
    startOver: 'Opnieuw beginnen',
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
    emailPlaceholder: 'Vul hier uw e-mailadres in',
    sendEmailButton: 'Stuur PDF naar e-mail',
    sendingEmailButton: 'Bezig met verzenden…',
    emailRequiredMessage: 'Vul een e-mailadres in.',
    emailInvalidMessage: 'Vul een geldig e-mailadres in.',
    emailSendingMessage: 'E-mail wordt verzonden…',
    emailSuccessMessage: 'Dashboard-PDF is verzonden naar uw inbox!',
    emailErrorMessage: 'Kon e-mail niet verzenden:',
    emailGenericError: 'Er is iets misgegaan bij het versturen van de e-mail. Probeer het later opnieuw.',
    emailNetworkErrorMessage: 'We konden de e-mailservice niet bereiken. Controleer uw verbinding of probeer het later opnieuw.',
    emailServerErrorMessage: 'De e-mailservice gaf status {status} terug. Probeer het later opnieuw.',
    emailReferenceLabel: 'referentie',
    downloadPdfButton: 'Download PDF-rapport',
    categoryNames: {
      personal: 'Mensen & gebruik',
      interaction: 'Ruimte & lucht',
      organizational: 'Afspraken & middelen'
    },
    recHeaderQuick: 'Snel te doen',
    recHeaderInvestment: 'Investering',
    recHeaderInformation: 'Informatie',
    maxPeopleLabel: 'Maximum aantal mensen',
    geometryLimitedLabel: 'Gebaseerd op beschikbare ruimte',
    ventilationLimitedLabel: 'Gebaseerd op ventilatie',
    roomAreaLabel: 'Grootte van de ruimte',
    usableAreaLabel: 'Bruikbare ruimte',
    socialDistanceLabel: 'Afstand tussen mensen',
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

const FactorCardButton = ({ id, label, isActive, onSelect }) => {
  const handleSelect = () => onSelect?.(id);

  return (
    <button
      type="button"
      onClick={handleSelect}
      className={`flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 text-center flex items-center justify-center px-3 uppercase text-[10px] sm:text-xs font-semibold tracking-wide transition-all duration-300 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${
      isActive
        ? 'bg-blue-500 text-white border-blue-500 shadow-2xl ring-4 ring-blue-200 scale-105'
        : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:shadow-2xl hover:scale-105'}`}
      aria-pressed={isActive}
    >
      <span className="leading-tight">{label}</span>
    </button>
  );
};

const ExpandedFactorCard = ({ title, description }) => (
  <div className="w-full max-w-4xl mx-auto bg-white border border-gray-300 rounded-2xl shadow-2xl p-6 md:p-8 transition-all duration-500">
    <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-wide text-center md:text-left">{title}</h3>
    <p className="mt-4 text-slate-700 leading-relaxed text-sm md:text-base whitespace-pre-line">
      {description}
    </p>
  </div>
);

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
    <div className="flex flex-col items-center select-none">
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
    <div className="w-80">
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
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ type: 'idle', message: '' });
  const emailStatusTimeoutRef = useRef(null);
  const initialLang = params.get('lang') || 'nl';
  const [language, setLanguage] = useState(initialLang);

  const { answers = {}, content: questionsData = {} } = location.state || {};

  const [activeCardIndex, setActiveCardIndex] = useState(null);

  const content = translations[language];
  const factorCards = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => ({
        title: content[`card${index + 1}Title`],
        description: content[`card${index + 1}Back`],
      })),
    [content]
  );
  const expandedCard = typeof activeCardIndex === 'number' ? factorCards[activeCardIndex] : null;
  const dashboardLayout = useMemo(() => [
    { title: content.categoryNames.personal, questionIds: ['q1','q2','q3','q4','q5'], totalWeight: 0.22 },
    { title: content.categoryNames.interaction, questionIds: ['q6','q7','q8','q9','q10','q11','q12','q13','q14','q15','q16'], totalWeight: 0.59 },
    { title: content.categoryNames.organizational, questionIds: ['q17','q18','q19','q20','q21'], totalWeight: 0.19 },
  ], [content]);
  const userAnswers = location.state?.answers || {};

  const onCardSelect = (id) => {
    setActiveCardIndex(prev => (prev === id ? null : id));
  };

  const handleRestart = () => navigate(`/tool?lang=${language}`);
  const handleHomeClick = () => navigate('/');
  const handleInfoClick = () => navigate(`/info?lang=${language}`);

  const emailStatusId = 'email-status-message';
  const emailStatusStyles = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    pending: 'bg-sky-50 border-sky-200 text-sky-700',
  };

  const renderEmailStatusIcon = (statusType) => {
    if (statusType === 'success') {
      return (
        <svg
          className="w-4 h-4 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      );
    }

    if (statusType === 'error') {
      return (
        <svg
          className="w-4 h-4 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    }

    if (statusType === 'pending') {
      return (
        <svg
          className="w-4 h-4 flex-shrink-0 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      );
    }

    return null;
  };

  const getFriendlyEmailErrorMessage = (error) => {
    if (!error) {
      return content.emailGenericError;
    }

    const rawMessage = typeof error === 'string' ? error : error?.message || '';
    const sanitizedMessage = rawMessage.replace(/^Error:\s*/i, '').trim();

    if (!sanitizedMessage) {
      return `${content.emailErrorMessage} ${content.emailGenericError}`.trim();
    }

    if (/unable to reach the email service/i.test(sanitizedMessage)) {
      return `${content.emailErrorMessage} ${content.emailNetworkErrorMessage}`.trim();
    }

    const statusMatch = sanitizedMessage.match(/status\s+(\d{3})/i);
    if (statusMatch) {
      const statusText = content.emailServerErrorMessage.replace('{status}', statusMatch[1]);
      return `${content.emailErrorMessage} ${statusText}`.trim();
    }

    return `${content.emailErrorMessage} ${sanitizedMessage}`.trim();
  };

  const allQuestions = useMemo(() => {
    return questionsData && questionsData.questionSets ? Object.values(questionsData.questionSets).flat() : [];
  }, [questionsData]);

  useEffect(() => {
    return () => {
      if (emailStatusTimeoutRef.current) {
        clearTimeout(emailStatusTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (emailStatusTimeoutRef.current) {
      clearTimeout(emailStatusTimeoutRef.current);
      emailStatusTimeoutRef.current = null;
    }

    if (emailStatus.type === 'idle' || emailStatus.type === 'pending') {
      return;
    }

    emailStatusTimeoutRef.current = setTimeout(() => {
      setEmailStatus({ type: 'idle', message: '' });
    }, 6000);

    return () => {
      if (emailStatusTimeoutRef.current) {
        clearTimeout(emailStatusTimeoutRef.current);
        emailStatusTimeoutRef.current = null;
      }
    };
  }, [emailStatus.type]);

  useEffect(() => {
    setEmailStatus({ type: 'idle', message: '' });
  }, [language]);

  const handleSendEmail = async (event) => {
    if (event) {
      event.preventDefault();
    }

    if (isSendingEmail) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailStatus({ type: 'error', message: content.emailRequiredMessage });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setEmailStatus({ type: 'error', message: content.emailInvalidMessage });
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus({ type: 'pending', message: content.emailSendingMessage });

    try {
      const { response } = await sendDashboardSummaryEmail({
        email: trimmedEmail,
        language,
        filename: "PARAAT_dashboard.pdf",
        content,
        userAnswers,
        overallParaatScore,
        overallReliabilityScore,
        analysisData
      });
      const messageId = response?.messageId
        ? ` (${content.emailReferenceLabel} ${response.messageId})`
        : '';
      console.info(`Dashboard PDF emailed to ${trimmedEmail}${messageId}.`);
      setEmailStatus({
        type: 'success',
        message: `${content.emailSuccessMessage}${messageId}`.trim(),
      });
    } catch (err) {
      console.error("Failed to send dashboard PDF email:", err);
      const friendlyMessage = getFriendlyEmailErrorMessage(err);
      setEmailStatus({
        type: 'error',
        message: friendlyMessage,
      });
    } finally {
      setIsSendingEmail(false);
    }
  };


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
  }, [answers, language, allQuestions, dashboardLayout]);

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
    const area = answers['q6'] || 50;
    const shapeAnswer = answers['q7'];
    let shape = 'Rectangle';
    let dims = {};

    switch (shapeAnswer) {
      case 0: { // Square
        const side = Math.sqrt(area);
        dims = { length: side, width: side };
        break;
      }
      case 1: { // Rectangle
        const width = Math.sqrt(area / 1.5);
        dims = { length: width * 1.5, width };
        break;
      }
      case 2: { // L-shaped
        shape = 'L-Shape';
        const legArea = area / 2;
        const legWidth = Math.sqrt(legArea / 2);
        dims = { l1_len: legWidth * 2, l1_wid: legWidth, l2_len: legWidth * 2, l2_wid: legWidth };
        break;
      }
      case 3: { // Long and narrow (assume 4:1 ratio)
        const width = Math.sqrt(area / 4);
        dims = { length: width * 4, width };
        break;
      }
      default: { // Other / I don't know
        const side = Math.sqrt(area);
        dims = { length: side, width: side };
      }
    }

    const socialDistance = 1.5;
    const { positions, fullTheoretical } = getPositionsAndTheoreticalMax(shape, dims, socialDistance);
    const geometricCapacity = Math.floor(fullTheoretical * DEFAULT_USABLE_SPACE_PERCENT / 100);

    return {
      shape,
      dims,
      people: positions.slice(0, Math.min(geometricCapacity, positions.length)),
      socialDistance,
      color: '#22c55e',
      meta: {
        capacityMax: geometricCapacity,
        geometricCapacity,
        limiting: 'geometry',
        roomArea: area,
        usablePercent: DEFAULT_USABLE_SPACE_PERCENT,
      },
    };
  }, [answers]);

  const emailInputHasError = emailStatus.type === 'error';
  const emailInputClasses = [
    'flex-1 px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none transition-colors',
    emailInputHasError
      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
      : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
  ].join(' ');

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
            <header className="relative flex justify-between items-center w-full mb-8">
                <div className="flex justify-start items-center gap-2" style={{ flex: 1 }}>
                    <button onClick={handleHomeClick} className="p-2 flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M12 21.75V12m0 0l-3.75 3.75M12 12l3.75 3.75M4.5 9.75v10.5a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5V9.75M8.25 21.75h7.5" />
                        </svg>
                        <span className="font-semibold">Home</span>
                    </button>
                    <button onClick={handleInfoClick} className="p-2 flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M12 21.75a9.75 9.75 0 100-19.5 9.75 9.75 0 000 19.5z" />
                        </svg>
                        <span className="font-semibold">Info</span>
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
                            className="bg-white border-2 border-slate-300 rounded-lg py-2 px-4 text-base font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                        >
                            <option value="en">English</option>
                            <option value="nl">Nederlands</option>
                        </select>
                    </div>
                </div>
            </header>

            <div className="flex flex-row items-start justify-center gap-4 mb-8">
              <div className="w-full max-w-md flex flex-col gap-2">
                <form className="w-full flex items-center gap-2" onSubmit={handleSendEmail} noValidate>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailStatus.type !== 'idle' && emailStatus.type !== 'pending') {
                        setEmailStatus({ type: 'idle', message: '' });
                      }
                    }}
                    className={emailInputClasses}
                    aria-invalid={emailInputHasError}
                    aria-describedby={emailStatus.type !== 'idle' ? emailStatusId : undefined}
                    placeholder={content.emailPlaceholder}
                    autoComplete="email"
                    inputMode="email"
                  />
                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="shrink-0 inline-flex items-center justify-center gap-2 text-sm px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-busy={isSendingEmail}
                  >
                    {isSendingEmail && (
                      <svg
                        className="w-4 h-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    )}
                    <span>{isSendingEmail ? content.sendingEmailButton : content.sendEmailButton}</span>
                  </button>
                </form>
                {emailStatus.type !== 'idle' && (
                  <div
                    id={emailStatusId}
                    role={emailStatus.type === 'error' ? 'alert' : 'status'}
                    aria-live={emailStatus.type === 'error' ? 'assertive' : 'polite'}
                    className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md border ${emailStatusStyles[emailStatus.type]}`}
                  >
                    {renderEmailStatusIcon(emailStatus.type)}
                    <span>{emailStatus.message}</span>
                  </div>
                )}
              </div>
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

        <div className="max-w-8xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="md:w-1/2 flex flex-col justify-start items-center gap-8">
                        <FancyParaatDial score={overallParaatScore} label={content.paraatScore} />
                        <ReliabilityScoreBar score={overallReliabilityScore} label={content.reliabilityScore} />
                    </div>
                    <div className="w-full md:w-px h-px md:h-auto self-stretch bg-slate-200"></div>
                    <div className="md:w-1/2">
                        <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center">{content.topRecommendationsTitle}</h3>
                        <TopRecommendations userAnswers={userAnswers} content={content} language={language} />
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">{content.cardsTitle}</h2>
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-12">
                <div className="flex flex-col items-center space-y-6">
                    <div className="w-full">
              <div className="flex flex-wrap justify-center items-stretch gap-4 px-1">
                            {factorCards.map((card, index) => (
                                <FactorCardButton
                                    key={`factor-card-${index}`}
                                    id={index}
                                    label={card.title}
                                    isActive={activeCardIndex === index}
                                    onSelect={onCardSelect}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="w-full mt-6">
                        {expandedCard ? (
                            <ExpandedFactorCard title={expandedCard.title} description={expandedCard.description} />
                        ) : (
                            <p className="text-sm text-slate-500 italic text-center">
                                {language === 'nl'
                                    ? 'Selecteer een kaart om de details te bekijken.'
                                    : 'Select a card to view its details.'}
                            </p>
                        )}
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
                        reliabilityLabel={content.reliabilityScore}
                        labels={{
                            quick: content.recHeaderQuick,
                            investment: content.recHeaderInvestment,
                            information: content.recHeaderInformation,
                        }}
                    />
                ))}
            </div>

            <div className="mt-12">
                <SpacingDiagram {...safeSpaceData} visualizationTitle={content.visualizationTitle} labels={{
                    maxPeople: content.maxPeopleLabel,
                    geometryLimited: content.geometryLimitedLabel,
                    ventilationLimited: content.ventilationLimitedLabel,
                    roomArea: content.roomAreaLabel,
                    usableArea: content.usableAreaLabel,
                    socialDistance: content.socialDistanceLabel,
                }} />
            </div>

            <div className="text-center mt-12">
                <button onClick={handleRestart} className="bg-blue-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-md">
                    {content.startOver || 'Start Over'}
                </button>
            </div>
        </div>
        <footer className="w-full max-w-7xl mx-auto flex justify-end mt-16 px-4 sm:px-8">
          <div className="flex items-center gap-4">
              <a href="https://www.tue.nl" target="_blank" rel="noopener noreferrer">
                <img src="/tue.png" alt="TU/e Logo" className="h-20" />
              </a>
              <a href="https://www.tno.nl" target="_blank" rel="noopener noreferrer">
                <img src="/tno.png" alt="TNO Logo" className="h-14" />
              </a>
          </div>
      </footer>
    </div>
  );
}