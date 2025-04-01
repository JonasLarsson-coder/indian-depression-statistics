import createMenu from './libs/createMenu.js';

createMenu('Malmö-temperaturer', [
  { name: 'Nytt i version 5', script: 'new-in-v5.js' },
  { name: 'Visa ett år', script: 'one-year.js' },
  { name: 'Jämför två år', script: 'compare-two-years.js' },
  { name: 'Hitta trender', script: 'trends.js' }
]);