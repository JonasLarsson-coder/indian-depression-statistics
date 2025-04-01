import addToPage from './addToPage.js'

// note: expecting data to be an array of objects
export default function tableFromData({
  data,
  numberFormatLocale = 'sv-SE',
  numberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
  columnNames = []
}) {
  let nFormat = Intl.NumberFormat(numberFormatLocale, numberFormatOptions);
  // expect all objects to have the same keys, 
  // so read the keys from the first element
  let entries = Object.entries(data[0]);
  let count = 0;
  while (columnNames.length) {
    entries[count++][0] = columnNames.shift();
  }
  let html = '<div class="table-responsive"><table class="table table-striped"><thead><tr>';
  html += entries.map(x => `<th class="`
    + (isNaN(x[1]) ? '' : 'right') + `">${x[0]}</th>`).join('');
  html += '</tr><tbody>';
  for (let row of data) {
    html += '<tr>';
    for (let columnValue of Object.values(row)) {
      html += `<td class="`
        + (isNaN(columnValue) ? '' : 'right') + `">${isNaN(columnValue) ? columnValue : columnValue === null ? null : nFormat.format(columnValue)}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table></div>'
  addToPage(html);
}