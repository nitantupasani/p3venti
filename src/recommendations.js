import React, { useState, useMemo, useRef, useEffect } from "react";

// --- Reusable Components ---

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
        <div className="flex flex-col items-center select-none p-6">
            <svg viewBox="0 0 100 60" className="w-40 h-auto md:w-48">
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
                <text x="50" y="40" textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="800" className="fill-slate-800">
                    {v}
                </text>
            </svg>
            <div className="mt-2 text-base font-bold text-slate-800 text-center">{label}</div>
        </div>
    );
};

const ReliabilityScoreBar = ({ score, label }) => {
    const v = Math.max(0, Math.min(100, Math.round(score || 0)));
    const getScoreColorClass = (value) => (value < 33 ? 'text-red-500' : value < 66 ? 'text-amber-500' : 'text-green-500');
    const scoreColorClass = getScoreColorClass(v);
    const gradientStyle = { background: 'linear-gradient(to right, #ef4444, #f59e0b, #22c55e)' };

    return (
        <div className="w-full max-w-xs mx-auto p-2 bg-white rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
                <span className={`text-lg font-bold ${scoreColorClass}`}>{v}%</span>
            </div>
            <div className="relative w-full h-4 rounded-full overflow-hidden">
                <div className="absolute inset-0 w-full h-full opacity-25 rounded-full" style={gradientStyle}></div>
                <div className="relative h-full rounded-full overflow-hidden" style={{ width: `${v}%`, transition: 'width 700ms cubic-bezier(.22,.61,.36,1)' }}>
                    <div className="absolute inset-0 h-full rounded-full" style={{ width: `${100 * 100 / Math.max(v, 1)}%`, ...gradientStyle }}></div>
                </div>
            </div>
        </div>
    );
};

const AnalysisRow = ({
  title,
  paraatScore,
  reliabilityScore,
  recommendations,
  reliabilityLabel = 'Reliability Score',
  labels = {},
  preventiveHeading, // passed in from Dashboard
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* Clickable summary row */}
      <div
        className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="md:col-span-3">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        </div>

        <div className="md:col-span-5 flex flex-row items-center justify-center gap-6">
          <FancyParaatDial score={paraatScore} label="PARAAT Score" />
          <ReliabilityScoreBar score={reliabilityScore} label={reliabilityLabel} compact />
        </div>

        <div className="md:col-span-4 flex items-center justify-end">
          <svg
            className={`w-8 h-8 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          {/* Preventive actions heading (visible only when expanded) */}
          <h4 className="text-lg font-bold text-[#431325] text-left mb-3">
            {preventiveHeading || 'Preventive actions'}
          </h4>

          {/* Three-column headers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-semibold text-slate-700 mb-2 pb-2 border-b border-slate-200">
            <h4>{labels.quick || 'Quick adjustment'}</h4>
            <h4>{labels.investment || 'Long-term adjustment'}</h4>
            <h4>{labels.information || 'Information'}</h4>
          </div>

          {/* Rows */}
          {recommendations.map((rec, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
              <p className="text-sm text-slate-600">{rec[0]}</p>
              <p className="text-sm text-slate-600">{rec[1]}</p>
              <p className="text-sm text-slate-600">{rec[2]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// --- Data ---

export const topRecommendationsData = {
    en: {
        q14: "Improve ventilation to keep CO₂ levels below recommended limits (800 ppm for vulnerable groups).",
        q12: "Adjust or replace the ventilation system to avoid recirculating indoor air.",
        q15: "Ensure the ventilation system is regularly inspected and maintained (at least annually).",
        q8: "Keep people 1.5 meters apart as much as possible.",
        q4: "Establish a clear protocol for safely isolating individuals with infectious symptoms.",
        q11: "Assess and upgrade the ventilation system to meet modern building codes (e.g., Type D).",
        q1: "Manage group sizes in common areas to reduce transmission risk and improve quality of care.",
        q3: "Schedule activities to limit the duration individuals spend in shared spaces, allowing for air exchange.",
        q10: "Install and maintain ventilation grilles to improve natural airflow.",
        q9: "Ensure windows can be opened to provide effective natural ventilation when needed.",
        q20: "Implement a policy of working with fixed teams and groups to minimize cross-contamination.",
        q5: "Limit the mixing of different resident groups or departments in common areas.",
        q18: "Ensure a reliable supply of personal protective equipment (PPE) is always available.",
        q16: "Address sources of ventilation discomfort (drafts, noise, cold) to ensure systems are used effectively.",
        q19: "Improve staffing schedules to ensure all shifts are covered, maintaining quality of care and safety.",
        q6: "Evaluate if the room size is adequate for the number of occupants and planned activities.",
        q7: "Consider the room's shape and layout when planning activities to optimize safe occupancy.",
        q13: "Install CO₂ meters in common areas to monitor air quality in real-time.",
        q21: "Allocate a dedicated budget for pandemic preparedness, including ventilation and PPE.",
        q17: "Provide clear, visible instructions for operating ventilation systems (windows, grilles, controls).",
        q2: "Tailor communication and support strategies to the specific needs of the resident group (e.g., psychogeriatric).",
    },
    nl: {
        q14: "Verbeter de ventilatie om de CO₂-niveaus onder de aanbevolen limieten te houden (800 ppm voor kwetsbare groepen).",
        q12: "Pas het ventilatiesysteem aan of vervang het om recirculatie van binnenlucht te voorkomen.",
        q15: "Zorg ervoor dat het ventilatiesysteem regelmatig wordt geïnspecteerd en onderhouden (minimaal jaarlijks).",
        q8: "Zorg dat mensen op 1,5 meter van elkaar zitten.",
        q4: "Stel een duidelijk protocol op voor het veilig isoleren van personen met besmettelijke symptomen.",
        q11: "Beoordeel en upgrade het ventilatiesysteem om te voldoen aan moderne bouwnormen (bijv. Type D).",
        q1: "Beheer de groepsgrootte in gemeenschappelijke ruimtes om het overdrachtsrisico te verkleinen en de zorgkwaliteit te verbeteren.",
        q3: "Plan activiteiten zodanig dat de verblijfsduur in gedeelde ruimtes beperkt wordt, zodat luchtverversing mogelijk is.",
        q10: "Installeer en onderhoud ventilatieroosters om de natuurlijke luchtstroom te verbeteren.",
        q9: "Zorg ervoor dat ramen geopend kunnen worden voor effectieve natuurlijke ventilatie wanneer nodig.",
        q20: "Implementeer een beleid van vaste teams en groepen om kruisbesmetting te minimaliseren.",
        q5: "Beperk het mengen van verschillende bewonersgroepen of afdelingen in gemeenschappelijke ruimtes.",
        q18: "Zorg voor een betrouwbare voorraad persoonlijke beschermingsmiddelen (PBM) die altijd beschikbaar is.",
        q16: "Pak bronnen van ventilatieongemak (tocht, lawaai, kou) aan om ervoor te zorgen dat systemen effectief worden gebruikt.",
        q19: "Verbeter de personeelsplanning om te zorgen dat alle diensten bezet zijn, wat de zorgkwaliteit en veiligheid ten goede komt.",
        q6: "Evalueer of de grootte van de ruimte voldoende is voor het aantal bewoners en de geplande activiteiten.",
        q7: "Houd rekening met de vorm en indeling van de kamer bij het plannen van activiteiten om een veilige bezetting te optimaliseren.",
        q13: "Installeer CO₂-meters in gemeenschappelijke ruimtes om de luchtkwaliteit in real-time te monitoren.",
        q21: "Wijs een specifiek budget toe voor pandemische paraatheid, inclusief ventilatie en PBM.",
        q17: "Zorg voor duidelijke, zichtbare instructies voor de bediening van ventilatievoorzieningen (ramen, roosters, knoppen).",
        q2: "Stem communicatie- en ondersteuningsstrategieën af op de specifieke behoeften van de bewonersgroep (bijv. psychogeriatrie).",
    }
};

export const recommendations = {
    en: {
        q1: [
          ["", "Organize care so that groups are neither too small nor too large. The ideal size is 8 people.", "The ideal group size is 8 people, according to the National Organization of Client Councils. \"The main reason is that group size largely determines the level of anxiety among residents. Within larger groups, there is less time to tailor care to the wishes and needs of each person, so that they can live their life in a way that suits them.\" https://www.clientenraad.nl/publicaties/bewaarkaart-groepsformaat-kleinschalig-wonen/"],
          ["", "Organize care so that groups are neither too small nor too large. The ideal size is 8 people.", "The ideal group size is 8 people, according to the National Organization of Client Councils. \"The main reason is that group size largely determines the level of anxiety among residents. Within larger groups, there is less time to tailor care to the wishes and needs of each person, so that they can live their life in a way that suits them.\" https://www.clientenraad.nl/publicaties/bewaarkaart-groepsformaat-kleinschalig-wonen/"],
          ["Split mealtimes into two groups (if there are too many people in the room).", "Organize care so that groups are neither too small nor too large. The ideal size is 8 people.", "The ideal group size is 8 people, according to the National Organization of Client Councils. \"The main reason is that group size largely determines the level of anxiety among residents. Within larger groups, there is less time to tailor care to the wishes and needs of each person, so that they can live their life in a way that suits them.\" https://www.clientenraad.nl/publicaties/bewaarkaart-groepsformaat-kleinschalig-wonen/"],
          ["Split mealtimes into two groups (if there are too many people in the room).", "Organize care so that groups are neither too small nor too large. The ideal size is 8 people.", "The ideal group size is 8 people, according to the National Organization of Client Councils. \"The main reason is that group size largely determines the level of anxiety among residents. Within larger groups, there is less time to tailor care to the wishes and needs of each person, so that they can live their life in a way that suits them.\" https://www.clientenraad.nl/publicaties/bewaarkaart-groepsformaat-kleinschalig-wonen/"],
          ["Split mealtimes into two groups (if there are too many people in the room).", "Organize care so that groups are neither too small nor too large. The ideal size is 8 people.", "The ideal group size is 8 people, according to the National Organization of Client Councils. \"The main reason is that group size largely determines the level of anxiety among residents. Within larger groups, there is less time to tailor care to the wishes and needs of each person, so that they can live their life in a way that suits them.\" https://www.clientenraad.nl/publicaties/bewaarkaart-groepsformaat-kleinschalig-wonen/"],
        ],
        q2: [
          ["Hang posters with simple images to communicate the rules suitable for the group.", "Provide appropriate support (posters, pictures, family involvement, additional staff) for groups that need it during a crisis.", "People with cognitive or intellectual impairments may have difficulty understanding and remembering rules. They need more support and/or more freedom. Consider what you can expect and ask of everyone."],
          ["Hang posters with simple images to communicate the rules suitable for the group.", "Provide appropriate support (posters, pictures, family involvement, additional staff) for groups that need it during a crisis.", "People with cognitive or intellectual impairments may have difficulty understanding and remembering rules. They need more support and/or more freedom. Consider what you can expect and ask of everyone."],
          ["Hang posters with simple images to communicate the rules suitable for the group.", "Provide appropriate support (posters, pictures, family involvement, additional staff) for groups that need it during a crisis.", "People with cognitive or intellectual impairments may have difficulty understanding and remembering rules. They need more support and/or more freedom. Consider what you can expect and ask of everyone."],
          ["Hang posters with simple images to communicate the rules suitable for the group.", "Provide appropriate support (posters, pictures, family involvement, additional staff) for groups that need it during a crisis.", "People with cognitive or intellectual impairments may have difficulty understanding and remembering rules. They need more support and/or more freedom. Consider what you can expect and ask of everyone."],
          ["Hang posters with simple images to communicate the rules suitable for the group.", "Provide appropriate support (posters, pictures, family involvement, additional staff) for groups that need it during a crisis.", "People with cognitive or intellectual impairments may have difficulty understanding and remembering rules. They need more support and/or more freedom. Consider what you can expect and ask of everyone."],
        ],
        q3: [
          ["", "", ""],
          ["Reduce the time people spend in the living room. However, ensure they have social contact throughout the day.", "Create a schedule that allows for space between activities so that people aren't in the room for too long at a time. This allows for proper ventilation between activities.", "The longer people are present in a room, the more virus particles will build up and linger in the space. However, the more time people spend in a room, the more interactions they can have, which is good for well-being. "],
          ["Reduce the time people spend in the living room. However, ensure they have social contact throughout the day.", "Create a schedule that allows for space between activities so that people aren't in the room for too long at a time. This allows for proper ventilation between activities.", "The longer people are present in a room, the more virus particles will build up and linger in the space. However, the more time people spend in a room, the more interactions they can have, which is good for well-being. "],
          ["Reduce the time people spend in the living room. However, ensure they have social contact throughout the day.", "Create a schedule that allows for space between activities so that people aren't in the room for too long at a time. This allows for proper ventilation between activities.", "The longer people are present in a room, the more virus particles will build up and linger in the space. However, the more time people spend in a room, the more interactions they can have, which is good for well-being. "],
        ],
        q4: [
          ["Have people stay apart if they are infected. Monitor their mental health. Provide alternative ways of contact (phone, video call, window).", "Create a plan for each person. Consider other ways to stay safe around someone who can't stay separate from the rest.", "If people can and want to remain separate when necessary, they pose a smaller risk to the rest of the group. They will also likely experience less discomfort (such as loneliness) than people who cannot and do not want to remain separate. If people cannot isolate due to mental health reasons, they should not be isolated."],
          ["Have people stay apart if they are infected, where possible. Otherwise, use precautionary measures (social distancing, face masks for residents, PPE) around infected people. Monitor their mental health. Provide alternative ways of contact (phone, video call, window).", "Create a plan for each person. Consider other ways to stay safe around someone who can't stay separate from the rest.", "If people can and want to remain separate when necessary, they pose a smaller risk to the rest of the group. They will also likely experience less discomfort (such as loneliness) than people who cannot and do not want to remain separate. If people cannot isolate due to mental health reasons, they should not be isolated."],
          ["Use precautionary measures (social distancing, face masks for residents, PPE) around infected people. Monitor their mental health. Provide alternative ways of contact (phone, video call, window).", "Create a plan for each person. Consider other ways to stay safe around someone who can't stay separate from the rest.", "If people can and want to remain separate when necessary, they pose a smaller risk to the rest of the group. They will also likely experience less discomfort (such as loneliness) than people who cannot and do not want to remain separate. If people cannot isolate due to mental health reasons, they should not be isolated."],
          ["Have people stay apart if they are infected. Monitor their mental health. Provide alternative ways of contact (phone, video call, window).", "Create a plan for each person. Consider other ways to stay safe around someone who can't stay separate from the rest.", "If people can and want to remain separate when necessary, they pose a smaller risk to the rest of the group. They will also likely experience less discomfort (such as loneliness) than people who cannot and do not want to remain separate. If people cannot isolate due to mental health reasons, they should not be isolated."],
        ],
        q5: [
          ["Do not allow groups to mingle.", "More people gives more autonomy and opportunities for mixing and social interaction but it can cause confusion for the residents. Find out what holds for your group. Mixing groups is always a risk of exposure to a virus.", "Mixing groups provides residents with more freedom of movement, autonomy, and social interaction. At the same time, this can be very confusing for some residents because the group can become very large. Caregivers can also lose track. It also increases the risk of people passing on the virus."],
          ["Do not allow groups to mingle.", "More people gives more autonomy and opportunities for mixing and social interaction but it can cause confusion for the residents. Find out what holds for your group. Mixing groups is always a risk of exposure to a virus.", "Mixing groups provides residents with more freedom of movement, autonomy, and social interaction. At the same time, this can be very confusing for some residents because the group can become very large. Caregivers can also lose track. It also increases the risk of people passing on the virus."],
          ["Do not allow groups to mingle.", "More people gives more autonomy and opportunities for mixing and social interaction but it can cause confusion for the residents. Find out what holds for your group. Mixing groups is always a risk of exposure to a virus.", "Mixing groups provides residents with more freedom of movement, autonomy, and social interaction. At the same time, this can be very confusing for some residents because the group can become very large. Caregivers can also lose track. It also increases the risk of people passing on the virus."],
          ["Do not allow groups to mingle.", "More people gives more autonomy and opportunities for mixing and social interaction but it can cause confusion for the residents. Find out what holds for your group. Mixing groups is always a risk of exposure to a virus.", "Mixing groups provides residents with more freedom of movement, autonomy, and social interaction. At the same time, this can be very confusing for some residents because the group can become very large. Caregivers can also lose track. It also increases the risk of people passing on the virus."],
        ],
        q8: [
          ["", "", ""],
          ["Keep people 1.5 meters apart as much as possible.", "Ensure the activity can be performed effectively with everyone maintaining a distance of 1.5 meters. If this isn't possible, implement other precautions such as dividers or face masks.", "Maintaining social distance is good for safety. It reduces the risk of people infecting each other. It does, however, limit social interactions."],
          ["Keep people 1.5 meters apart as much as possible.", "Ensure the activity can be performed effectively with everyone maintaining a distance of 1.5 meters. If this isn't possible, implement other precautions such as dividers or face masks.", "Maintaining social distance is good for safety. It reduces the risk of people infecting each other. It does, however, limit social interactions."],
          ["Keep people 1.5 meters apart as much as possible.", "Ensure the activity can be performed effectively with everyone maintaining a distance of 1.5 meters. If this isn't possible, implement other precautions such as dividers or face masks.", "Maintaining social distance is good for safety. It reduces the risk of people infecting each other. It does, however, limit social interactions."],
        ],
        q9: [
          ["Open windows as much as possible where possible.", "Ensure there are sufficient windows that open easily.", "Opening windows allows more fresh air to enter. This is important during a pandemic. Being able to open and close windows yourself provides autonomy, control, and a sense of security for staff and residents. Be aware that this can lead to drafts, cold, and respiratory problems."],
          ["Open windows as much as possible where possible.", "Ensure there are sufficient windows that open easily.", "Opening windows allows more fresh air to enter. This is important during a pandemic. Being able to open and close windows yourself provides autonomy, control, and a sense of security for staff and residents. Be aware that this can lead to drafts, cold, and respiratory problems."],
          ["", "", ""],
          ["", "", ""],
        ],
        q10: [
          ["Open ventilation grilles.", "Ensure there are sufficient ventilation grilles and that they are well-maintained so they are always clean.", "Ventilation grilles provide more fresh air. This is important during a pandemic. Being able to open and close the grilles yourself provides autonomy, control, and a sense of security for staff and residents. Be aware that this can lead to drafts, cold, and respiratory problems."],
          ["", "", ""],
          ["", "", ""],
        ],
        q11: [
          ["Be sure to fulfill the requirements of ventilation.", "Adjust the system if necessary in order to fulfill the requirements of ventilation.", "The building code and the government have ventilation requirements. Make sure you know what these are and that your building fulfills them."],
          ["Be sure to fulfill the requirements of ventilation.", "Adjust the system if necessary in order to fulfill the requirements of ventilation.", "The building code and the government have ventilation requirements. Make sure you know what these are and that your building fulfills them."],
          ["Be sure to fulfill the requirements of ventilation.", "Adjust the system if necessary in order to fulfill the requirements of ventilation.", "The building code and the government have ventilation requirements. Make sure you know what these are and that your building fulfills them."],
          ["Be sure to fulfill the requirements of ventilation.", "Adjust the system if necessary in order to fulfill the requirements of ventilation.", "The building code and the government have ventilation requirements. Make sure you know what these are and that your building fulfills them."],
          ["Be sure to fulfill the requirements of ventilation.", "Adjust the system if necessary in order to fulfill the requirements of ventilation.", "The building code and the government have ventilation requirements. Make sure you know what these are and that your building fulfills them."],
        ],
        q12: [
          ["Ask technical support to turn off recirculation.", "Invest in a ventilation system that does not recirculate air.", "Air recirculation means that contaminated air is returned to the room. This accelerates the spread of a virus."],
          ["", "", ""],
          ["Ask technical support to turn off recirculation.", "Invest in a ventilation system that does not recirculate air.", "Air recirculation means that contaminated air is returned to the room. This accelerates the spread of a virus."],
        ],
        q13: [
          ["", "", ""],
          ["Purchase an air quality meter for the room.", "Ensure there are air quality meters in every room and that the ventilation system is controlled by them.", "Air quality meters provide insight into the amount of fresh air in a room. If there is little fresh air, a virus will accumulate more and spread more quickly."],
          ["", "", ""],
        ],
        q14: [
            ["", "Use the CO2 value to adjust or activate ventilation.", ""],
            ["Ensure the CO2 level remains below 1200 ppm during busy periods. For vulnerable groups, it should be below 800 ppm. If this is not possible, provide more fresh air by, for example, turning up the ventilation system, opening windows, or allowing fewer people into the room.", "Use the CO2 value to adjust or activate ventilation.", "A high CO2 level indicates that there is little fresh air in the room. This causes a buildup of viral particles and increases the risk of spreading the virus. In long-term care, the guideline is that CO2 levels should be below 1200 ppm, but for vulnerable groups, it's better to keep them below 800 ppm. Fresh air also has health benefits: people feel fitter."],
            ["Ensure the CO2 level remains below 1200 ppm during busy periods. For vulnerable groups, it should be below 800 ppm. If this is not possible, provide more fresh air by, for example, turning up the ventilation system, opening windows, or allowing fewer people into the room.", "Use the CO2 value to adjust or activate ventilation.", "A high CO2 level indicates that there is little fresh air in the room. This causes a buildup of viral particles and increases the risk of spreading the virus. In long-term care, the guideline is that CO2 levels should be below 1200 ppm, but for vulnerable groups, it's better to keep them below 800 ppm. Fresh air also has health benefits: people feel fitter."],
            ["Ensure the CO2 level remains below 1200 ppm during busy periods. For vulnerable groups, it should be below 800 ppm. If this is not possible, provide more fresh air by, for example, turning up the ventilation system, opening windows, or allowing fewer people into the room.", "Use the CO2 value to adjust or activate ventilation.", "A high CO2 level indicates that there is little fresh air in the room. This causes a buildup of viral particles and increases the risk of spreading the virus. In long-term care, the guideline is that CO2 levels should be below 1200 ppm, but for vulnerable groups, it's better to keep them below 800 ppm. Fresh air also has health benefits: people feel fitter."],
        ],
        q15: [
          ["", "Ensure regular inspections and maintenance.", "A well-maintained ventilation system ensures safe indoor air quality. Virus particles are then less likely to linger in the air and infect people. Knowing that the system is being properly maintained provides a sense of security for staff and residents and increases their confidence in the ventilation system."],
          ["Have the ventilation system checked as soon as possible and carry out any necessary maintenance.", "Ensure regular inspections and maintenance.", "A well-maintained ventilation system ensures safe indoor air quality. Virus particles are then less likely to linger in the air and infect people. Knowing that the system is being properly maintained provides a sense of security for staff and residents and increases their confidence in the ventilation system."],
          ["Have the ventilation system checked as soon as possible and carry out any necessary maintenance.", "Ensure regular inspections and maintenance.", "A well-maintained ventilation system ensures safe indoor air quality. Virus particles are then less likely to linger in the air and infect people. Knowing that the system is being properly maintained provides a sense of security for staff and residents and increases their confidence in the ventilation system."],
        ],
        q16: [
          ["Try to reduce the ventilation discomfort by, for example, cleaning the filters (noise), changing seat locations (draft), increasing the temperature (cold), or providing additional ventilation at times when few people are affected.", "Install a ventilation system appropriate for your target group. If noise is a problem, invest in a quiet system. If cold is a problem, provide additional heat.", "If people are affected by increased ventilation, they may behave differently (stop attending activities) or even become ill if they are susceptible. Therefore, ensure a ventilation system that provides effective ventilation while minimizing resident symptoms."],
          ["Try to reduce the ventilation discomfort by, for example, cleaning the filters (noise), changing seat locations (draft), increasing the temperature (cold), or providing additional ventilation at times when few people are affected.", "Install a ventilation system appropriate for your target group. If noise is a problem, invest in a quiet system. If cold is a problem, provide additional heat.", "If people are affected by increased ventilation, they may behave differently (stop attending activities) or even become ill if they are susceptible. Therefore, ensure a ventilation system that provides effective ventilation while minimizing resident symptoms."],
          ["Try to reduce the ventilation discomfort by, for example, cleaning the filters (noise), changing seat locations (draft), increasing the temperature (cold), or providing additional ventilation at times when few people are affected.", "Install a ventilation system appropriate for your target group. If noise is a problem, invest in a quiet system. If cold is a problem, provide additional heat.", "If people are affected by increased ventilation, they may behave differently (stop attending activities) or even become ill if they are susceptible. Therefore, ensure a ventilation system that provides effective ventilation while minimizing resident symptoms."],
          ["Try to reduce the ventilation discomfort by, for example, cleaning the filters (noise), changing seat locations (draft), increasing the temperature (cold), or providing additional ventilation at times when few people are affected.", "Install a ventilation system appropriate for your target group. If noise is a problem, invest in a quiet system. If cold is a problem, provide additional heat.", "If people are affected by increased ventilation, they may behave differently (stop attending activities) or even become ill if they are susceptible. Therefore, ensure a ventilation system that provides effective ventilation while minimizing resident symptoms."],
        ],
        q17: [
          ["", "", ""],
          ["Ensure that brief instructions for windows, grilles, and settings are available and that they are clear and visible to everyone.", "Create guidelines and instructions. Make sure all employees and residents understand and know these instructions and where to find them.", "With clear instructions, everyone can help with proper ventilation. This not only improves indoor air quality but also fosters autonomy."],
          ["Ensure that brief instructions for windows, grilles, and settings are available and that they are clear and visible to everyone.", "Create guidelines and instructions. Make sure all employees and residents understand and know these instructions and where to find them.", "With clear instructions, everyone can help with proper ventilation. This not only improves indoor air quality but also fosters autonomy."],
        ],
        q18: [
          ["", "", ""],
          ["Purchase personal protective equipment (PPE).", "Ensure there is always sufficient personal protective equipment (PPE) where needed.", "Personal protective equipment (PPE) ensures that staff can do their work safely and that residents are protected from the virus."],
          ["Purchase personal protective equipment (PPE).", "Ensure there is always sufficient personal protective equipment (PPE) where needed.", "Personal protective equipment (PPE) ensures that staff can do their work safely and that residents are protected from the virus."],
          ["Purchase personal protective equipment (PPE).", "Ensure there is always sufficient personal protective equipment (PPE) where needed.", "Personal protective equipment (PPE) ensures that staff can do their work safely and that residents are protected from the virus."],
        ],
        q19: [
          ["", "", ""],
          ["Deploy additional staff.", "Establish permanent teams and stable schedules, ensuring no shifts are left unoccupied.", "Ensuring that all shifts are staffed by the right people is crucial for continuity of care. If this isn't the case, additional measures will be difficult to implement. This will compromise the physical and mental care of the resident and the quality of work for the staff."],
          ["Deploy additional staff.", "Establish permanent teams and stable schedules, ensuring no shifts are left unoccupied.", "Ensuring that all shifts are staffed by the right people is crucial for continuity of care. If this isn't the case, additional measures will be difficult to implement. This will compromise the physical and mental care of the resident and the quality of work for the staff."],
          ["Deploy additional staff.", "Establish permanent teams and stable schedules, ensuring no shifts are left unoccupied.", "Ensuring that all shifts are staffed by the right people is crucial for continuity of care. If this isn't the case, additional measures will be difficult to implement. This will compromise the physical and mental care of the resident and the quality of work for the staff."],
          ["", "", ""],
        ],
        q20: [
          ["", "", ""],
          ["Work in permanent teams and groups.", "Agree on permanent teams and groups and ensure this is done consistently.", "Fixed teams/groups mean that staff move between rooms and departments as little as possible and that residents live in fixed groups. This reduces the risk of one group infecting another. This is also beneficial because it provides clarity for staff and residents. Residents are less likely to become overstimulated, and staff can maintain a better overview, monitor residents more closely, and recognize if something is wrong with someone. However, not working with fixed teams and groups allows more interactions, freedom and autonomy."],
          ["Work in permanent teams and groups.", "Agree on permanent teams and groups and ensure this is done consistently.", "Fixed teams/groups mean that staff move between rooms and departments as little as possible and that residents live in fixed groups. This reduces the risk of one group infecting another. This is also beneficial because it provides clarity for staff and residents. Residents are less likely to become overstimulated, and staff can maintain a better overview, monitor residents more closely, and recognize if something is wrong with someone. However, not working with fixed teams and groups allows more interactions, freedom and autonomy."],
          ["Work in permanent teams and groups.", "Agree on permanent teams and groups and ensure this is done consistently.", "Fixed teams/groups mean that staff move between rooms and departments as little as possible and that residents live in fixed groups. This reduces the risk of one group infecting another. This is also beneficial because it provides clarity for staff and residents. Residents are less likely to become overstimulated, and staff can maintain a better overview, monitor residents more closely, and recognize if something is wrong with someone. However, not working with fixed teams and groups allows more interactions, freedom and autonomy."],
        ],
        q21: [
          ["", "", ""],
          ["Allocate a budget for adjustments or measures (maintenance, sensors, grilles, PPE, additional staff).", "Ensure that any adjustments that are already possible are already implemented (maintenance, sensors, schedules) and that there is a structural budget for additional adjustments or measures (PPE, additional staff).", "Adjustments and measures to ensure the safety of staff and residents often cost money. It is important that this is factored into the budget. Also consider unexpected costs. This ensures a safe working and living environment."],
          ["Allocate a budget for adjustments or measures (maintenance, sensors, grilles, PPE, additional staff).", "Ensure that any adjustments that are already possible are already implemented (maintenance, sensors, schedules) and that there is a structural budget for additional adjustments or measures (PPE, additional staff).", "Adjustments and measures to ensure the safety of staff and residents often cost money. It is important that this is factored into the budget. Also consider unexpected costs. This ensures a safe working and living environment."],
          ["Allocate a budget for adjustments or measures (maintenance, sensors, grilles, PPE, additional staff).", "Ensure that any adjustments that are already possible are already implemented (maintenance, sensors, schedules) and that there is a structural budget for additional adjustments or measures (PPE, additional staff).", "Adjustments and measures to ensure the safety of staff and residents often cost money. It is important that this is factored into the budget. Also consider unexpected costs. This ensures a safe working and living environment."],
        ],
    },
    nl: {
        q1: [
            ["Het aantal mensen in de woonkamer lijkt niet te veel. Geen actie vereist.", "Richt de zorg zo in dat de groepen niet te klein of te groot zijn. Ideale groottte is 8 personen.", "Ideale groepsgrootte is 8 personen volgens Landelijke Organisatie Cliëntenraden. \"De belangrijkste reden is dat de groepsgrootte in grote mate de (onrust) onder bewoners bepaalt. Binnen grotere groepen is minder tijd om zorg af te stemmen op de wensen en behoeften van ieder mens, zodat diegene zijn leven kan leiden op een manier die voor hem passend is.\" https://www.clientenraad.nl/publicaties/bewaarkaart-groepsgrootte-kleinschalig-wonen/"],
            ["Let op dat mensen genoeg afstand kunnen houden in de woonkamer of zorg dat er minder mensen in de woonkamer zijn.", "Richt de zorg zo in dat de groepen niet te klein of te groot zijn. Ideale groottte is 8 personen.", "Ideale groepsgrootte is 8 personen volgens Landelijke Organisatie Cliëntenraden. \"De belangrijkste reden is dat de groepsgrootte in grote mate de (onrust) onder bewoners bepaalt. Binnen grotere groepen is minder tijd om zorg af te stemmen op de wensen en behoeften van ieder mens, zodat diegene zijn leven kan leiden op een manier die voor hem passend is.\" https://www.clientenraad.nl/publicaties/bewaarkaart-groepsgrootte-kleinschalig-wonen/"],
            ["Etensmomenten opsplitsen in twee groepen als mensen niet op veilige afstand kunnen eten. ", "Richt de zorg zo in dat de groepen niet te klein of te groot zijn. Ideale groottte is 8 personen.", "Ideale groepsgrootte is 8 personen volgens Landelijke Organisatie Cliëntenraden. \"De belangrijkste reden is dat de groepsgrootte in grote mate de (onrust) onder bewoners bepaalt. Binnen grotere groepen is minder tijd om zorg af te stemmen op de wensen en behoeften van ieder mens, zodat diegene zijn leven kan leiden op een manier die voor hem passend is.\" https://www.clientenraad.nl/publicaties/bewaarkaart-groepsgrootte-kleinschalig-wonen/"],
            ["Etensmomenten opsplitsen in twee groepen.", "Richt de zorg zo in dat de groepen niet te klein of te groot zijn. Ideale groottte is 8 personen.", "Ideale groepsgrootte is 8 personen volgens Landelijke Organisatie Cliëntenraden. \"De belangrijkste reden is dat de groepsgrootte in grote mate de (onrust) onder bewoners bepaalt. Binnen grotere groepen is minder tijd om zorg af te stemmen op de wensen en behoeften van ieder mens, zodat diegene zijn leven kan leiden op een manier die voor hem passend is.\" https://www.clientenraad.nl/publicaties/bewaarkaart-groepsgrootte-kleinschalig-wonen/"],
            ["Etensmomenten opsplitsen in twee groepen.", "Richt de zorg zo in dat de groepen niet te klein of te groot zijn. Ideale groottte is 8 personen.", "Ideale groepsgrootte is 8 personen volgens Landelijke Organisatie Cliëntenraden. \"De belangrijkste reden is dat de groepsgrootte in grote mate de (onrust) onder bewoners bepaalt. Binnen grotere groepen is minder tijd om zorg af te stemmen op de wensen en behoeften van ieder mens, zodat diegene zijn leven kan leiden op een manier die voor hem passend is.\" https://www.clientenraad.nl/publicaties/bewaarkaart-groepsgrootte-kleinschalig-wonen/"],
        ],
        q2: [
            ["Hang posters op met simpele plaatjes om de regels te communiceren die aangepast zijn aan de groep.", "Zorg voor de juiste begeleiding (posters, plaatjes, familie-inzet, extra personeel) voor groepen die dat nodig hebben ten tijde van een crisis.", "Mensen met cognitieve of verstandelijke beperkingen kunnen moeite hebben met het begrijpen en onthouden van regels. Zij hebben meer ondersteuning en/of meer vrijheid nodig. Bedenk wat je van iedereen kunt verwachten en vragen."],
            ["Hang posters op met simpele plaatjes om de regels te communiceren die aangepast zijn aan de groep.", "Zorg voor de juiste begeleiding (posters, plaatjes, familie-inzet, extra personeel) voor groepen die dat nodig hebben ten tijde van een crisis.", "Mensen met cognitieve of verstandelijke beperkingen kunnen moeite hebben met het begrijpen en onthouden van regels. Zij hebben meer ondersteuning en/of meer vrijheid nodig. Bedenk wat je van iedereen kunt verwachten en vragen."],
            ["Hang posters op met simpele plaatjes om de regels te communiceren die aangepast zijn aan de groep.", "Zorg voor de juiste begeleiding (posters, plaatjes, familie-inzet, extra personeel) voor groepen die dat nodig hebben ten tijde van een crisis.", "Mensen met cognitieve of verstandelijke beperkingen kunnen moeite hebben met het begrijpen en onthouden van regels. Zij hebben meer ondersteuning en/of meer vrijheid nodig. Bedenk wat je van iedereen kunt verwachten en vragen."],
            ["Hang posters op met simpele plaatjes om de regels te communiceren die aangepast zijn aan de groep.", "Zorg voor de juiste begeleiding (posters, plaatjes, familie-inzet, extra personeel) voor groepen die dat nodig hebben ten tijde van een crisis.", "Mensen met cognitieve of verstandelijke beperkingen kunnen moeite hebben met het begrijpen en onthouden van regels. Zij hebben meer ondersteuning en/of meer vrijheid nodig. Bedenk wat je van iedereen kunt verwachten en vragen."],
            ["Achterhaal wat voor type bewoners er zijn.", "Zorg voor de juiste begeleiding (posters, plaatjes, familie-inzet, extra personeel) voor groepen die dat nodig hebben ten tijde van een crisis.", "Mensen met cognitieve of verstandelijke beperkingen kunnen moeite hebben met het begrijpen en onthouden van regels. Zij hebben meer ondersteuning en/of meer vrijheid nodig. Bedenk wat je van iedereen kunt verwachten en vragen."],
        ],
        q3: [
            ["Mensen zijn niet te lang in de woonkamer. Geen actie vereist.", "Zorg ervoor dat mensen wel sociale contacten hebben op een dag.", "Hoe langer mensen aanwezig zijn in een ruimte, hoe meer virusdeeltjes er in de ruimte komen en blijven hangen. Maar hoe meer tijd mensen in een ruimte doorbrengen, hoe meer interactie er is, wat goed is voor het welzijn."],
            ["Zorg dat mensen niet te lang in de woonkamer zijn. Let wel op dat ze sociale contacten hebben op een dag.", "Maak een planning waarbij er ruimte zit tussen de activiteiten zodat mensen niet te lang in de ruimte aanwezig zijn aan een stuk. Zo kan er tussendoor goed geventileerd worden.", "Hoe langer mensen aanwezig zijn in een ruimte, hoe meer virusdeeltjes er in de ruimte komen en blijven hangen. Maar hoe meer tijd mensen in een ruimte doorbrengen, hoe meer interactie er is, wat goed is voor het welzijn."],
            ["Zorg dat mensen minder lang in de woonkamer zijn. Let wel op dat ze sociale contacten hebben op een dag.", "Maak een planning waarbij er ruimte zit tussen de activiteiten zodat mensen niet te lang in de ruimte aanwezig zijn aan een stuk. Zo kan er tussendoor goed geventileerd worden.", "Hoe langer mensen aanwezig zijn in een ruimte, hoe meer virusdeeltjes er in de ruimte komen en blijven hangen. Maar hoe meer tijd mensen in een ruimte doorbrengen, hoe meer interactie er is, wat goed is voor het welzijn."],
            ["Achterhaal hoe lang mensen in de woonkamer verblijven.", "Maak een planning waarbij er ruimte zit tussen de activiteiten zodat mensen niet te lang in de ruimte aanwezig zijn aan een stuk. Zo kan er tussendoor goed geventileerd worden. ", "Hoe langer mensen aanwezig zijn in een ruimte, hoe meer virusdeeltjes er in de ruimte komen en blijven hangen. Maar hoe meer tijd mensen in een ruimte doorbrengen, hoe meer interactie er is, wat goed is voor het welzijn."],
        ],
        q4: [
            ["Laat mensen apart verblijven als ze besmet zijn. Let op hoe het met hun mentale gezondheid gaat. Zorg voor andere manieren van contact (bellen, beeldbellen, raam).", "Maak een plan per persoon. Let op dat mensen in isolatie niet eenzaam worden. Bespreek wat zij nodig hebben.", "Als mensen apart kunnen en willen blijven wanneer dat nodig is, vormen zij een kleiner risico voor de rest. Ook zullen zij waarschijnlijk minder last ervaren (zoals eenzaamheid) dan mensen die niet apart kunnen en willen blijven. Als mensen zich vanwege psychische problemen niet kunnen isoleren, moeten ze niet geïsoleerd worden."],
            ["Laat mensen apart verblijven als ze besmet zijn waar dat kan. Gebruik anders voorzorgsmaatregelen (afstand houden, mondkapjes bij bewoner, PBM) rond mensen die besmet zijn. Let op hoe het met hun mentale gezondheid gaat. Zorg voor andere manieren van contact (bellen, beeldbellen, raam).", "Maak een plan per persoon. Bedenk andere manieren om veilig te blijven in de buurt van iemand die niet apart kan blijven van de rest. Let op dat mensen in isolatie niet eenzaam worden. Bespreek wat zij nodig hebben. ", "Als mensen apart kunnen en willen blijven wanneer dat nodig is, vormen zij een kleiner risico voor de rest. Ook zullen zij waarschijnlijk minder last ervaren (zoals eenzaamheid) dan mensen die niet apart kunnen en willen blijven. Als mensen zich vanwege psychische problemen niet kunnen isoleren, moeten ze niet geïsoleerd worden."],
            ["Gebruik voorzorgsmaatregelen (afstand houden, mondkapjes bij bewoner, PBM) rond mensen die besmet zijn. Let op hoe het met hun mentale gezondheid gaat. Zorg voor andere manieren van contact (bellen, beeldbellen, raam).", "Maak een plan per persoon. Bedenk andere manieren om veilig te blijven in de buurt van iemand die niet apart kan blijven van de rest. ", "Als mensen apart kunnen en willen blijven wanneer dat nodig is, vormen zij een kleiner risico voor de rest. Ook zullen zij waarschijnlijk minder last ervaren (zoals eenzaamheid) dan mensen die niet apart kunnen en willen blijven. Als mensen zich vanwege psychische problemen niet kunnen isoleren, moeten ze niet geïsoleerd worden."],
            ["Achterhaal of mensen in isolatie kunnen verblijven.", "Maak een plan per persoon. Bedenk andere manieren om veilig te blijven in de buurt van iemand die niet apart kan blijven van de rest. Let op dat mensen in isolatie niet eenzaam worden. Bespreek wat zij nodig hebben.", "Als mensen apart kunnen en willen blijven wanneer dat nodig is, vormen zij een kleiner risico voor de rest. Ook zullen zij waarschijnlijk minder last ervaren (zoals eenzaamheid) dan mensen die niet apart kunnen en willen blijven. Als mensen zich vanwege psychische problemen niet kunnen isoleren, moeten ze niet geïsoleerd worden."],
        ],
        q5: [
            ["Laat groepen zo min mogelijk met elkaar mengen.", "Creëer groepen die goed bij elkaar passen, zodat mengen zo min mogelijk nodig is.", "Groepen mengen zorgt voor meer bewegingsvrijheid, autonomie en sociale interacties voor de bewoners. Tegelijkertijd kan dit voor sommige bewoners ook erg verwarrend zijn omdat de groep dan heel groot wordt. Zorgverleners kunnen ook het overzicht kwijtraken. Het zorgt ook voor meer kans dat mensen een virus kunnen doorgeven."],
            ["Laat groepen zo min mogelijk met elkaar mengen.", "Creëer groepen die goed bij elkaar passen, zodat mengen zo min mogelijk nodig is.", "Groepen mengen zorgt voor meer bewegingsvrijheid, autonomie en sociale interacties voor de bewoners. Tegelijkertijd kan dit voor sommige bewoners ook erg verwarrend zijn omdat de groep dan heel groot wordt. Zorgverleners kunnen ook het overzicht kwijtraken. Het zorgt ook voor meer kans dat mensen een virus kunnen doorgeven."],
            ["Laat groepen zo min mogelijk met elkaar mengen.", "Creëer groepen die goed bij elkaar passen, zodat mengen zo min mogelijk nodig is.", "Groepen mengen zorgt voor meer bewegingsvrijheid, autonomie en sociale interacties voor de bewoners. Tegelijkertijd kan dit voor sommige bewoners ook erg verwarrend zijn omdat de groep dan heel groot wordt. Zorgverleners kunnen ook het overzicht kwijtraken. Het zorgt ook voor meer kans dat mensen een virus kunnen doorgeven."],
            ["Groepen mengen niet. Geen actie vereist.","Plaats nieuwe bewoners in een groep die het beste bij hen past zodat mengen zo min mogelijk nodig is.","Groepen mengen zorgt voor meer bewegingsvrijheid, autonomie en sociale interacties voor de bewoners. Tegelijkertijd kan dit voor sommige bewoners ook erg verwarrend zijn omdat de groep dan heel groot wordt. Zorgverleners kunnen ook het overzicht kwijtraken. Het zorgt ook voor meer kans dat mensen een virus kunnen doorgeven.",],
            ["Achterhaal of de groepen met elkaar mengen.", "Creëer groepen die goed bij elkaar passen, zodat mengen zo min mogelijk nodig is.", "Groepen mengen zorgt voor meer bewegingsvrijheid, autonomie en sociale interacties voor de bewoners. Tegelijkertijd kan dit voor sommige bewoners ook erg verwarrend zijn omdat de groep dan heel groot wordt. Zorgverleners kunnen ook het overzicht kwijtraken. Het zorgt ook voor meer kans dat mensen een virus kunnen doorgeven."],
        ],
        q8: [
            ["Zorg dat mensen op 1,5 meter van elkaar zitten.", "Geen actie vereist. Als de inrichting verandert, zorg dan dat mensen nog steeds op 1,5 meter kunnen zitten.", "Afstand houden van elkaar is goed voor de veiligheid. Dan is er minder risico dat mensen elkaar besmetten. Het beperkt wel de sociale interacties."],
            ["Zet mensen zo veel mogelijk op 1,5m afstand. Gebruik desnoods andere beschermingsmaatregelen zoals mondkapjes of schermen.", "Richt de woonkamer zo in dat iedereen op 1,5 meter van elkaar kan zitten.", "Afstand houden van elkaar is goed voor de veiligheid. Dan is er minder risico dat mensen elkaar besmetten. Het beperkt wel de sociale interacties."],
            ["Zet mensen zo veel mogelijk op 1,5m afstand.", "Zorg dat de activiteit goed gedaan kan worden met iedereen op 1,5m. Kan dat niet, zorg dan voor andere voorzorgsmaatregelen zoals tussenschotten of mondkapjes.", "Afstand houden van elkaar is goed voor de veiligheid. Dan is er minder risico dat mensen elkaar besmetten. Het beperkt wel de sociale interacties."],
            ["Achterhaal of mensen op 1,5 meter kunnen zitten in de woonkamer.", "Zorg dat de activiteit goed gedaan kan worden met iedereen op 1,5m. Kan dat niet, zorg dan voor andere voorzorgsmaatregelen zoals tussenschotten of mondkapjes.", "Afstand houden van elkaar is goed voor de veiligheid. Dan is er minder risico dat mensen elkaar besmetten. Het beperkt wel de sociale interacties."],
        ],
        q9: [
            ["Zet de ramen zo veel mogelijk open waar dat kan.", "Zorg dat er voldoende ramen naar buiten zijn die gemakkelijk te openen zijn.", "Ramen die open kunnen betekent ook dat er meer frisse lucht naar binnen kan. Dat is belangrijk tijdens een pandemie. Zelf ramen kunnen openen en sluiten zorgt voor autonomie, controle en gevoel van veiligheid van medewerkers en bewoners. Let op dat het kan leiden tot tocht, koude en luchtwegklachten."],
            ["Als er geen ramen en deuren zijn, zet dan het ventilatiesysteem harder.", "Zorg dat er voldoende ramen naar buiten zijn die gemakkelijk te openen zijn.", "Ramen die open kunnen betekent ook dat er meer frisse lucht naar binnen kan. Dat is belangrijk tijdens een pandemie. Zelf ramen kunnen openen en sluiten zorgt voor autonomie, controle en gevoel van veiligheid van medewerkers en bewoners. Let op dat het kan leiden tot tocht, koude en luchtwegklachten."],
            ["Achterhaal of er ramen en deuren zijn die naar buiten open kunnen.", "Zorg dat er voldoende ramen naar buiten zijn die gemakkelijk te openen zijn.", "Ramen die open kunnen betekent ook dat er meer frisse lucht naar binnen kan. Dat is belangrijk tijdens een pandemie. Zelf ramen kunnen openen en sluiten zorgt voor autonomie, controle en gevoel van veiligheid van medewerkers en bewoners. Let op dat het kan leiden tot tocht, koude en luchtwegklachten."],
        ],
        q10: [
            ["Zorg dat de ventilatieroosters schoon zijn en zet ze open.", "Zorg dat er voldoende ventilatieroosters zijn en dat onderhoud daarvan goed is zodat deze altijd schoon zijn.", "Ventilatieroosters zorgen voor meer frisse lucht. Dat is belangrijk tijdens een pandemie. Zelf de roosters kunnen openen en sluiten zorgt voor autonomie, controle en gevoel van veiligheid van medewerkers en bewoners. Let op dat het kan leiden tot tocht, koude en luchtwegklachten."],
            ["Als er geen ventilatieroosters zijn, zet dan het ventilatiesysteem harder.", "Zorg dat er voldoende ventilatieroosters zijn en dat onderhoud daarvan goed is zodat deze altijd schoon zijn.", "Ventilatieroosters zorgen voor meer frisse lucht. Dat is belangrijk tijdens een pandemie. Zelf de roosters kunnen openen en sluiten zorgt voor autonomie, controle en gevoel van veiligheid van medewerkers en bewoners. Let op dat het kan leiden tot tocht, koude en luchtwegklachten."],
            ["Achterhaal of er ventilatieroosters zijn.", "Zorg dat er voldoende ventilatieroosters zijn en dat onderhoud daarvan goed is zodat deze altijd schoon zijn.", "Ventilatieroosters zorgen voor meer frisse lucht. Dat is belangrijk tijdens een pandemie. Zelf de roosters kunnen openen en sluiten zorgt voor autonomie, controle en gevoel van veiligheid van medewerkers en bewoners. Let op dat het kan leiden tot tocht, koude en luchtwegklachten."],
        ],
        q11: [
            ["Zorg voor zo veel mogelijk ventilatie.", "Investeer in een nieuw ventilatiesysteem. Het beste is type D (mechanische luchttoe- en afvoer).", "De bouwvoorschriften en de overheid stellen ventilatie-eisen. Zorg ervoor dat u weet wat deze eisen zijn en dat uw gebouw hieraan voldoet."],
            ["Zorg voor zo veel mogelijk ventilatie.", "Investeer in een nieuw ventilatiesysteem. Het beste is type D (mechanische luchttoe- en afvoer).", "De bouwvoorschriften en de overheid stellen ventilatie-eisen. Zorg ervoor dat u weet wat deze eisen zijn en dat uw gebouw hieraan voldoet."],
            ["Zorg voor zo veel mogelijk ventilatie.", "Investeer in een nieuw ventilatiesysteem. Het beste is type D (mechanische luchttoe- en afvoer).", "De bouwvoorschriften en de overheid stellen ventilatie-eisen. Zorg ervoor dat u weet wat deze eisen zijn en dat uw gebouw hieraan voldoet."],
            ["Zet het ventilatiesysteem zo hard mogelijk.", "Zorg dat onderhoud van het systeem op orde is.", "De bouwvoorschriften en de overheid stellen ventilatie-eisen. Zorg ervoor dat u weet wat deze eisen zijn en dat uw gebouw hieraan voldoet."],
            ["Achterhaal wat voor type ventilatiesysteem geinstalleerd is.", "Investeer in een nieuw ventilatiesysteem. Het beste is type D (mechanische luchttoe- en afvoer).", "De bouwvoorschriften en de overheid stellen ventilatie-eisen. Zorg ervoor dat u weet wat deze eisen zijn en dat uw gebouw hieraan voldoet."],
        ],
        q12: [
            ["Vraag de technische dienst om recirculatie uit te zetten.", "Investeer in een ventilatiesysteem waarbij lucht niet wordt gerecirculeerd.", "Recirculatie van lucht betekent dat 'besmette' lucht terug de ruimte in komt. Dit zorgt voor snellere verspreiding van een virus."],
            ["Geen recirculatie. Geen actie vereist.", "Zorg dat er in de toekomst ook geen recirculatie is. ", "Recirculatie van lucht betekent dat 'besmette' lucht terug de ruimte in komt. Dit zorgt voor snellere verspreiding van een virus."],
            ["Achterhaal of er recirculatie van lucht is.", "Investeer in een ventilatiesysteem waarbij lucht niet wordt gerecirculeerd.", "Recirculatie van lucht betekent dat 'besmette' lucht terug de ruimte in komt. Dit zorgt voor snellere verspreiding van een virus."],
        ],
        q13: [
            ["Gebruik de luchtkwaliteitsmeter om in de gaten te houden of er goed geventileerd wordt.", "Zorg dat er luchtkwaliteitsmeters zijn in elke ruimte en dat het ventilatiesysteem daardoor aangestuurd wordt.", "Luchtkwaliteitsmeter geven inzicht in hoeveel frisse lucht er in de kamer is. Als er weinig frisse lucht is zal een virus zich meer ophopen en sneller verspreiden."],
            ["Koop een luchtkwaliteitsmeter voor de ruimte.", "Zorg dat er luchtkwaliteitsmeters zijn in elke ruimte en dat het ventilatiesysteem daardoor aangestuurd wordt.", "Luchtkwaliteitsmeter geven inzicht in hoeveel frisse lucht er in de kamer is. Als er weinig frisse lucht is zal een virus zich meer ophopen en sneller verspreiden."],
            ["Achterhaal of er een luchtkwaliteitsmeter in de ruimte is.", "Zorg dat er luchtkwaliteitsmeters zijn in elke ruimte en dat het ventilatiesysteem daardoor aangestuurd wordt.", "Luchtkwaliteitsmeter geven inzicht in hoeveel frisse lucht er in de kamer is. Als er weinig frisse lucht is zal een virus zich meer ophopen en sneller verspreiden."],
        ],
        q14: [
            ["Het CO₂‑niveau is prima. Geen actie vereist.", "Zorg dat het CO₂‑niveau onder de 800ppm blijft. Gebruik de CO₂‑waarde om ventilatie aan of bij te sturen.", "Een hoge CO₂‑waarde wil zeggen dat er weinig frisse lucht is in de kamer. Dat zorgt voor een ophoping van virusdeeltjes en grotere kans op verspreiding van het virus. In de langdurige zorg is de richtlijn dat de CO₂‑waarde onder 1200ppm moet zijn maar voor kwetsbare groepen is het beter om dit onder 800ppm te houden. Frisse lucht heeft ook gezondheidsvoordelen: mensen voelen zich fitter."],
            ["Het CO₂‑niveau is op risiconiveau. Probeer het omlaag te krijgen met meer ventilatie.", "Gebruik de CO₂‑waarde om ventilatie aan of bij te sturen.", "Een hoge CO₂‑waarde wil zeggen dat er weinig frisse lucht is in de kamer. Dat zorgt voor een ophoping van virusdeeltjes en grotere kans op verspreiding van het virus. In de langdurige zorg is de richtlijn dat de CO₂‑waarde onder 1200ppm moet zijn maar voor kwetsbare groepen is het beter om dit onder 800ppm te houden. Frisse lucht heeft ook gezondheidsvoordelen: mensen voelen zich fitter."],
            ["Zorg dat de CO₂‑waarde tijdens drukte onder 1200ppm blijft. Voor kwetsbare groepen met het onder de 800ppm blijven. Zorg ervoor dat het daalt door meer te ventileren.", "Gebruik de CO₂‑waarde om ventilatie aan of bij te sturen.", "Een hoge CO₂‑waarde wil zeggen dat er weinig frisse lucht is in de kamer. Dat zorgt voor een ophoping van virusdeeltjes en grotere kans op verspreiding van het virus. In de langdurige zorg is de richtlijn dat de CO₂‑waarde onder 1200ppm moet zijn maar voor kwetsbare groepen is het beter om dit onder 800ppm te houden. Frisse lucht heeft ook gezondheidsvoordelen: mensen voelen zich fitter."],
            ["Zorg dat er een CO₂‑meter in de ruimte is.", "Gebruik de CO₂‑waarde om ventilatie aan of bij te sturen.", "Een hoge CO₂‑waarde wil zeggen dat er weinig frisse lucht is in de kamer. Dat zorgt voor een ophoping van virusdeeltjes en grotere kans op verspreiding van het virus. In de langdurige zorg is de richtlijn dat de CO₂‑waarde onder 1200ppm moet zijn maar voor kwetsbare groepen is het beter om dit onder 800ppm te houden. Frisse lucht heeft ook gezondheidsvoordelen: mensen voelen zich fitter."],
        ],
        q15: [
            ["Ventilatiesysteem is onderhouden. Geen actie vereist.", "Zorg voor tijdige controles en onderhoud.", "Een goed onderhouden ventilatiesysteem zorgt voor een veilige lucht in de ruimte. Virusdeeltjes hebben dan minder kans om in de lucht te blijven hangen en mensen te besmetten. Als medewerkers en bewoners weten dat dit goed onderhouden wordt geeft dit een gevoel van veiligheid en vergroot dit het vertrouwen in het ventilatiesysteem."],
            ["Laat het ventilatiesysteem zo snel mogelijk controleren en pleeg het nodige onderhoud.", "Zorg voor tijdige controles en onderhoud.", "Een goed onderhouden ventilatiesysteem zorgt voor een veilige lucht in de ruimte. Virusdeeltjes hebben dan minder kans om in de lucht te blijven hangen en mensen te besmetten. Als medewerkers en bewoners weten dat dit goed onderhouden wordt geeft dit een gevoel van veiligheid en vergroot dit het vertrouwen in het ventilatiesysteem."],
            ["Achterhaal wanneer het ventilatiesysteem voor het laatst onderhouden is.", "Zorg voor tijdige controles en onderhoud.", "Een goed onderhouden ventilatiesysteem zorgt voor een veilige lucht in de ruimte. Virusdeeltjes hebben dan minder kans om in de lucht te blijven hangen en mensen te besmetten. Als medewerkers en bewoners weten dat dit goed onderhouden wordt geeft dit een gevoel van veiligheid en vergroot dit het vertrouwen in het ventilatiesysteem."],
        ],
        q16: [
            ["Probeer de last van ventilatie weg te nemen door bijvoorbeeld de filters schoon te maken (geluid), de stoelpositie te veranderen (tocht), de temperatuur te verhogen (koud) of extra te ventileren op momenten dat er weinig mensen zijn die er last van hebben.", "Zorg voor een ventilatiesysteem die bij de doelgroep past. Bij last van geluid, investeer in een stil systeem. Bij last van koud, zorg voor extra warmte.", "Een goed onderhouden ventilatiesysteem zorgt voor een veilige lucht in de ruimte. Virusdeeltjes hebben dan minder kans om in de lucht te blijven hangen en mensen te besmetten. Als medewerkers en bewoners weten dat dit goed onderhouden wordt geeft dit een gevoel van veiligheid en vergroot dit het vertrouwen in het ventilatiesysteem."],
            ["Probeer de last van ventilatie weg te nemen door bijvoorbeeld de filters schoon te maken (geluid), de stoelpositie te veranderen (tocht), de temperatuur te verhogen (koud) of extra te ventileren op momenten dat er weinig mensen zijn die er last van hebben.", "Zorg voor een ventilatiesysteem die bij de doelgroep past. Bij last van geluid, investeer in een stil systeem. Bij last van koud, zorg voor extra warmte.", "Als mensen last hebben van het extra ventileren kunnen zij zich anders gaan gedragen (niet meer naar activiteiten komen) of er zelfs ziek van worden als zij hier vatbaar voor zijn. Zorg daarom voor een ventilatiesysteem dat goed kan ventileren én de klachten bij bewoners minimaal houdt."],
            ["Geen last van extra ventilatie. Geen actie vereist.", "Zorg voor een ventilatiesysteem die bij de doelgroep past. Bij last van geluid, investeer in een stil systeem. Bij last van koud, zorg voor extra warmte.", "Als mensen last hebben van het extra ventileren kunnen zij zich anders gaan gedragen (niet meer naar activiteiten komen) of er zelfs ziek van worden als zij hier vatbaar voor zijn. Zorg daarom voor een ventilatiesysteem dat goed kan ventileren én de klachten bij bewoners minimaal houdt."],
            ["Achterhaal of bewoners last hebben van extra ventileren.", "Zorg voor een ventilatiesysteem die bij de doelgroep past. Bij last van geluid, investeer in een stil systeem. Bij last van koud, zorg voor extra warmte.", "Als mensen last hebben van het extra ventileren kunnen zij zich anders gaan gedragen (niet meer naar activiteiten komen) of er zelfs ziek van worden als zij hier vatbaar voor zijn. Zorg daarom voor een ventilatiesysteem dat goed kan ventileren én de klachten bij bewoners minimaal houdt."],
        ],
        q17: [
            ["Er zijn duidelijke instructies. Geen actie vereist.", "Stel richtlijnen en instructies op. Zorg ervoor dat alle medewerkers en bewoners deze instructies begrijpen, kennen en weten waar ze te vinden zijn.", "Met duidelijke instructies kan iedereen helpen met goed ventileren. Dit zorgt niet voor een betere binnenlucht maar ook voor autonomie."],
            ["Zorg dat er korte instructies voor ramen/roosters/instellingen aanwezig zijn en dat deze begrijpelijk en zichtbaar zijn voor iedereen.", "Stel richtlijnen en instructies op. Zorg ervoor dat alle medewerkers en bewoners deze instructies begrijpen, kennen en weten waar ze te vinden zijn.", "Met duidelijke instructies kan iedereen helpen met goed ventileren. Dit zorgt niet voor een betere binnenlucht maar ook voor autonomie."],
            ["Achterhaal of er korte en goed leesbare instructies zijn voor het gebruik van ramen, ventilatieroosters en het ventilatiesysteem.", "Stel richtlijnen en instructies op. Zorg ervoor dat alle medewerkers en bewoners deze instructies begrijpen, kennen en weten waar ze te vinden zijn.", "Met duidelijke instructies kan iedereen helpen met goed ventileren. Dit zorgt niet voor een betere binnenlucht maar ook voor autonomie."],
        ],
        q18: [
            ["PBM beschikbaar. Geen actie vereist.", "Zorg dat er altijd voldoende persoonlijke beschermingsmiddelen (PBM) zijn waar nodig.", "Persoonlijke beschermingsmiddelen (PBM) zorgen ervoor dat medewerkers hun werk veilig kunnen doen en dat bewoners beschermd worden tegen een virus."],
            ["Koop persoonlijke beschermingsmiddelen (PBM).", "Zorg dat er altijd voldoende persoonlijke beschermingsmiddelen (PBM) zijn waar nodig.", "Persoonlijke beschermingsmiddelen (PBM) zorgen ervoor dat medewerkers hun werk veilig kunnen doen en dat bewoners beschermd worden tegen een virus."],
            ["Koop persoonlijke beschermingsmiddelen (PBM).", "Zorg dat er altijd voldoende persoonlijke beschermingsmiddelen (PBM) zijn waar nodig.", "Persoonlijke beschermingsmiddelen (PBM) zorgen ervoor dat medewerkers hun werk veilig kunnen doen en dat bewoners beschermd worden tegen een virus."],
            ["Achterhaal of er persoonlijke beschermingsmiddelen (PBM) beschikbaar zijn.", "Zorg dat er altijd voldoende persoonlijke beschermingsmiddelen (PBM) zijn waar nodig.", "Persoonlijke beschermingsmiddelen (PBM) zorgen ervoor dat medewerkers hun werk veilig kunnen doen en dat bewoners beschermd worden tegen een virus."],
        ],
        q19: [
            ["Geen onbezette diensten. Geen actie vereist.", "Zorg ervoor dat er ook in de toekomst geen onbezette diensten zijn.", "Dat alle diensten gevuld zijn door de juiste personen is belangrijk voor de continuïteit van de zorg. Als dit niet zo is zullen extra maatregelen moeilijk uitvoerbaar zijn. Dit gaat ten koste van de fysieke en mentale zorg voor de bewoner en kwaliteit van werk voor de medewerker."],
            ["Zet extra personeel in.", "Stel permanente teams en stabiele roosters op, zodat er geen diensten onbezet blijven.", "Dat alle diensten gevuld zijn door de juiste personen is belangrijk voor de continuïteit van de zorg. Als dit niet zo is zullen extra maatregelen moeilijk uitvoerbaar zijn. Dit gaat ten koste van de fysieke en mentale zorg voor de bewoner en kwaliteit van werk voor de medewerker. "],
            ["Zet extra personeel in.", "Stel permanente teams en stabiele roosters op, zodat er geen diensten onbezet blijven.", "Dat alle diensten gevuld zijn door de juiste personen is belangrijk voor de continuïteit van de zorg. Als dit niet zo is zullen extra maatregelen moeilijk uitvoerbaar zijn. Dit gaat ten koste van de fysieke en mentale zorg voor de bewoner en kwaliteit van werk voor de medewerker. "],
            ["Zet extra personeel in.", "Stel permanente teams en stabiele roosters op, zodat er geen diensten onbezet blijven.", "Dat alle diensten gevuld zijn door de juiste personen is belangrijk voor de continuïteit van de zorg. Als dit niet zo is zullen extra maatregelen moeilijk uitvoerbaar zijn. Dit gaat ten koste van de fysieke en mentale zorg voor de bewoner en kwaliteit van werk voor de medewerker. "],
            ["Achterhaal of er onbezette diensten zijn geweest in de afgelopen 14 dagen.", "Zorg ervoor dat er geen onbezette diensten zijn. Investeer in meer personeel.", "Dat alle diensten gevuld zijn door de juiste personen is belangrijk voor de continuïteit van de zorg. Als dit niet zo is zullen extra maatregelen moeilijk uitvoerbaar zijn. Dit gaat ten koste van de fysieke en mentale zorg voor de bewoner en kwaliteit van werk voor de medewerker."],
        ],
        q20: [
            ["Er wordt in vaste teams gewerkt. Geen actie vereist.", "Blijf in vaste teams werken.", "Vaste teams houdt in dat medewerkers zo min mogelijk tussen woonkamers en afdelingen wisselen. Zo wordt de kans kleiner dat de ene groep een andere groep kan besmetten. Dit is ook fijn omdat het duidelijkheid geeft voor medewerkers en bewoners. Bewoners raken minder snel overprikkeld en medewerkers kunnen het overzicht beter houden, kunnen de bewoners beter in de gaten houden en zien als er iets niet goed gaat met iemand. Als er niet met vaste teams wordt gewerkt, is er meer interactie, vrijheid en autonomie."],
            ["Werk in vaste teams.", "Maak afspraken over vaste teams en zorg dat dat op een structurele manier gebeurt. ", "Vaste teams houdt in dat medewerkers zo min mogelijk tussen woonkamers en afdelingen wisselen. Zo wordt de kans kleiner dat de ene groep een andere groep kan besmetten. Dit is ook fijn omdat het duidelijkheid geeft voor medewerkers en bewoners. Bewoners raken minder snel overprikkeld en medewerkers kunnen het overzicht beter houden, kunnen de bewoners beter in de gaten houden en zien als er iets niet goed gaat met iemand. Als er niet met vaste teams wordt gewerkt, is er meer interactie, vrijheid en autonomie."],
            ["Werk in vaste teams.", "Maak afspraken over vaste teams en zorg dat dat op een structurele manier gebeurt. ", "Vaste teams houdt in dat medewerkers zo min mogelijk tussen woonkamers en afdelingen wisselen. Zo wordt de kans kleiner dat de ene groep een andere groep kan besmetten. Dit is ook fijn omdat het duidelijkheid geeft voor medewerkers en bewoners. Bewoners raken minder snel overprikkeld en medewerkers kunnen het overzicht beter houden, kunnen de bewoners beter in de gaten houden en zien als er iets niet goed gaat met iemand. Als er niet met vaste teams wordt gewerkt, is er meer interactie, vrijheid en autonomie."],
            ["Achterhaal of er in vaste teams wordt gewerkt.", "Maak afspraken over vaste teams en zorg dat dat op een structurele manier gebeurt. ", "Vaste teams/groepen betekenen dat het personeel zo min mogelijk tussen kamers en afdelingen beweegt en dat bewoners in vaste groepen wonen. Dit vermindert het risico dat de ene groep de andere besmet. Dit is ook gunstig omdat het duidelijkheid schept voor personeel en bewoners. Bewoners raken minder snel overprikkeld en het personeel kan een beter overzicht houden, bewoners beter in de gaten houden en herkennen of er iets mis is met iemand. Het niet werken met vaste teams en groepen zorgt echter voor meer interacties, vrijheid en autonomie."],
        ],
        q21: [
            ["Er is budget om te investeren in aanpassingen of maatregelen (onderhoud, sensoren, roosters, PBM, extra personeel). Geen actie vereist.", "Zorg dat aanpassingen die al mogelijk zijn al worden gedaan (onderhoud, sensoren, roosters) en dat er structureel budget is voor extra aanpassingen of maatregelen (PBM, extra personeel).", "Aanpassingen en maatregelen om de veiligheid van medewerkers en bewoners te waarborgen kosten vaak geld. Het is belangrijk dat hier rekening mee wordt gehouden in het budget. Houdt ook rekening met onverwachte kosten. Dit zorgt voor een veilige werk- en leefomgeving. "],
            ["Maak zo snel mogelijk budget vrij voor aanpassingen of maatregelen (onderhoud, sensoren, roosters, PBM, extra personeel).", "Zorg dat aanpassingen die al mogelijk zijn al worden gedaan (onderhoud, sensoren, roosters) en dat er structureel budget is voor extra aanpassingen of maatregelen (PBM, extra personeel).", "Aanpassingen en maatregelen om de veiligheid van medewerkers en bewoners te waarborgen kosten vaak geld. Het is belangrijk dat hier rekening mee wordt gehouden in het budget. Houdt ook rekening met onverwachte kosten. Dit zorgt voor een veilige werk- en leefomgeving. "],
            ["Zorg voor meer budget om te investeren in aanpassingen of maatregelen (onderhoud, sensoren, roosters, PBM, extra personeel).", "Zorg dat aanpassingen die al mogelijk zijn al worden gedaan (onderhoud, sensoren, roosters) en dat er structureel budget is voor extra aanpassingen of maatregelen (PBM, extra personeel).", "Aanpassingen en maatregelen om de veiligheid van medewerkers en bewoners te waarborgen kosten vaak geld. Het is belangrijk dat hier rekening mee wordt gehouden in het budget. Houdt ook rekening met onverwachte kosten. Dit zorgt voor een veilige werk- en leefomgeving. "],
            ["Achterhaal of er budget is om te investeren in aanpassingen of maatregelen (onderhoud, sensoren, roosters, PBM, extra personeel).", "Zorg dat aanpassingen die al mogelijk zijn al worden gedaan (onderhoud, sensoren, roosters) en dat er structureel budget is voor extra aanpassingen of maatregelen (PBM, extra personeel).", "Aanpassingen en maatregelen om de veiligheid van medewerkers en bewoners te waarborgen kosten vaak geld. Het is belangrijk dat hier rekening mee wordt gehouden in het budget. Houdt ook rekening met onverwachte kosten. Dit zorgt voor een veilige werk- en leefomgeving. "],
        ],
    }
};
  
export const scoringRules = {
    // 'q1': { values: [3, 5, 3, 2, 1], risk: [0, 0, 0, 0, 0] },
    // 'q2': { values: [5, 5, 5, 5], risk: [0, 0, 0, 0, 0] },
    'q3': { values: [1, 3, 5], risk: [5, 3, 0] },
    'q4': { values: [5, 3, 1], risk: [0, 3, 5] },
    'q5': { values: [0, 0, 0], risk: [5, 4, 3, 0,0] },
    'q8': { values: [5, 3, 1], risk: [0, 3, 5] },
    'q9': { values: [5, 1], risk: [0, 5] },
    'q10': { values: [5, 1], risk: [0, 5] },
    'q11': { values: [0, 0, 0, 0], risk: [5, 3, 4, 0] },
    'q12': { values: [0, 0], risk: [5, 0] },
    'q13': { values: [5, 1], risk: [0, 5] },
    'q14': { values: [5, 3, 1, 0], risk: [0, 3, 5, 5] },
    'q15': { values: [5, 1], risk: [0, 5] },
    'q16': { values: [1, 3, 5], risk: [5, 3, 0] },
    'q17': { values: [5, 1], risk: [0, 5] },
    'q18': { values: [5, 3, 1], risk: [0, 3, 5] },
    'q19': { values: [5, 4, 3, 1], risk: [0, 3, 4, 5] },
    'q20': { values: [5, 5, 5], risk: [0, 3, 5] },
    'q21': { values: [5, 3, 1], risk: [0, 3, 5] },
};

// --- Exports ---
export { AnalysisRow, FancyParaatDial, ReliabilityScoreBar };