import addMdToPage from './libs/addMdToPage.js';
import addDropdown from './libs/addDropdown.js';
import dbQuery from "./libs/dbQuery.js";
import tableFromData from './libs/tableFromData.js';
import drawGoogleChart from './libs/drawGoogleChart.js';
import makeChartFriendly from './libs/makeChartFriendly.js';

addMdToPage('## Finansiell stress och depression');
addMdToPage(`Pearson-korrelationen mäter styrkan och riktningen av ett linjärt samband mellan två numeriska variabler.  
Ett Pearson-korrelationsvärde på 0,36 innebär en måttlig positiv korrelation mellan financialStress och depression.  
Det betyder att när finansiell stress ökar, tenderar sannolikheten för depression också att öka – men sambandet är inte starkt,  
vilket betyder att det finns andra faktorer som påverkar depression utöver finansiell stress.

**Korrelationsvärde**  
0.0 - 0.2 ➝ Svag eller ingen korrelation  
0.2 - 0.5 ➝ Måttlig korrelation  
0.5 - 0.8 ➝ Stark korrelation  
0.8 - 1.0 ➝ Mycket stark korrelation  
`);

// **Skapa en flex-container för diagrammen**
let chartContainer = document.createElement('div');
chartContainer.id = 'chart-wrapper';
chartContainer.style.display = 'flex'; // Aktivera Flexbox
chartContainer.style.flexDirection = 'row'; // Placera diagrammen horisontellt
chartContainer.style.justifyContent = 'space-around'; // Jämn fördelning
chartContainer.style.alignItems = 'center'; // Centrera vertikalt
chartContainer.style.width = '100%';
chartContainer.style.marginTop = '20px';
document.body.appendChild(chartContainer);

// **Hämta Pearson-korrelationen från databasen**
let correlationData = await dbQuery(`
    SELECT (COUNT(*) * SUM(financialStress * depression) - SUM(financialStress) * SUM(depression)) / 
           (SQRT((COUNT(*) * SUM(financialStress * financialStress) - SUM(financialStress) * SUM(financialStress)) * 
                 (COUNT(*) * SUM(depression * depression) - SUM(depression) * SUM(depression))))
    AS correlation_coefficient
    FROM results;
`);

console.log("Pearson-korrelation:", correlationData);

// **Visa korrelationsvärdet i en tabell**
if (!correlationData || correlationData.length === 0 || correlationData[0].correlation_coefficient === null) {
  console.error("Inget giltigt korrelationsvärde hittades!");
} else {
  let correlationCoefficient = correlationData[0].correlation_coefficient;

  let correlationTableData = [
    { Korrelationstyp: "Pearson-korrelation", Värde: correlationCoefficient.toFixed(3) }
  ];
  tableFromData({ data: correlationTableData });

  // **Skapa en container för stapeldiagrammet**
  let correlationDiv = document.createElement('div');
  correlationDiv.id = 'correlation-chart-container';
  correlationDiv.style.flex = '1'; // Jämn storlek i flexboxen
  chartContainer.appendChild(correlationDiv);

  let correlationChartData = [
    ['Korrelation', 'Värde'],
    ['Pearson-korrelation', correlationCoefficient]
  ];

  drawGoogleChart({
    elementId: 'correlation-chart-container',
    type: 'ColumnChart', // Fixad felaktig parameter
    data: correlationChartData,
    options: {
      title: 'Pearson Korrelation: Finansiell Stress & Depression',
      hAxis: { title: 'Korrelationstyp' },
      vAxis: { title: 'Värde' },
      legend: { position: 'none' },
      width: 600,
      height: 400
    }
  });
}
addMdToPage(` Depresssions data är binär, 0 = Nej, 1 = Ja, och financialStress graderas från 1 till 5.`);
// **Hämta all rådata för scatterdiagrammet**
// **Hämta all rådata för scatterdiagrammet**
let allData = await dbQuery(`
    SELECT financialStress, depression 
    FROM results 
    WHERE financialStress IS NOT NULL AND depression IS NOT NULL;
`);

if (allData.length === 0) {
  console.error("Inga giltiga svar hittades i databasen!");
} else {
  // **Skapa en container för scatterdiagrammet**
  let scatterDiv = document.createElement('div');
  scatterDiv.id = 'scatter-chart-container';
  scatterDiv.style.flex = '1'; // Jämn storlek i flexboxen
  document.body.appendChild(scatterDiv);

  // **Konvertera data till rätt format**
  let scatterChartData = [['Financial Stress', 'Depression']];
  allData.forEach(row => {
    scatterChartData.push([row.financialStress, row.depression]);
  });

  console.log("Data för scatter diagram:", scatterChartData);

  // **Skapa scatterdiagram med alla datapunkter**
  drawGoogleChart({
    elementId: 'scatter-chart-container',
    type: 'ScatterChart',
    data: scatterChartData,
    options: {
      title: 'Scatter Diagram: Finansiell Stress och Depression',
      hAxis: { title: 'Financial Stress' },
      vAxis: { title: 'Depression (0 = Nej, 1 = Ja)' },
      width: 600,
      height: 400,
      trendlines: { 0: { type: 'linear', color: 'red', lineWidth: 2 } }, // Lägg till trendlinje
      pointSize: 5 // Gör datapunkterna mer synliga
    }
  });
}

