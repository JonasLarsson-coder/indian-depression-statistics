// Warn if using Live Server / not using our new backedn
let isRealBackend = await(await fetch('/api/is-real-backend')).json().catch(e => alert(
  'Version 4 of the Statistics Template says:\n\n' +
  '- Stop using Live Server!\n' +
  '- Instead start from the VSC terminal by writing npm start\n\n' +
  '(In order for this to work you must have installed Node.js.)'
));

// Reload if the SSE source closes
// (which it does on file changes since we start using nodemon)
if (isRealBackend) {
  const evtSource = new EventSource("/api/reload-if-closes");
  evtSource.onerror = () => setTimeout(() => location.reload(), 1000);
}
