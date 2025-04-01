// convert an array of objects 
// to an array with column headings
// (like Google Charts like its data)
// - assumes all objects have the same keys

export default function makeChartFriendly(arrayOfObjects, ...columnNamesCustomized) {
  let columnNames = Object.keys(arrayOfObjects[0]);
  columnNamesCustomized.forEach((x, i) => columnNames[i] = x);
  return [
    columnNames,
    ...arrayOfObjects.map(x => Object.values(x))
  ];
}