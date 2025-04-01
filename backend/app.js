import express from 'express';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Port to start the web server on
const port = 3005

// Create a web server 
const app = express();

// Serve the files in the main folder
app.use(express.static(path.join(import.meta.dirname, '..')));

// Start the web server
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));

// Routes for live reload
app.get('/api/is-real-backend', (_req, res) => res.send(true));
app.get('/api/reload-if-closes', (_req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-control': 'no-cache'
  });
  setInterval(() => res.write('data: ping\n\n '), 20000);
});

// Read settings for which SQLite-database to use
let dbFolder = path.join(import.meta.dirname, '..', 'sqlite-databases');
let databaseToUse = fs.readFileSync(path.join(dbFolder, 'database-in-use.json'), 'utf-8').slice(1, -1);
databaseToUse = path.join(path.join(dbFolder, databaseToUse));
// databse connection
let db;
if (fs.existsSync(databaseToUse)) {
  db = new Database(databaseToUse);
}

// route for database query (SELECT:s only)
app.get('/api/dbquery/:select', (req, res) => {
  let select = req.params.select.trim();
  if (!db) {
    res.json([{ error: 'No database connected!' }]);
    return;
  }
  if ((select + '').toLowerCase().indexOf('select ') !== 0) {
    res.json([{ error: 'Only SELECT queries can be run!' }]);
    return;
  }
  let result;
  try {
    result = db.prepare(select).all()
  }
  catch (e) {
    result = [{ error: e + '' }]
  }
  res.json(result);
});

// app get script to start with
// check for scripts in this order
// js/_menu.js, js/main.js, main.js
app.get('/api/getMainScript', (_req, res) => {
  let mainFolder = path.join(import.meta.dirname, '..');
  let whichScriptsExists = [
    { name: '/js/_menu.js', exists: fs.existsSync(path.join(mainFolder, 'js', '_menu.js')) },
    { name: '/js/main.js', exists: fs.existsSync(path.join(mainFolder, 'js', 'main.js')) },
    { name: '/main.js', exists: fs.existsSync(path.join(mainFolder, 'main.js')) }
  ];
  res.set({ 'Content-Type': 'application/javascript' });
  res.send(
    `let whichScriptsExists = ${JSON.stringify(whichScriptsExists, '', '  ')};\n\n` +
    `let scriptToLoad = whichScriptsExists.find(x => x.exists);\n` +
    `scriptToLoad.name.includes('menu') && document.body.classList.add('with-menu');\n` +
    `scriptToLoad && import(scriptToLoad.name);`
  );
});

app.get('/api/chartSettings', (_req, res) => {
  res.sendFile()
});