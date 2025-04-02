import createMenu from './libs/createMenu.js';

createMenu('Indian Depression Statistics', [
  { name: 'Nytt i version 5', script: 'new-in-v5.js' },
  { name: 'Average age', script: 'avgAge.js' },
  { name: 'Suicidal and Depression', script: 'suicidalThoughtsAndDepression.js' },
  { name: 'Sleep and Depression', script: 'sleepAndDepressionDiagram.js' },
]);
