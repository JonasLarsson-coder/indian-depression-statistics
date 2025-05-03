import addMdToPage from './libs/addMdToPage.js';
import addDropdown from './libs/addDropdown.js';
import dbQuery from "./libs/dbQuery.js";
import tableFromData from './libs/tableFromData.js';
import drawGoogleChart from './libs/drawGoogleChart.js';
import makeChartFriendly from './libs/makeChartFriendly.js';

// Lägg till rubrik och beskrivning
addMdToPage('## Family History of Mental Illness and Depression');
addMdToPage('Statistik på studenters familjehistoria av psykisk ohälsa och deras depressionsstatus. Tabellen och diagramen nedan visar att studenter som har en familjehistoria av psykisk ohälsa tenderar att ha en lite högre nivå av depression jämfört med de som inte har en sådan historia. Men ändå så pass lägre att det inte är statistiskt signifikant. Det är inte en avgörande faktor för att förutsäga depression, utan snarare en av många faktorer som kan påverka en persons mentala hälsa.');

// Hämta och visa tabell med summerad data
let mentallIllnesAndDepression = await dbQuery(`
  SELECT 
    familyHistoryOfMentalIllnes, 
    COUNT(*) AS total_students, 
    SUM(depression) AS students_with_depression, 
    ROUND((SUM(depression) * 100.0) / COUNT(*), 2) || '%' AS percentage_with_depression 
  FROM results 
  GROUP BY familyHistoryOfMentalIllnes;
`);

tableFromData({ data: mentallIllnesAndDepression });

// Hämta data för diagram
let mentalIllnessData = await dbQuery(`
  SELECT 
    familyHistoryOfMentalIllnes, 
    ROUND((SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 2) AS depressed_percentage 
  FROM results 
  GROUP BY familyHistoryOfMentalIllnes;
`);

mentalIllnessData = mentalIllnessData.map(x => ({
  ...x,
  depressed_percentage: parseFloat(x.depressed_percentage)
}));

// Rita stapeldiagram
drawGoogleChart({
  type: 'ColumnChart',
  data: makeChartFriendly(mentalIllnessData, 'Family History of Mental Illness', 'Depressed Percentage'),
  options: {
    height: 500,
    width: 1250,
    chartArea: { left: 100, width: '75%' },
    vAxis: {
      format: '#\'%\'',
      title: 'Percentage with Depression',
      minValue: 0,
      maxValue: 100
    },
    hAxis: {
      title: 'Family History of Mental Illness',
      slantedText: false
    },
    title: `Depression i förhållande till psykisk ohälsa i familjen.`,
    colors: ['#00a1f1']
  }
});





// === Pearson-korrelation + scatterdiagram ===

// Konvertera kategorin till binär form: Yes = 1, No = 0
const familyHistoryBinary = mentallIllnesAndDepression.map(row => row.familyHistoryOfMentalIllnes === 'Yes' ? 1 : 0);

// Extrahera andelen deprimerade som numeriska värden
const depressionPercentages = mentallIllnesAndDepression.map(row => {
  const percent = parseFloat(row.percentage_with_depression.replace('%', ''));
  return isNaN(percent) ? 0 : percent;
});

// Funktion för att beräkna Pearson-korrelation
function pearsonCorrelation(x, y) {
  if (x.length !== y.length || x.length === 0) return NaN;

  const meanX = x.reduce((a, b) => a + b) / x.length;
  const meanY = y.reduce((a, b) => a + b) / y.length;

  const numerator = x.reduce((sum, val, i) => sum + ((val - meanX) * (y[i] - meanY)), 0);
  const denominatorX = Math.sqrt(x.reduce((sum, val) => sum + Math.pow(val - meanX, 2), 0));
  const denominatorY = Math.sqrt(y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0));

  return (denominatorX && denominatorY) ? numerator / (denominatorX * denominatorY) : NaN;
}

// Räkna ut korrelationen
const correlation = pearsonCorrelation(familyHistoryBinary, depressionPercentages);

// Lägg till texten på sidan
addMdToPage(`### Pearson korrelations resultat.  
Pearson's korrelationskoefficienten mellan att ha en familjehistoria av psykisk ohälsa och procentandelen av depression är: **${correlation.toFixed(3)}**`);
addMdToPage(`Matematiskt korrekt men statistiskt svagt – för att korrelation ska vara meningsfull krävs fler variationer i data.`)

// Förbered data till scatterdiagram
const scatterData = [['Family History (No=0, Yes=1)', 'Depressed Percentage']];
for (let i = 0; i < familyHistoryBinary.length; i++) {
  scatterData.push([familyHistoryBinary[i], depressionPercentages[i]]);
}

// Rita scatterdiagram med trendlinje
drawGoogleChart({
  type: 'ScatterChart',
  data: scatterData,
  options: {
    height: 500,
    width: 800,
    title: `Scatter Plot: Family History vs Depression Percentage (r = ${correlation.toFixed(3)})`,
    hAxis: {
      title: 'Family History (No = 0, Yes = 1)',
      ticks: [{ v: 0, f: 'No' }, { v: 1, f: 'Yes' }]
    },
    vAxis: {
      title: 'Depressed Percentage (%)',
      minValue: 0,
      maxValue: 100
    },
    trendlines: {
      0: {
        type: 'linear',
        color: '#e91e63',
        lineWidth: 3,
        opacity: 0.7,
        showR2: true,
        visibleInLegend: true
      }
    },
    pointSize: 10,
    colors: ['#0288d1']
  }
});
