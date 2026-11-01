'use strict';
// Edición cero: interacción local, sin telemetría, backend ni formularios.
const cards=[...document.querySelectorAll('.story-card')];
const filterButtons=[...document.querySelectorAll('[data-filter]')];
const search=document.querySelector('#article-search');
const count=document.querySelector('#result-count');
const noResults=document.querySelector('#no-results');
let activeFilter='Todas';
function normalizeSearch(value) {
  return value.normalize('NFD')
    .replace(/n\u0303/gi, 'ñ')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es');
}
function applyFilter(){
const query=normalizeSearch(search.value).trim();let visible=0;
for(const card of cards){const show=(activeFilter==='Todas'||card.dataset.category===activeFilter)&&(!query||normalizeSearch(`${card.dataset.search} ${card.innerText}`).includes(query));card.hidden=!show;if(show)visible++;}
count.textContent=`${visible} ${visible===1?'contenido con fuentes':'contenidos con fuentes'}`;
noResults.hidden=visible!==0;
for(const button of filterButtons){const pressed=button.dataset.filter===activeFilter;button.classList.toggle('active',pressed);button.setAttribute('aria-pressed',String(pressed));}
}
for(const button of filterButtons)button.addEventListener('click',()=>{activeFilter=button.dataset.filter;applyFilter();});
for(const link of document.querySelectorAll('[data-nav-filter]'))link.addEventListener('click',()=>{activeFilter=link.dataset.navFilter;search.value='';applyFilter();const details=link.closest('details');if(details)details.open=false;});
search.addEventListener('input',applyFilter);
applyFilter();