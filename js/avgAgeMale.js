import addMdToPage from './libs/addMdToPage.js';
import addDropdown from './libs/addDropdown.js';
import dbQuery from "./libs/dbQuery.js";
import tableFromData from './libs/tableFromData.js';
import drawGoogleChart from './libs/drawGoogleChart.js';
import makeChartFriendly from './libs/makeChartFriendly.js';

addMdToPage('## Male Average age')
let avgAgeMale = await dbQuery("SELECT ROUND(AVG(age), 2) AS average_age FROM results WHERE gender = 'Male';")
tableFromData({ data: avgAgeMale })