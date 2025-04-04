import addMdToPage from './libs/addMdToPage.js';
import addDropdown from './libs/addDropdown.js';
import dbQuery from "./libs/dbQuery.js";
import tableFromData from './libs/tableFromData.js';
import drawGoogleChart from './libs/drawGoogleChart.js';
import makeChartFriendly from './libs/makeChartFriendly.js';

addMdToPage('## Suicidal and Depression')
addMdToPage('Statistics showing the correlation between suicidal thoughts and depression.')
let suicidalDepressionData = await dbQuery(`
SELECT suicidalThoughts, 
       CASE 
           WHEN depression = 1 THEN 'Yes' 
           WHEN depression = 0 THEN 'No' 
           ELSE 'Unknown' 
       END AS depression_status, 
       CONCAT(ROUND((COUNT(*) * 100.0) / (SELECT COUNT(*) FROM results), 2), '%') AS percentage
FROM results
GROUP BY suicidalThoughts, depression_status;

`);
tableFromData({ data: suicidalDepressionData })


// Lägg till rubrik på sidan
addMdToPage('## Suicidal Thoughts and Depression');
addMdToPage('Statistics showing the correlation between suicidal thoughts and depression.');

try {
  // Hämta data från databasen
  let suicidalDepressionData = await dbQuery(`
    SELECT suicidalThoughts, 
           CASE 
               WHEN depression = 1 THEN 'With depression' 
               WHEN depression = 0 THEN 'No depression' 
               ELSE 'Unknown' 
           END AS depression_status, 
           ROUND((COUNT(*) * 100.0) / (SELECT COUNT(*) FROM results), 2) AS percentage
    FROM results
    GROUP BY suicidalThoughts, depression_status;
  `);

  console.log("Fetched data:", suicidalDepressionData); // Logga ut för felsökning

  // Konvertera data för diagrammet med anpassade etiketter
  let chartData = [['Category', 'Depression Rate']];
  suicidalDepressionData.forEach(row => {
    let customLabel = row.suicidalThoughts === 'Yes'
      ? `Suicidal thoughts, ${row.depression_status}`
      : `No suicidal thoughts, ${row.depression_status}`;

    chartData.push([customLabel, parseFloat(row.percentage)]);
  });

  console.log("Updated chart labels:", chartData); // Logga ut för att se ändringarna

  // Skapa diagrammet
  drawGoogleChart({
    type: 'ColumnChart',
    data: chartData,
    options: {
      height: 500,
      width: 1200,
      chartArea: { left: 100, width: '75%' },
      vAxis: { format: '#\'%\'', title: 'Percentage', minValue: 0, maxValue: 100 },
      hAxis: { title: 'Suicidal Thoughts & Depression', slantedText: false },
      title: 'Correlation between suicidal thoughts and depression',
      colors: ['#d9534f']
    }
  });

} catch (error) {
  console.error("Error fetching or processing data:", error);
  addMdToPage(`**Error:** ${error.message}`);
}
