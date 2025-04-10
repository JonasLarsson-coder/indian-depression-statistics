import addMdToPage from './libs/addMdToPage.js';
import addDropdown from './libs/addDropdown.js';
import dbQuery from "./libs/dbQuery.js";
import tableFromData from './libs/tableFromData.js';
import drawGoogleChart from './libs/drawGoogleChart.js';
import makeChartFriendly from './libs/makeChartFriendly.js';

// Lägg till rubrik
addMdToPage('## Average Age');
addMdToPage('Following statistics show the average age of men and women, and the total average age of this survey.');
let avgAge = await dbQuery("SELECT gender, ROUND(AVG(age), 2) AS average_age, CONCAT(ROUND(100.0 * SUM(depression) / COUNT(*), 2), '%') AS depression_percentage FROM results GROUP BY gender UNION ALL SELECT 'Total' AS gender, ROUND(AVG(age), 2) AS average_age, CONCAT(ROUND(100.0 * SUM(depression) / COUNT(*), 2), '%') AS depression_percentage FROM results; ")
tableFromData({ data: avgAge })

