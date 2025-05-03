

// Rubrik och beskrivning
addMdToPage('## Genomsnittlig ålder och depression per kön');
addMdToPage(`Här visas den genomsnittliga åldern för män och kvinnor som deltog i studien, samt andel i procent som lider av depression. Välj ett kön eller total i dropdown-menyn för att se specifik statistik.`);

// Ladda Google Charts med explicit språk
google.charts.load('current', {
  packages: ['corechart'],
  language: 'sv' // Förhindra språkvarning
});

// Skapa HTML-element **endast en gång**
const dropdownDiv = document.createElement('div');
dropdownDiv.id = 'dropdown-container';
document.body.appendChild(dropdownDiv);

const resultDiv = document.createElement('div');
resultDiv.id = 'result';
document.body.appendChild(resultDiv);

const chartDiv = document.createElement('div');
chartDiv.id = 'chart-container';
document.body.appendChild(chartDiv);

// Hämta datan från databasen **endast en gång**
const avgAge = await dbQuery(`
  SELECT gender, 
         ROUND(AVG(age), 2) AS average_age, 
         ROUND(100.0 * SUM(depression) / COUNT(*), 2) AS depression_percentage 
  FROM results 
  GROUP BY gender 
  UNION ALL 
  SELECT 'Total' AS gender, 
         ROUND(AVG(age), 2) AS average_age, 
         ROUND(100.0 * SUM(depression) / COUNT(*), 2) AS depression_percentage 
  FROM results;
`);

// Kontrollera datan i konsolen
console.log('Fetched data:', avgAge);

// Skapa dropdown **endast en gång**
const select = document.createElement('select');
select.id = 'gender-select';
avgAge.forEach(row => {
  const option = document.createElement('option');
  option.value = row.gender;
  option.textContent = row.gender;
  select.appendChild(option);
});
dropdownDiv.appendChild(select);

// Funktion för att **uppdatera** resultat och diagram utan att skapa nya element
function updateView(selectedGender) {
  // Hämta data för valt kön
  const selectedData = avgAge.find(row => row.gender === selectedGender);
  if (!selectedData) {
    console.error(`Data för ${selectedGender} hittades inte`);
    return;
  }

  const avg = selectedData.average_age;
  const dep = selectedData.depression_percentage;

  // Uppdatera **befintlig** resultat-div
  resultDiv.innerHTML = `
    <p><strong>Genomsnittlig ålder, ${selectedGender}:</strong> ${avg} år</p>
    <p><strong>Andel med depression:</strong> ${dep}%</p>
  `;

  // **Rensa endast innehållet i chart-container utan att skapa nytt**
  chartDiv.innerHTML = '';

  // Skapa och rita om diagrammet
  const dataTable = google.visualization.arrayToDataTable([
    ['Kategori', 'Värde'],
    ['Genomsnittlig ålder', avg],
    ['Depression (%)', dep]
  ]);

  const options = {
    title: `Statistik för ${selectedGender}`,
    hAxis: { title: 'Kategori' },
    vAxis: { title: 'Värde' },
    height: 400,
    width: 800,
    legend: { position: 'none' },
    colors: ['#5c9ead']
  };

  const chart = new google.visualization.ColumnChart(chartDiv);
  chart.draw(dataTable, options);
}

// Vänta på att Google Charts laddas innan vi aktiverar eventhantering
google.charts.setOnLoadCallback(() => {
  // Lyssna på ändringar i dropdown
  select.addEventListener('change', (e) => {
    console.log(`Valt kön: ${e.target.value}`);
    updateView(e.target.value);
  });

  // Visa 'Total' som startvy
  select.value = 'Total';
  updateView('Total');
});
