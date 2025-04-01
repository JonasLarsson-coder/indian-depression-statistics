// ironboy
// shorten document.querySelector to $
// (or whatever you import it as)
export default function $(selector) {
  return document.querySelector(selector);
}