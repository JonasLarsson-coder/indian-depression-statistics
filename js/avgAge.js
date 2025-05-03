import addMdToPage from './libs/addMdToPage.js';
import addDropdown from './libs/addDropdown.js';
import dbQuery from "./libs/dbQuery.js";
import tableFromData from './libs/tableFromData.js';
import drawGoogleChart from './libs/drawGoogleChart.js';
import makeChartFriendly from './libs/makeChartFriendly.js';

addMdToPage('## Genomsnittlig ålder och depression per kön');
addMdToPage(`Här visas den genomsnittliga åldern för män och kvinnor som deltog i den här studien, samt andel i procent som lider av depression.`)




let avgAge = await dbQuery(`
  SELECT gender, 
         ROUND(AVG(age), 2) AS average_age, 
         ROUND(100.0 * SUM(depression) / COUNT(*), 2) AS depression_percentage 
  FROM results 
  GROUP BY gender 
  UNION ALL 
  SELECT 'Total' AS gender, 
         ROUND(AVG(age), 2) AS average_age, 
         ROUND(100.0 * SUM(depression) / COUNT(*), 2) AS depression_percentage 
  FROM results;
`);

tableFromData({ data: avgAge });




// Säkerställ att `chart-container` finns i HTML
if (!document.getElementById('chart-container')) {
  const chartDiv = document.createElement('div');
  chartDiv.id = 'chart-container';
  document.body.appendChild(chartDiv);
}

// Konvertera data till ett format som Google Charts kan hantera
let chartData = makeChartFriendly(avgAge);

// Logga datan för att säkerställa att den är korrekt strukturerad
console.log("Formaterad data för diagram:", chartData);

drawGoogleChart({
  type: 'ColumnChart',
  data: chartData,
  options: {
    title: 'Genomsnittlig ålder och depression per kön',
    hAxis: { title: 'Kön' },
    vAxis: { title: 'Värde' },
    legend: { position: 'top' },
    width: 1500,  // Ändra bredd
    height: 800  // Ändra höjd
  }
});
