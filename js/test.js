import addMdToPage from './libs/addMdToPage.js';
import addDropdown from './libs/addDropdown.js';
import dbQuery from "./libs/dbQuery.js";
import tableFromData from './libs/tableFromData.js';
import drawGoogleChart from './libs/drawGoogleChart.js';
import makeChartFriendly from './libs/makeChartFriendly.js';
addMdToPage('## Sleep duration and depression');

// Använd din SQL-query för att hämta data
let sleepData = await dbQuery(`
  SELECT sleepDuration, 
         ROUND((SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 2) AS depressed_percentage
  FROM results
  WHERE sleepDuration != 'Others'
  GROUP BY sleepDuration
  ORDER BY 
      CASE 
          WHEN sleepDuration = 'Less than 5 hours' THEN 1
          WHEN sleepDuration = '5-6 hours' THEN 2
          WHEN sleepDuration = '7-8 hours' THEN 3
          WHEN sleepDuration = 'More than 8 hours' THEN 4
          ELSE 5
      END;
`);

tableFromData({ data: sleepData });

addMdToPage(`## The correlation between sleep duration and depression`);

let formattedSleepData = sleepData.map(x => ({
  sleepDuration: parseFloat(x.sleepDuration.match(/\d+/)?.[0] || '0'), // Extrahera numeriska värden från text
  depressed_percentage: parseFloat(x.depressed_percentage) // FIX: Konvertera till numeriskt direkt!
}));

// Beräkna trendlinje och R²-värde med linjär regression
function calculateTrendline(data) {
  let x = data.map(d => d.sleepDuration);
  let y = data.map(d => d.depressed_percentage);

  let n = x.length;
  let sumX = x.reduce((acc, val) => acc + val, 0);
  let sumY = y.reduce((acc, val) => acc + val, 0);
  let sumXY = x.map((val, i) => val * y[i]).reduce((acc, val) => acc + val, 0);
  let sumX2 = x.map(val => val ** 2).reduce((acc, val) => acc + val, 0);

  let slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
  let intercept = (sumY - slope * sumX) / n;

  let r2_numerator = n * sumXY - sumX * sumY;
  let r2_denominator = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY ** 2 - sumY ** 2));
  let r2 = (r2_denominator !== 0) ? (r2_numerator / r2_denominator) ** 2 : 0;

  return { slope, intercept, r2 };
}

let { r2 } = calculateTrendline(formattedSleepData);

addMdToPage(`R² value: **${r2.toFixed(2)}**  
This indicates the strength of the correlation.`);

// Visualisera med scatter-plot och trendlinje
drawGoogleChart({
  type: 'ScatterChart',
  data: makeChartFriendly(formattedSleepData, 'Sleep Duration', '% Depression'),
  options: {
    height: 500,
    width: 1250,
    chartArea: { left: 100, width: '75%' },
    vAxis: { format: '#\'%\'', title: 'Percentage with depression', minValue: 0, maxValue: 100 },
    hAxis: { title: 'Sleep Duration' },
    title: `Depression in relation to sleep duration (excluding "Others")  
      R² = ${r2.toFixed(2)} indicates the strength of the correlation.`,
    trendlines: { 0: { type: 'linear', color: 'red', opacity: 0.5 } },
    colors: ['#00a1f1']
  }
});
