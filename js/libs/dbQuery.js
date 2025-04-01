import jload from './jload.js';

// make a deb query to a sqlite db through backend api
export default async function dbQuery(selectQuery) {
  return await jload('/api/dbquery/' + encodeURIComponent(selectQuery));
}