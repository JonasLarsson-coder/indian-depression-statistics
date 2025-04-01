import addMdToPage from './libs/addMdToPage.js';
import addDropdown from './libs/addDropdown.js';
import dbQuery from "./libs/dbQuery.js";
import tableFromData from './libs/tableFromData.js';
import drawGoogleChart from './libs/drawGoogleChart.js';
import makeChartFriendly from './libs/makeChartFriendly.js';

addMdToPage('## Suicidal and Depression')
let suicidalDepressionData = await dbQuery(`
  SELECT suicidalThoughts, depression, COUNT(*) AS count
  FROM results
  GROUP BY suicidalThoughts, depression
`);
tableFromData({ data: suicidalDepressionData })

