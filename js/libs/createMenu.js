import './liveReload.js';

export default function createMenu(siteName, menuData) {
  // add slugs
  let menuDataFlat = [];
  menuData = JSON.parse(JSON.stringify(menuData), function (_key, val) {
    if (this.name && this.script) {
      this.slug = '#' + kebabify(this.name);
      menuDataFlat.push(this);
    }
    return val;
  });
  globalThis.menuDataFlat = menuDataFlat;
  // build menu
  let menu = `
      <nav class="navbar navbar-expand-lg bg-body-tertiary fixed-top">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">${siteName}</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            ${menuData.map(({ name, slug, sub }) => sub ?
            /*html*/`
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  ${name}
                </a>
                <ul class="dropdown-menu">
                  ${sub.map(({ name, slug }) => `
                    <li><a class="dropdown-item" href="${slug}">${name}</a>
                  `).join('')}
                </ul>
              </li>
            `  :
            /*html*/`
              <li class="nav-item">
                <a class="nav-link" href="${slug}">${name}</a>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    </nav>
  `;
  document.querySelector('header').innerHTML = menu;
  hashNav();
}

function kebabify(str) {
  return str
    .toLowerCase()                   // to small letters
    .normalize('NFD')                // convert so that diacritics are separate
    .replace(/\p{Diacritic}/gu, '')  // remove diacritics
    .replace(/\s/g, '-')             // replace whitespaces with hyphens
    .replace(/[^\w-]/g, '')          // remove everything except \w [a-z0-9] and '-'
}

// Navigate
function hashNav() {
  let menuData = globalThis.menuDataFlat;
  let h = location.hash || '#' + kebabify(menuData[0].name);
  window.hash = h.slice(1);
  for (let link of [...document.querySelectorAll('header .nav-item a')]) {
    let href = link.getAttribute('href');
    link.classList.remove('active');
    if (h === href) {
      link.classList.add('active');
      link.closest('.nav-item').querySelector('.nav-link').classList.add('active');
    }
  }
  // empty main area
  document.querySelector('main').innerHTML = '';
  // load script
  let src = '/js/' + ((menuData.find(x => x.slug === h) || {}).script || '') + '?' + Math.random();
  let scriptTag = document.createElement('script');
  scriptTag.classList.add('page-script');
  scriptTag.setAttribute('type', 'module');
  scriptTag.setAttribute('src', src);
  let oldScriptTag = document.querySelector('.page-script');
  oldScriptTag && oldScriptTag.remove();
  document.body.append(scriptTag);
  // close navbar
  let nbToggler = document.querySelector('.navbar-toggler');
  nbToggler.getAttribute('aria-expanded') === 'true' && nbToggler.click();
}
window.onhashchange = hashNav;