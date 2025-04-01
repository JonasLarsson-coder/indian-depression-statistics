export default async function csvLoad(url, separator = ',') {
  let text = (await (await fetch(url)).text()).split('\r\n').join('\n').split('\n').filter(x => x.trim());
  let columnNames = text.splice(0, 1)[0].split(separator).map(x => x.trim());
  let data = [];
  for (let row of text) {
    let obj = {}, cnames = columnNames.slice();
    for (let columnValue of row.split(separator)) {
      columnValue = isNaN(columnValue) ? columnValue : +columnValue;
      obj[cnames.shift()] = columnValue;
    }
    data.push(obj);
  }
  return data;
}