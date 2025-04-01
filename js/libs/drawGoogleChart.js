// ironboy
// make it possible to use cleaner syntax
// to draw a google chart based on data
// that can be in a json file (or direct)

// call like this setting type, data, element and options
/* 
{
  type: 'PieChart',
  data: 'pie-chart-data.json',
  element: '.pie-chart',
  options: {
    title: 'My Daily Activities',
    height: 500
  }
}
*/

import gv from './/wait-for-google-charts.js';
import jload from './jload.js';
import $ from './/shorthand-query-selector.js'

let counter = 1;
export default async function drawGoogleChart({ type, data, element, options }) {
  element = element && $(element);
  if (!element) {
    element = document.createElement('div');
    element.classList.add('chart-' + counter++);
    document.querySelector('main').append(element);
  }
  data = typeof data === 'string' ? await (jload('pie-chart-data.json')) : data;
  let chart = new gv[type](element);
  chart.draw(gv.toTable(data), options);
}

// reload on window resize
let timeout;
window.onresize = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => location.reload(), 1000);
};