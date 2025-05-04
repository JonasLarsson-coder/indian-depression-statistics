import addMdToPage from './libs/addMdToPage.js';
import addDropdown from './libs/addDropdown.js';
import dbQuery from "./libs/dbQuery.js";
import tableFromData from './libs/tableFromData.js';
import drawGoogleChart from './libs/drawGoogleChart.js';
import makeChartFriendly from './libs/makeChartFriendly.js';

// Rubrik och beskrivning
addMdToPage('## Självmordstankar och depression');
addMdToPage('Pearsons korrelationskoefficient på 0.546 innebär en måttlig och positiv korrelation mellan självmordstankar och depression. Eftersom värdet är mellan 0 och 1, innebär detta att när depression ökar, så tenderar också självmordstankar att öka. Värdet 0.546 indikerar en måttlig styrka på sambandet. Det betyder att sambandet är synligt och signifikant, men det är inte extremt starkt. Det finns fortfarande många andra faktorer som kan påverka både depression och självmordstankar. Ett värde på 0.546 innebär inte att depression orsakar självmordstankar, utan att de tenderar att förekomma tillsammans i högre grad än vad som skulle kunna förväntas av en slump. En korrelation på 0.546 betyder att det finns ett statistiskt signifikant samband mellan självmordstankar och depression, men det är inte extremt starkt.');

// Visa tabell med data
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
tableFromData({ data: suicidalDepressionData });

try {
  // För diagrammet
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

  let chartData = [['Category', 'Depression Rate']];
  suicidalDepressionData.forEach(row => {
    let customLabel = row.suicidalThoughts === 'Yes'
      ? `Suicidal thoughts, ${row.depression_status}`
      : `No suicidal thoughts, ${row.depression_status}`;
    chartData.push([customLabel, parseFloat(row.percentage)]);
  });

  drawGoogleChart({
    type: 'ColumnChart',
    data: chartData,
    options: {
      height: 500,
      width: 1200,
      chartArea: { left: 100, width: '75%' },
      vAxis: { format: '#\'%', title: 'Percentage', minValue: 0, maxValue: 100 },
      hAxis: { title: 'Suicidal Thoughts & Depression', slantedText: false },
      title: 'Correlation between suicidal thoughts and depression',
      colors: ['#d9534f']
    }
  });

  // Pearson korrelation
  const rawData = await dbQuery(`
    SELECT 
      CASE WHEN suicidalThoughts = 'Yes' THEN 1 ELSE 0 END AS suicidal,
      depression
    FROM results
    WHERE suicidalThoughts IS NOT NULL AND depression IS NOT NULL;
  `);

  const suicidalBinary = rawData.map(row => row.suicidal);
  const depressionBinary = rawData.map(row => row.depression);

  function pearsonCorrelation(x, y) {
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b) / n;
    const meanY = y.reduce((a, b) => a + b) / n;
    const numerator = x.reduce((sum, xi, i) => sum + ((xi - meanX) * (y[i] - meanY)), 0);
    const denominatorX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0));
    const denominatorY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0));
    return denominatorX && denominatorY ? numerator / (denominatorX * denominatorY) : NaN;
  }

  function interpretCorrelation(r) {
    const absR = Math.abs(r);
    let strength = 'no';
    if (absR >= 0.9) strength = 'very strong';
    else if (absR >= 0.7) strength = 'strong';
    else if (absR >= 0.5) strength = 'moderate';
    else if (absR >= 0.3) strength = 'weak';
    else if (absR > 0) strength = 'very weak';
    const direction = r > 0 ? 'positive' : r < 0 ? 'negative' : '';
    return `${strength}${direction ? ' and ' + direction : ''} correlation`;
  }

  const r = pearsonCorrelation(suicidalBinary, depressionBinary);
  const interpretation = interpretCorrelation(r);
  addMdToPage(`**Pearsons korrelationskoefficient mellan självmordstankar och depression:** ${r.toFixed(3)} (${interpretation})`);

  // Scatterplot
  let scatterData = [['Suicidal Thoughts (0=No, 1=Yes)', 'Depression (0=No, 1=Yes)']];
  rawData.forEach(row => scatterData.push([row.suicidal, row.depression]));

  drawGoogleChart({
    type: 'ScatterChart',
    data: scatterData,
    options: {
      title: 'Scatterplot: Suicidal Thoughts vs Depression',
      hAxis: { title: 'Suicidal Thoughts (0 = No, 1 = Yes)', minValue: -0.1, maxValue: 1.1 },
      vAxis: { title: 'Depression (0 = No, 1 = Yes)', minValue: -0.1, maxValue: 1.1 },
      trendlines: { 0: { type: 'linear', color: '#d9534f', lineWidth: 3, opacity: 0.7, showR2: true } },
      pointSize: 5,
      width: 800,
      height: 500
    }
  });

} catch (error) {
  console.error("Error fetching or processing data:", error);
  addMdToPage(`**Error:** ${error.message}`);
}
