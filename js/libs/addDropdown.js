import addToPage from "./addToPage.js";
window.dropdownValues = window.dropdownValues || {};

export default function addDropdown(label, data, initialValue = '') {
  let name = 'sel' + (document.querySelectorAll('main select').length + 1);
  initialValue = window.dropdownValues[window.hash + '.' + name] || initialValue;
  addToPage(`
    <label class="my-3 me-4">
      <table style="border:0">
      <tr>
      <td class="pe-3">
      ${label}: 
      </td>
      <td>
      <select name="${name}" class="form-select">
        ${data.map(x => `<option ${initialValue == x ? 'selected' : ''}>${x}</option>`)}
      </select>
      </td>
      </table>
    </label>
  `);
  return initialValue || data[0];
}

document.body.addEventListener('change', e => {
  let select = e.target.closest('select');
  if (!select) { return; }
  window.dropdownValues[window.hash + '.' + select.getAttribute('name')] = select.value;
  document.querySelector('main').innerHTML = '';
  let scriptToReload = document.querySelector('script.page-script');
  let src = scriptToReload.getAttribute('src');
  src = src.split('?')[0] + '?' + Math.random();
  scriptToReload.remove();
  let newScript = document.createElement('script');
  newScript.setAttribute('type', 'module');
  newScript.classList.add('page-script');
  newScript.setAttribute('src', src);
  document.body.append(newScript);
});