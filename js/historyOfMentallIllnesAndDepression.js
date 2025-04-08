import addMdToPage from './libs/addMdToPage.js';
import addDropdown from './libs/addDropdown.js';
import dbQuery from "./libs/dbQuery.js";
import tableFromData from './libs/tableFromData.js';
import drawGoogleChart from './libs/drawGoogleChart.js';
import makeChartFriendly from './libs/makeChartFriendly.js';


//lägg till rubrik
addMdToPage('## Family history of mentall illnes and depression.')
let mentallIllnesAndDepression = await dbQuery("SELECT familyHistoryOfMentalIllnes, COUNT(*) AS total_students, SUM(depression) AS students_with_depression, ROUND((SUM(depression) * 1.0 / COUNT(*)) * 100, 2) || '%' AS percentage_with_depression FROM results GROUP BY familyHistoryOfMentalIllnes");
tableFromData({ data: mentallIllnesAndDepression })

// Lägg till rubrik
addMdToPage(`## The correlation between family history of mental illness and depression`);

let mentalIllnessData = (await dbQuery(`
  SELECT familyHistoryOfMentalIllnes, 
         ROUND((SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 2) AS depressed_percentage
  FROM results
  GROUP BY familyHistoryOfMentalIllnes;
`)).map(x => ({
  ...x,
  depressed_percentage: parseFloat(x.depressed_percentage) // Säkerställer att det är en numerisk datatyp
}));

drawGoogleChart({
  type: 'ColumnChart',
  data: makeChartFriendly(mentalIllnessData, 'Family History of Mental Illness', 'Depressed Percentage'),
  options: {
    height: 500,
    width: 1250,
    chartArea: { left: 100, width: '75%' }, // Flyttar diagrammet åt höger
    vAxis: { format: '#\'%\'', title: 'Percentage with depression', minValue: 0, maxValue: 100 },
    hAxis: { title: 'Family History of Mentall Illnes', slantedText: false },
    title: `Depression in relation to family history of mental illness. 
      Students with a family history of mentall illnes tend to show a little bit higher depression rates.`,
    colors: ['#00a1f1']
  }
});

