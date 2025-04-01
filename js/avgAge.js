import addMdToPage from './libs/addMdToPage.js';
import addDropdown from './libs/addDropdown.js';
import dbQuery from "./libs/dbQuery.js";
import tableFromData from './libs/tableFromData.js';
import drawGoogleChart from './libs/drawGoogleChart.js';
import makeChartFriendly from './libs/makeChartFriendly.js';


addMdToPage('## Average Age')
let avgAge = await dbQuery("SELECT gender, ROUND(AVG(age), 2) AS average_age FROM results GROUP BY gender UNION ALL SELECT 'Total' AS gender, ROUND(AVG(age), 2) AS average_age FROM results")
tableFromData({ data: avgAge })





