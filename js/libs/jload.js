// ironboy
// Load data from a json url/"file"
export default async function jload(url) {
  return await (await fetch(url)).json();
}