import addMdToPage from './libs/addMdToPage.js';
import addDropdown from './libs/addDropdown.js';
import dbQuery from "./libs/dbQuery.js";
import drawGoogleChart from './libs/drawGoogleChart.js';
import makeChartFriendly from './libs/makeChartFriendly.js';
import tableFromData from './libs/tableFromData.js';


addMdToPage('## Sömmn & depression')
addMdToPage(`Undersökningen visar att personer som lider av depression och sömnproblem är större än de som inte lider av depression och sömnproblem. Studenter som sover mindre än 5 timmar har mer depression än studenter som sover mer än 8 timmar. Dock är det svårt att fastställa vad "mindre än 5 timmar" innebär, det kan vara att de sover 3 timmer eller 3 1/2 timmar. Samma sak gäller för "mer än 8 timmar", det kan vara att de sover 9 timmar eller 14 timmar`);
let sleepAndDepression = await dbQuery("SELECT sleepDuration, COUNT(*) AS total_count, SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) AS depressed_count, CONCAT(ROUND((SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*),2), '%') AS depressed_percentage FROM results GROUP BY sleepDuration ORDER BY depressed_percentage DESC");
tableFromData({ data: sleepAndDepression })


addMdToPage(`## The correlation between sleep duration and depression
  ## 
`);

let sleepData = (await dbQuery(`
  SELECT sleepDuration, 
         ROUND((SUM(CASE WHEN depression = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 2) AS depressed_percentage
  FROM results
  WHERE sleepDuration != 'Others' -- Exkluderar "Others"
  GROUP BY sleepDuration
  ORDER BY 
      CASE 
          WHEN sleepDuration = 'Less than 5 hours' THEN 1
          WHEN sleepDuration = '5-6 hours' THEN 2
          WHEN sleepDuration = '7-8 hours' THEN 3
          WHEN sleepDuration = 'More than 8 hours' THEN 4
          ELSE 5
      END;
`)).map(x => ({ ...x, sleepDuration: x.sleepDuration }));

drawGoogleChart({
  type: 'ColumnChart',
  data: makeChartFriendly(sleepData, 'Sleep Duration', `% Depression`),
  options: {
    height: 500,
    width: 1250,
    chartArea: { left: 100, width: '75%' },
    vAxis: { format: '#\'%\'', title: 'Percentage with depression', minValue: 0, maxValue: 100, },
    hAxis: { title: 'Sleep Duration', slantedText: false },
    title: `Depression in relation to sleep duration (without "Others"). 
      Students who sleep less than 5 hours tend to become more depressed.`,
    colors: ['#00a1f1', '#9455e0', '#358f1d', '#e8a220']
  }
});



