import React, { useState } from 'react';

const Dial = ({ value, label }) => {
    const rotation = (value / 100) * 180 - 90;
    const isReversed = label.includes("Risk of exposure");
  
    const getColor = (val) => {
      if (isReversed) {
        if (val > 66) return "#ef4444";
        if (val > 33) return "#f59e0b";
        return "#22c55e";
      } else {
        if (val > 66) return "#22c55e";
        if (val > 33) return "#f59e0b";
        return "#ef4444";
      }
    };
    const needleColor = getColor(value);
    const lowColor = isReversed ? "#22c55e" : "#ef4444";
    const mediumColor = "#f59e0b";
    const highColor = isReversed ? "#ef4444" : "#22c55e";
    const p1 = { x: 30, y: 15.3 };
    const p2 = { x: 70, y: 15.3 };
  
    return (
      <div className="relative flex flex-col items-center">
        <svg viewBox="0 0 100 60" className="w-40 h-auto">
          <path d={`M 10 50 A 40 40 0 0 1 ${p1.x} ${p1.y}`} stroke={lowColor} strokeWidth="10" fill="none" />
          <path d={`M ${p1.x} ${p1.y} A 40 40 0 0 1 ${p2.x} ${p2.y}`} stroke={mediumColor} strokeWidth="10" fill="none" />
          <path d={`M ${p2.x} ${p2.y} A 40 40 0 0 1 90 50`} stroke={highColor} strokeWidth="10" fill="none" />
          <g transform={`rotate(${rotation} 50 50)`}>
            <path d="M 50 50 L 50 15" stroke={needleColor} strokeWidth="3" />
            <circle cx="50" cy="50" r="5" fill={needleColor} />
          </g>
          <text x="10" y="58" fontSize="8" fill="#64748b" textAnchor="middle">LOW</text>
          <text x="50" y="5.5" fontSize="8" fill="#64748b" textAnchor="middle">MEDIUM</text>
          <text x="90" y="58" fontSize="8" fill="#64748b" textAnchor="middle">HIGH</text>
        </svg>
        <span className="mt-1 text-sm font-semibold text-slate-600">{label}</span>
      </div>
    );
  };

const AnalysisRow = ({ title, score1, score2, recommendations }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          </div>
          <div className="md:col-span-4 flex justify-around">
            <Dial value={score1} label="Values" />
            <Dial value={score2} label="Risk of exposure" />
          </div>
          <div className="md:col-span-6 flex items-center justify-end">
            <svg className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-semibold text-slate-700 mb-2 pb-2 border-b border-slate-200">
              <h4>Impact on risk of exposure</h4>
              <h4>Impact on values</h4>
              <h4>Preventive Actions</h4>
            </div>
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

const TotalScoreBar = ({ label, value, colorClass }) => {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-bold text-slate-800 mb-2">{label}</h3>
        <div className="w-full bg-slate-200 rounded-full h-6">
          <div className={`${colorClass} h-6 rounded-full transition-all duration-1000`} style={{ width: `${value}%` }}></div>
        </div>
      </div>
    );
  };

export const recommendations = {
    en: {
      'q4': [
        ["If people can and are willing to isolate or take preventive measures, the risk of exposure decreases.", "Isolation may reduce quality of life by increasing anxiety and loneliness, in addition to other potential health problems. Quality of life will likely be less affected if people are comfortable and willing to be alone.", "Prepare residents by sharing the plan with them so they are prepared when a new pandemic breaks out."],
        ["If people are unable or unwilling to comply with the measures, the risk of exposure increases.", "Isolation may reduce quality of life by increasing anxiety and loneliness, in addition to other potential health problems. This will be even more pronounced if people are forced to isolate themselves when they don't want to. Autonomy will diminish, and this can lead to ethical discussions.", "Create a personalized plan for each person. Consider alternatives to stay safe around someone who can't isolate themselves."]
      ],
      'q5': [
        ["If people understand the situation and can remember the measures, they are more likely to comply, reducing the risk of exposure. They are also less likely to fear workers in personal protective equipment, allowing them to do their jobs safely and reducing the risk of exposure.", "People with good cognitive abilities understand the situation better and remember the measures better. This has a positive impact on values such as quality of life, autonomy, sense of safety, and health.", "Prepare residents by creating an action plan for a new pandemic together or sharing it with them so they are aware."],
        ["If people have difficulty understanding the situation and remembering the measures, they are less likely to comply, increasing the risk of exposure. If they are afraid of workers in personal protective equipment, this can make it difficult for them to perform their jobs safely, increasing the risk of exposure.", "People with cognitive impairments may not fully understand the situation or remember the measures. This can negatively impact values such as quality of life, autonomy, sense of safety, and health.", "Increase daily hygiene measures so they become more routine for residents. Use simple messages (such as pictograms) to increase understanding."],
        ["If people cannot understand the situation and cannot remember the measures, they are less likely to comply, increasing the risk of exposure. If they are afraid of workers in personal protective equipment, this can make it difficult for them to perform their jobs safely, increasing the risk of exposure.", "People with severe cognitive impairments are unlikely to fully understand the situation and/or remember the measures. This can negatively impact values such as quality of life, autonomy, sense of safety, and health.", "Increase daily hygiene measures so they become more routine. Display posters with simple messages (such as pictograms) to remind people of the measures. Involve familiar people (e.g., family) in the communication."]
      ],
      'q6': [
        ["Good knowledge increases the chance of good action and reduces the risk of exposure.", "Sufficient knowledge creates autonomy and a sense of security. People can assess risks themselves and act accordingly.", "Keep knowledge up to date with regular updates or refreshers (posters, flyers, courses, articles, etc.)."],
        ["A lack of knowledge increases the risk of exposure.", "A lack of knowledge reduces autonomy and prevents people from feeling safe. People cannot accurately assess risks themselves and act accordingly.", "Ensure that everyone's knowledge of infection prevention grows. This can be done, for example, through courses, flyers, posters, and articles."]
      ],
      'q12': [
        ["With recirculation, the risk of contamination will be greater because a virus can be spread within a building via the ventilation system.", "With recirculation, there will be less fresh air which could negatively impact comfort by affecting eyes, nose and throat.", "Contact the building's facility manager/HVAC supplier and ensure that recirculation is not occurring."],
        ["No recirculation ensures a constant flow of fresh air. This prevents a virus from spreading within a building through the ventilation system.", "With no recirculation, there will be more fresh air which could impact comfort positively by making people feel refreshed.", "No action is required."]
      ],
      'q14': [
        ["Good air ventilation reduces the risk of exposure. 1. Good ventilation systems improve health, sense of safety, quality of life, and quality of work.", "Good ventilation systems improve health, sense of safety, quality of life, and quality of work.", "Ensure regular maintenance. Perform regular checks to understand exactly how your system is functioning and how you can adjust it to ensure it functions properly during a pandemic."],
        ["Poor ventilation systems can reduce health, sense of safety, quality of life, and quality of work.", "Perform additional maintenance to ensure it is functioning properly. Also, perform regular checks to understand exactly how your system is functioning and how you can adjust it to ensure it functions properly during a pandemic.", "Slechte luchtventilatie verhoogt het risico op blootstelling."],
        ["Good ventilation lowers exposure risk by removing airborne viruses and bringing in fresh air.", "No ventilation system reduces health, sense of safety, quality of life, and quality of work.", "Install a ventilation system and ensure it is functioning properly. Also, perform regular checks to understand exactly how your system is functioning and how you can adjust it to ensure it functions properly during a pandemic."]
      ],
      'q15': [
        ["Good air quality reduces the risk of exposure.", "Good air quality improves health, sense of safety, quality of life, and quality of work.", "Perform regular check-ups."],
        ["Poor air quality increases the risk of exposure.", "Poor air quality can reduce health, sense of safety, quality of life, and quality of work. Poor air quality also reduces confidence in the ventilation system.", "Repair the ventilation system. Make sure it's working properly."],
        ["Poor air quality increases the risk of exposure.", "Poor air quality can reduce health, sense of safety, quality of life, and quality of work. Poor air quality also reduces confidence in the ventilation system.", "Repair the ventilation system. Make sure it's working properly."]
      ],
      'q16': [
        ["If there are no complaints, ventilation can be increased without any problems. This reduces the risk of exposure.", "Increased ventilation improves health and work quality. If residents experience no discomfort from increased ventilation, it likely won't affect values like comfort.", "Educate residents and employees about the positive effects of increased ventilation."],
        ["If there are no complaints, ventilation can be increased without any problems. This reduces the risk of exposure.", "Increased ventilation improves health and work quality. If residents experience the positive effects of ventilation, that's an additional reason to increase ventilation. This increases their sense of safety.", "No action required."],
        ["If there are many complaints, ventilation cannot be increased as much/as often as desired, which increases the risk of exposure.", "Increased ventilation improves health and work quality. However, if residents develop colds and stiff necks when ventilation is increased, their comfort level drops significantly. They're likely to complain, and it becomes a constant battle with staff, which in turn reduces work quality.", "Educate residents and employees about the positive effects of increased ventilation. Look for solutions to the negative effects of increased ventilation. For example, avoid drafts in seating areas."],
        ["If there are complaints, ventilation cannot be increased as much/as often as desired, which increases the risk of exposure. However, if positive effects are also observed, ventilation can be increased slightly, which reduces the risk of exposure.", "Increased ventilation improves health and work quality. However, if residents develop colds and stiff necks when ventilation is increased, their comfort level drops significantly. They're likely to complain, and it becomes a constant battle with staff, which in turn reduces work quality. If residents experience the positive effects of ventilation, that's an additional reason to increase ventilation. This increases their sense of safety.", "Educate residents and employees about the positive effects of increased ventilation. Look for solutions to the negative effects of increased ventilation. For example, avoid drafts in seating areas."]
      ],
      'q17': [
        ["Having sufficient PPE in stock reduces the risk of exposure.", "Having sufficient PPE increases the feeling of safety, health, and quality of work. This increases safety and familiarity. The PPE itself can reduce the quality of work because it is uncomfortable.", "Check that the PPE is not expired. If so, ensure that new items are ordered in time."],
        ["Having sufficient PPE in stock reduces the risk of exposure. However, sufficient PPE must be available for an extended period.", "Having some PPE increases the feeling of safety, health, and quality of work in the short term. This increases safety and familiarity. However, there must be enough PPE for a longer period. The PPE itself can reduce the quality of work because it is uncomfortable.", "Check that the PPE is not expired. Also, ensure that the inventory is replenished."],
        ["Not having sufficient PPE in stock increases the risk of exposure.", "The lack of sufficient PPE reduces the feeling of safety, health, and quality of work.", "Order sufficient PPE to maintain stock. Check that the PPE is not expired."]
      ],
      'q18': [
        ["Receiving all the care necessary typically means there are many contact moments. The more interactions there are, the higher the risk of exposure.", "Receiving all the care necessary is important for quality of life, autonomy and physical and mental health.", "Ensure that all the necessary care can be given in a safe manner."],
        ["Scaling back on some of the necessary care means there are less contact moments. Reducing the number of interactions also reduces the risk of exposure.", "Scaling back on some of the necessary care means scaling back on quality of life, autonomy and physical and mental health.", "Ensure that all the necessary care can be given in a safe manner. Try to find safe alternatives instead of fully stopping a certain activity."],
        ["Scaling back on most of the care means there are less contact moments. Reducing the number of interactions also reduces the risk of exposure.", "Scaling back on most of the care means scaling back on quality of life, autonomy and physical and mental health.", "Ensure that all the necessary care can be given in a safe manner. Try to find safe alternatives instead of fully stopping a certain activity."]
      ],
      'q19': [
        ["Increasing the measures without increasing the number of people in the building is positive in terms of the risk of rejection.", "In principle, there is no impact on values. Be aware that workload is not given much consideration. This could negatively impact the quality of work.", "Prepare systems and personnel to understand how tasks can be expanded if necessary."],
        ["Being able to increase capacity allows for other safe ways of working (e.g., cohorts), which reduces the risk of rejection. On the other hand, there are now more people in the building, which can lead to more interactions, increasing the risk of rejection.", "The ability to increase capacity when necessary enhances values such as quality of work, comfort, quality of life, health, and care.", "Prepare systems and personnel to understand how capacity can be expanded if necessary."],
        ["Not being able to increase capacity leads to pushing boundaries, overwork, and rushing, which entails the risk of errors and/or errors, thus increasing the risk of rejection.", "There is no possibility of increasing capacity if necessary values such as quality of work, comfort, quality of life, health, and care are affected.", "Ensure additional capacity, allowing for increased capacity when needed. Prepare systems and personnel to understand how capacity can be expanded if necessary."]
      ],
      'q20': [
        ["Being able to enhance safety measures reduces the risk of exposure.", "Being able to invest in measures (e.g., PPE, ventilation, additional staff) increases work quality, comfort, and a sense of safety and health.", "No action required. Ensure that budget remains available to invest in safety measures when needed."],
        ["Being able to enhance even a few safety measures already reduces the risk of exposure somewhat. Ideally, you should implement all measures.", "Being able to invest in measures (e.g., PPE, ventilation, additional staff) increases work quality, comfort, and a sense of safety and health. However, not being able to invest in everything puts these under pressure.", "Try to increase the budget to invest in safety measures when needed. Grants may be available to help with this."],
        ["Not enhancing safety measures increases the risk of exposure.", "If measures (e.g., PPE, ventilation, additional staff) cannot be invested in, work quality, comfort, and a sense of safety and health will deteriorate.", "Look for ways to increase or save the budget to invest in safety measures when needed. Grants may be available to help with this."]
      ]
    },
    nl: {
        'q4': [
            ["Als mensen kunnen en willen isoleren of preventieve maatregelen nemen, neemt het risico op blootstelling af.", "Isolatie zal mogelijk de kwaliteit van leven verminderen door angst en eenzaamheid te vergroten, naast mogelijke andere gezondheidsproblemen. De kwaliteit van leven zal waarschijnlijk minder worden beïnvloed als mensen prima alleen kunnen en willen zijn.", "Bereid bewoners voor door het plan met ze te delen, zodat ze voorbereid zijn wanneer een nieuwe pandemie uitbreekt."],
            ["Als mensen zich niet aan de maatregelen kunnen of willen houden, neemt het risico op blootstelling toe.", "Isolatie zal mogelijk de kwaliteit van leven verminderen door angst en eenzaamheid te vergroten, naast mogelijke andere gezondheidsproblemen. Dit zal sterker zijn als mensen zich moeten isoleren wanneer ze dat niet willen. De autonomie zal afnemen en dit kan leiden tot ethische discussies.", "Maak een persoonlijk plan per persoon. Bedenk alternatieven om veilig te blijven in de buurt van iemand die zich niet kan isoleren."]
        ],
        'q5': [
            ["Als mensen de situatie begrijpen en de maatregelen kunnen onthouden, is de kans groter dat ze zich eraan houden, waardoor het risico op blootstelling afneemt. Ze zijn waarschijnlijk ook minder bang voor werknemers in persoonlijke beschermingsmiddelen, waardoor ze hun werk veilig kunnen doen en het risico op blootstelling afneemt.", "Mensen met een hoog cognitief niveau begrijpen de situatie beter en onthouden de maatregelen beter. Dit is positief voor waarden zoals kwaliteit van leven, autonomie, gevoel van veiligheid en gezondheid.", "Bereid bewoners voor door samen een actieplan voor een nieuwe pandemie te maken of het met hen te delen, zodat ze hiervan op de hoogte zijn."],
            ["Als mensen moeite hebben met het begrijpen van de situatie en het onthouden van de maatregelen, is de kans klein dat ze zich eraan houden, waardoor het risico op blootstelling toeneemt. Als ze bang zijn voor werknemers in persoonlijke beschermingsmiddelen, kan dit het voor hen moeilijk maken om hun werk veilig uit te voeren, waardoor het risico op blootstelling toeneemt.", "Mensen met cognitieve beperkingen begrijpen de situatie mogelijk niet volledig of onthouden de maatregelen niet. Dit kan een negatieve invloed hebben op waarden zoals kwaliteit van leven, autonomie, gevoel van veiligheid en gezondheid.", "Verhoog de dagelijkse hygiënemaatregelen, zodat het voor bewoners routinematiger wordt. Gebruik simpele berichtgeving (zoals pictogrammen) om het begrip te vergroten."],
            ["Als mensen de situatie niet kunnen begrijpen en de maatregelen niet kunnen onthouden, is de kans klein dat ze zich eraan houden, waardoor het risico op blootstelling toeneemt. Als ze bang zijn voor werknemers in persoonlijke beschermingsmiddelen, kan dit het voor hen moeilijk maken om hun werk veilig uit te voeren, waardoor het risico op blootstelling toeneemt.", "Mensen met ernstige cognitieve beperkingen begrijpen de situatie waarschijnlijk niet volledig en/of onthouden de maatregelen niet. Dit kan een negatieve invloed hebben op waarden zoals kwaliteit van leven, autonomie, gevoel van veiligheid en gezondheid.", "Verhoog de dagelijkse hygiënemaatregelen, zodat het routinematiger wordt. Hang posters op met simpele berichtgeving (zoals pictogrammen) om mensen aan de maatregelen te herinneren. Betrek bekende personen bij de communicatie (bijv. familie)."]
        ],
        'q6': [
            ["Goede kennis verhoogt de kans op goed handelen en verlaagt het risico op blootstelling.", "Genoeg kennis zorgt voor autonomie en een gevoel van veiligheid. Mensen kunnen zelf gevaren inschatten en daar naar handelen.", "Houd de kennis op de hoogte met regelmatige updates of opfrissers (posters, flyers, cursussen, artikelen, etc.)"],
            ["Een gebrek aan kennis verhoogt het risico op blootstelling.", "Een gebrek aan kennis zorgt voor minder autonomie en geen gevoel van veiligheid. Mensen kunnen zelf de gevaren niet goed inschatten en daar ook niet naar handelen.", "Zorg dat de kennis over infectiepreventie bij iedereen groeit. Dit kan bijvoorbeeld door middel van cursussen, flyers, posters, artikelen."]
        ],
        'q12': [
            ["Bij recirculatie zal risico op besmetting groter zijn omdat een virus binnen een gebouw via het ventilatiesysteem verspreid kan worden.", "Met recirculatie is er minder frisse lucht, wat het comfort negatief kan beïnvloeden door de ogen, neus en keel te irriteren.", "Neem contact op met de facility manager/HVAC-leverancier van het gebouw en zorg ervoor dat er geen recirculatie plaatsvindt."],
            ["Geen recirculatie zorgt ervoor dat altijd de toestroom van lucht altijd verse lucht is. Zo zal een virus binnen een gebouw niet via het ventilatiesysteem verspreid kunnen worden.", "Zonder recirculatie is er meer frisse lucht, wat het comfort positief kan beïnvloeden doordat mensen zich frisser voelen.", "Geen actie vereist."]
        ],
        'q14': [
            ["Goede luchtventilatie vermindert het risico op blootstelling.", "Goede ventilatiesystemen verhogen gezondheid, gevoel van veiligheid, kwaliteit van leven en kwaliteit van het werk.", "Zorg voor regelmatig onderhoud. Voer regelmatig controles uit om precies te weten hoe uw systeem functioneert en hoe u het kunt aanpassen om het tijdens een pandemie goed te laten functioneren."],
            ["Slechte luchtventilatie verhoogt het risico op blootstelling.", "Slechte ventilatiesystemen kunnen gezondheid, gevoel van veiligheid, kwaliteit van leven en kwaliteit van het werk verminderen.", "Voer extra onderhoud uit om ervoor te zorgen dat het goed functioneert. Voer daarnaast regelmatig controles uit om precies te weten hoe uw systeem functioneert en hoe u het kunt aanpassen om het tijdens een pandemie goed te laten functioneren."],
            ["Geen luchtventilatie verhoogt het risico op blootstelling.", "Geen ventilatiesystemen vermindert gezondheid, gevoel van veiligheid, kwaliteit van leven en kwaliteit van het werk.", "Installeer een ventilatiesysteem en zorg ervoor dat het goed functioneert. Voer daarnaast regelmatig controles uit om precies te weten hoe uw systeem functioneert en hoe u het kunt aanpassen om het tijdens een pandemie goed te laten functioneren."]
        ],
        'q15': [
            ["Goede luchtkwaliteit vermindert het risico op blootstelling.", "Goede luchtkwaliteit verhoogt gezondheid, gevoel van veiligheid, kwaliteit van leven en kwaliteit van het werk.", "Voer regelmatig controles uit."],
            ["Slechte luchtkwaliteit vergroot het risico op blootstelling.", "Slechte luchtkwaliteit kan gezondheid, gevoel van veiligheid, kwaliteit van leven en kwaliteit van het werk verminderen. Een slechte luchtkwaliteit vermindert ook het vertrouwen in het ventilatiesysteem.", "Repareer het ventilatiesysteem. Zorg ervoor dat het goed werkt."],
            ["Slechte luchtkwaliteit verhoogt het risico op blootstelling.", "Slechte luchtkwaliteit kan gezondheid, gevoel van veiligheid, kwaliteit van leven en kwaliteit van het werk verminderen. Een slechte luchtkwaliteit vermindert ook het vertrouwen in het ventilatiesysteem.", "Repareer het ventilatiesysteem. Zorg ervoor dat het goed werkt."]
        ],
        'q16': [
            ["Als er geen klachten zijn, kan de ventilatie zonder problemen worden verhoogd. Dit vermindert het risico op blootstelling.", "Meer ventilatie verbetert de gezondheid en kwaliteit van het werk. Als bewoners geen last hebben van meer ventilatie, heeft dit waarschijnlijk geen invloed op waarden zoals comfort.", "Informeer bewoners en medewerkers over de positieve effecten van verhoogde ventilatie."],
            ["Als er geen klachten zijn, kan de ventilatie zonder problemen worden verhoogd. Dit vermindert het risico op blootstelling.", "Meer ventilatie verbetert de gezondheid en kwaliteit van het werk. Als bewoners de positieve effecten van ventilatie ervaren, is dat een extra reden om de ventilatie te verhogen. Dit verhoogt het gevoel van veiligheid.", "Geen actie vereist."],
            ["Als er veel klachten zijn, kan de ventilatie niet zo veel/vaak worden verhoogd als gewenst, wat het risico op blootstelling verhoogt.", "Meer ventilatie verbetert de gezondheid en kwaliteit van het werk. Als bewoners echter last krijgen van verkoudheid en een stijve nek wanneer de ventilatie wordt verhoogd, daalt hun comfortniveau aanzienlijk. Ze zullen waarschijnlijk klagen en het wordt elke keer een 'gevecht' met de medewerkers, wat kwaliteit van werk weer verlaagt.", "Informeer bewoners en medewerkers over de positieve effecten van verhoogde ventilatie. Zoek naar oplossingen voor de negatieve effecten van verhoogde ventilatie. Vermijd bijvoorbeeld tocht in zitgedeeltes."],
            ["Als er klachten zijn, kan de ventilatie niet zo veel/vaak worden verhoogd als gewenst, wat het risico op blootstelling verhoogt. Als echter ook de positieve effecten worden opgemerkt, kan de ventilatie iets worden verhoogd, wat het risico op blootstelling verlaagt.", "Meer ventilatie verbetert de gezondheid en kwaliteit van het werk. Als bewoners echter last krijgen van verkoudheid en een stijve nek wanneer de ventilatie wordt verhoogd, daalt hun comfortniveau aanzienlijk. Ze zullen waarschijnlijk klagen en het wordt elke keer een 'gevecht' met de medewerkers, wat kwaliteit van werk weer verlaagt. Als bewoners echter de positieve effecten van ventilatie ervaren, is dat een extra reden om de ventilatie te verhogen. Dit verhoogt het gevoel van veiligheid.", "Informeer bewoners en medewerkers over de positieve effecten van verhoogde ventilatie. Zoek naar oplossingen voor de negatieve effecten van verhoogde ventilatie. Vermijd bijvoorbeeld tocht in zitgedeeltes."]
        ],
        'q17': [
            ["Voldoende PBM op voorraad hebben vermindert het risico op blootstelling.", "Het hebben van voldoende PBM verhoogt het gevoel van veiligheid, gezondheid en kwaliteit van werk. Dit verhoogt veiligheid en herkenbaarheid. De PBM zelf kan kwaliteit van werk verminderen omdat het niet comfortabel is.", "Controleer of de PBM niet over de datum zijn. Zo ja, zorg er dan voor dat er op tijd nieuwe artikelen worden bestelt."],
            ["Voldoende PBM op voorraad hebben vermindert het risico op blootstelling. Er moeten echter voldoende PBM's zijn voor een langere periode.", "Het hebben van wat PBM verhoogt het gevoel van veiligheid, gezondheid en kwaliteit van werk op de korte termijn. Dit verhoogt veiligheid en herkenbaarheid. Er moet echter genoeg zijn voor een langere periode. De PBM zelf kan kwaliteit van werk verminderen omdat het niet comfortabel is.", "Controleer of de PBM niet over de datum zijn. Zorg er ook voor dat de voorraad aangevuld wordt."],
            ["Niet voldoende PBM op voorraad hebben verhoogt het risico op blootstelling.", "Het ontbreken van voldoende PBM verlaagt het gevoel van veiligheid, gezondheid en kwaliteit van werk.", "Bestel voldoende PBM om de voorraad op peil te houden. Controleer of de PBM niet over de datum zijn."]
        ],
        'q18': [
            ["Het ontvangen van alle noodzakelijke zorg betekent doorgaans dat er veel contactmomenten zijn. Hoe meer interacties er zijn, hoe groter het risico op blootstelling.", "Het ontvangen van alle noodzakelijke zorg is belangrijk voor de kwaliteit van leven, autonomie en fysieke en mentale gezondheid.", "Zorg ervoor dat alle noodzakelijke zorg op een veilige manier kan worden verleend."],
            ["Het terugschroeven van een deel van de noodzakelijke zorg betekent dat er minder contactmomenten zijn. Het verminderen van het aantal interacties vermindert ook het risico op blootstelling.", "Het terugschroeven van een deel van de noodzakelijke zorg betekent ook het terugschroeven van de kwaliteit van leven, autonomie en fysieke en mentale gezondheid.", "Zorg ervoor dat alle noodzakelijke zorg op een veilige manier kan worden verleend. Probeer veilige alternatieven te vinden in plaats van een bepaalde activiteit volledig te staken."],
            ["Het terugschroeven van het grootste deel van de zorg betekent dat er minder contactmomenten zijn. Het verminderen van het aantal interacties vermindert ook het risico op blootstelling.", "Het terugschroeven van het grootste deel van de zorg betekent ook het terugschroeven van de kwaliteit van leven, autonomie en fysieke en mentale gezondheid.", "Zorg ervoor dat alle noodzakelijke zorg op een veilige manier kan worden verleend. Probeer veilige alternatieven te vinden in plaats van een bepaalde activiteit volledig te staken."]
        ],
        'q19': [
            ["Het verhogen van de maatregelen zonder het aantal mensen in het gebouw te verhogen, is positief wat betreft het risico op blootstelling.", "In principe geen impact op waarden. Wees alert dat dat de werkdruk niet te veel verhoogd wordt. Dit zou kwaliteit van werk negatief kunnen beïnvloeden.", "Bereid systemen en personeel voor zodat bekend is hoe taken, indien nodig, kunnen worden uitgebreid."],
            ["Het kunnen verhogen van de capaciteit maakt andere veilige manieren van werken mogelijk (bijvoorbeeld cohorten) wat risico op blootstelling vermindert. Aan de andere kant zijn er nu meer mensen in het gebouw waardoor er meer interacties kunnen ontstaan, wat het risico op blootstelling verhoogt.", "Het vermogen om de capaciteit te verhogen indien nodig verhoogt waarden zoals kwaliteit van werk, comfort, kwaliteit van leven, gezondheid en zorg.", "Bereid systemen en personeel voor zodat bekend is hoe de capaciteit, indien nodig, kan worden uitgebreid."],
            ["Het niet kunnen verhogen van de capaciteit leidt tot het verleggen van grenzen, overwerk en haasten, wat risico's op fouten en/of naleving met zich meebrengt en dus het risico op blootstelling verhoogt.", "Geen mogelijkheid hebben om de capaciteit te verhogen indien nodig verlaagt waarden zoals kwaliteit van werk, comfort, kwaliteit van leven, gezondheid en zorg.", "Zorg voor meer capaciteit, zodat er ruimte is om de capaciteit te verhogen wanneer dat nodig is. Bereid systemen en personeel voor zodat bekend is hoe de capaciteit, indien nodig, kan worden uitgebreid."]
        ],
        'q20': [
            ["Het kunnen verhogen van de veiligheidsmaatregelen verlaagt het risico op blootstelling.", "Het kunnen investeren in maatregelen (bijv. PBM's, ventilatie, extra medewerkers) verhoogt kwaliteit van werk, comfort, gevoel van veiligheid en gezondheid.", "Geen actie vereist. Zorg ervoor dat er budget beschikbaar blijft om te investeren in veiligheidsmaatregelen wanneer nodig."],
            ["Het kunnen verhogen van een paar veiligheidsmaatregelen verlaagt het risico op blootstelling al enigszins. Liefst pas je alle maatregelen toe.", "Het kunnen investeren in maatregelen (bijv. PBM's, ventilatie, extra medewerkers) verhoogt kwaliteit van werk, comfort, gevoel van veiligheid en gezondheid. Maar het niet kunnen investeren in alles zet dit onder druk.", "Probeer het budget te verhogen om te kunnen investeren in veiligheidsmaatregelen wanneer nodig. Mogelijk zijn er subsidies beschikbaar om hierbij te helpen."],
            ["Het niet verhogen van de veiligheidsmaatregelen brengt een verhoogd risico op blootstelling met zich mee.", "Als er niet geïnvesteerd kan worden in maatregelen (bijvoorbeeld PBM, ventilatie, extra personeel) gaan kwaliteit van werk, comfort, gevoel van veiligheid en gezondheid achteruit.", "Zoek naar manieren om het budget te verhogen of te besparen om te kunnen investeren in veiligheidsmaatregelen wanneer nodig. Mogelijk zijn er subsidies beschikbaar om hierbij te helpen."]
        ]
    }
  };
  
  // --- Scoring Rules ---
export const scoringRules = {
    'q4': { values: [5, 1], risk: [1, 5] },
    'q5': { values: [5, 3, 1], risk: [1, 3, 5] },
    'q6': { values: [5, 1], risk: [1, 5] },
    'q12': { values: [1, 5], risk: [5, 1] },
    'q14': { values: [5, 3, 1], risk: [1, 3, 5] },
    'q15': { values: [5, 3, 1], risk: [1, 3, 5] },
    'q16': { values: [4, 5, 1, 3], risk: [1, 1, 5, 3] },
    'q17': { values: [5, 3, 1], risk: [1, 3, 5] },
    'q18': { values: [5, 2, 1], risk: [5, 3, 1] },
    'q19': { values: [5, 3, 1], risk: [1, 3, 5] },
    'q20': { values: [5, 3, 1], risk: [1, 3, 5] }
  };

export { AnalysisRow, TotalScoreBar };