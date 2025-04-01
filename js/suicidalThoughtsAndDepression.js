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


