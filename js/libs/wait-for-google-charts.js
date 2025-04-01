// ironboy:
// wait for Google Charts to load, using top level await 
// so that we don't need callbacks in our main app
// + provide shorthand alias for google.vizualization - gv
//   and google.vizualization.arrayToDataTable - gv.toTable

import jload from "./jload.js";

let gv;
async function waiter() {
  let settings = await jload('chartSettings.json');
  return new Promise(resolve => {
    google.charts.load('current', settings);
    google.charts.setOnLoadCallback(() => {
      gv = google.visualization;
      gv.toTable = gv.arrayToDataTable;
      resolve();
    });
  });
}
await waiter();

export default gv;