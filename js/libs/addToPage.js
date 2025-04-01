import $ from './shorthand-query-selector.js';

// ironboy
// add html to page
export default function addToPage(html, selector = 'main') {
  $(selector).innerHTML += html;
}