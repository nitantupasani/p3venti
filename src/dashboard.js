import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SpacingDiagram, { getPositionsAndTheoreticalMax } from './spacingDiagram';
import { AnalysisRow, TotalScoreBar, recommendations, scoringRules } from './recommendations';

const dashboardLayout = [
  { title: "Personal", questionIds: ['q4', 'q5', 'q6'] },
  { title: "Interaction", questionIds: ['q12', 'q14', 'q15', 'q16'] },
  { title: "Organizational", questionIds: ['q17', 'q18', 'q19', 'q20'] },
];

// (Your full recommendations and translations — unchanged)

/* -------------------------------- Dashboard --------------------------------- */
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const { answers, content } = location.state || { answers: {}, content: {} };

  const language = content.pageSubtitle === 'Zorghuis Actieplan' ? 'nl' : 'en';

  const handleRestart = () => navigate('/');

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
        const minor_axis = Math.sqrt(area / (2 * Math.PI));
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

    // If you want to skip ventilation cutoff: capacityMax = geometricCapacity.
    // If you want it: Math.min(geometricCapacity, ventilationCapacity)
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

  if (!Object.keys(answers).length || !Object.keys(content).length) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 flex justify-center items-center p-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700">No summary to display.</h2>
          <p className="text-lg text-slate-600 mb-6">Please start the action plan first.</p>
          <button onClick={handleRestart} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg">
            Go to Start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-9xl mx-auto">

        {/* Visualization + caption */}
        

        <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">Analysis per Category</h1>

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
          <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">Total Scores of Analysis</h2>
          <TotalScoreBar label="Total Score of Protection against Exposure" value={totalScoreExposure} colorClass="bg-green-500" />
          <TotalScoreBar label="Total Score of Values" value={totalScoreValues} colorClass="bg-blue-500" />
        </div>
        <div className="mt-12">
          <SpacingDiagram {...safeSpaceData} />
        </div>
        <div className="text-center mt-12">
          <button onClick={() => navigate('/')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-md">
            {content.startOver || "Start Over"}
          </button>
        </div>
      </div>
    </div>
  );
}
