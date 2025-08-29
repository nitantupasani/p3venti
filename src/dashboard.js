import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SpacingDiagram, { getPositionsAndTheoreticalMax } from './spacingDiagram';
import { AnalysisRow, TotalScoreBar, recommendations, scoringRules } from './recommendations';

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
        goToStart: 'Go to Start'
    },
    nl: {
        pageTitle: 'P3 Venti',
        pageSubtitle: 'Zorghuis Actieplan',
        analysisTitle: 'Analyse per Categorie',
        totalScoresTitle: 'Totale Scores van Analyse',
        totalExposureScoreLabel: 'Totaalscore Bescherming tegen Blootstelling',
        totalValuesScoreLabel: 'Totaalscore Waarden',
        visualizationTitle: 'Visualisatie Bezetting Woonkamer',
        startOver: 'Opnieuw Beginnen',
        noSummaryTitle: 'Geen overzicht om weer te geven.',
        noSummaryText: 'Start eerst het actieplan.',
        goToStart: 'Ga naar Start'
    }
}

/* -------------------------------- Dashboard --------------------------------- */
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Provide default empty objects if location.state is null or undefined
  const { answers = {}, content: initialContent = {} } = location.state || {};
  const [language, setLanguage] = useState(initialContent.pageSubtitle === 'Zorghuis Actieplan' ? 'nl' : 'en');

  const content = translations[language];

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleRestart = () => navigate('/tool');
  const handleHomeClick = () => {
    navigate('/');
  };

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

    // Geometric cap (layout)
    const geometricCapacity = Math.floor(fullTheoretical * usablePercent / 100);

    // Ventilation derate (kept, but not used for capacityMax unless you want it)
    const ventScore = Math.min((windowsDoors + ventGrates) / 20, 1);
    const recircPen = airRecirc ? 0.2 : 0;
    const riskPct = (1 - ventScore) * 50 + recircPen * 50; // 0..100
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
      meta: {
        geometricCapacity,
        ventilationCapacity,
        capacityMax,
        limiting,
        roomArea,
        usablePercent
      }
    };
  }, [answers]);

  const analysisData = useMemo(() => {
    const normalizeScore = (score) => (score / 5) * 100;

    // If no answers are provided (e.g., direct navigation), return all scores as 0.
    if (Object.keys(answers).length === 0) {
        return dashboardLayout.map(row => ({
            title: row.title,
            score1: 0,
            score2: 0,
            recommendations: []
        }));
    }

    const getScore = (type, qId, aIdx) => {
      if (scoringRules[qId] && scoringRules[qId][type] && aIdx < scoringRules[qId][type].length) {
        return scoringRules[qId][type][aIdx];
      }
      return 0;
    };

    return dashboardLayout.map(row => {
      let totalValueScore = 0;
      let totalRiskScore = 0;
      let recommendationsList = [];

      row.questionIds.forEach(id => {
        const answerIndex = answers[id];
        if (answerIndex !== undefined) {
          totalValueScore += getScore('values', id, answerIndex);
          totalRiskScore += getScore('risk', id, answerIndex);
          if (recommendations[language][id] && recommendations[language][id][answerIndex]) {
            recommendationsList.push(recommendations[language][id][answerIndex]);
          }
        }
      });

      const avgValueScore = row.questionIds.length > 0 ? totalValueScore / row.questionIds.length : 0;
      const avgRiskScore = row.questionIds.length > 0 ? totalRiskScore / row.questionIds.length : 0;

      return {
        title: row.title,
        score1: normalizeScore(avgValueScore),
        score2: normalizeScore(avgRiskScore),
        recommendations: recommendationsList
      };
    });
  }, [answers, language]);

  const { totalScoreValues, totalScoreExposure } = useMemo(() => {
    if (analysisData.length === 0) return { totalScoreValues: 0, totalScoreExposure: 0 };
    const totalValuesRaw = analysisData.reduce((acc, item) => acc + item.score1, 0) / analysisData.length;
    const totalExposureRaw = analysisData.reduce((acc, item) => acc + item.score2, 0) / analysisData.length;
    return { totalScoreValues: totalValuesRaw, totalScoreExposure: totalExposureRaw };
  }, [analysisData]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto mb-16">
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
      <div className="max-w-9xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">{content.analysisTitle}</h1>

        <div className="space-y-6 mb-12">
          {analysisData.map(data => (
            <AnalysisRow
              key={data.title}
              title={data.title}
              score1={data.score1}
              score2={data.score2}
              recommendations={data.recommendations}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">{content.totalScoresTitle}</h2>
          <TotalScoreBar label={content.totalExposureScoreLabel} value={totalScoreExposure} colorClass="bg-green-500" />
          <TotalScoreBar label={content.totalValuesScoreLabel} value={totalScoreValues} colorClass="bg-blue-500" />
        </div>
        <div className="mt-12">
          <SpacingDiagram {...safeSpaceData} visualizationTitle={content.visualizationTitle}/>
        </div>
        <div className="text-center mt-12">
          <button onClick={handleRestart} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-md">
            {content.startOver || "Start Over"}
          </button>
        </div>
      </div>
    </div>
  );
}