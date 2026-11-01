'use strict';
// Edición cero: interacción local, sin telemetría, backend ni formularios.
const cards=[...document.querySelectorAll('.story-card')];
const filterButtons=[...document.querySelectorAll('[data-filter]')];
const search=document.querySelector('#article-search');
const count=document.querySelector('#result-count');
const noResults=document.querySelector('#no-results');
const clearFilters=document.querySelector('#clear-filters');
let activeFilter='Todas';

function normalizeSearch(value) {
  return value.normalize('NFD')
    .replace(/n\u0303/gi, 'ñ')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es');
}

// Derivar los contadores de las tarjetas reales, sin mantener seis cifras a mano.
const categoryCounts=new Map();
for(const card of cards){
  const category=card.dataset.category;
  categoryCounts.set(category,(categoryCounts.get(category)||0)+1);
}
for(const button of filterButtons){
  const badge=button.querySelector('[data-count]');
  if(badge)badge.textContent=String(button.dataset.filter==='Todas'?cards.length:(categoryCounts.get(button.dataset.filter)||0));
}

function applyFilter(){
  const query=normalizeSearch(search.value).trim();
  let visible=0;
  for(const card of cards){
    // textContent también funciona con tarjetas ocultas por un filtro anterior.
    const matches=activeFilter==='Todas'||card.dataset.category===activeFilter;
    const found=!query||normalizeSearch(`${card.dataset.search} ${card.textContent}`).includes(query);
    card.hidden=!(matches&&found);
    if(!card.hidden)visible++;
  }
  count.textContent=`${visible} ${visible===1?'contenido con fuentes':'contenidos con fuentes'}`;
  noResults.hidden=visible!==0;
  for(const button of filterButtons){
    const pressed=button.dataset.filter===activeFilter;
    button.classList.toggle('active',pressed);
    button.setAttribute('aria-pressed',String(pressed));
  }
}
for(const button of filterButtons)button.addEventListener('click',()=>{
  activeFilter=button.dataset.filter;
  applyFilter();
});
for(const link of document.querySelectorAll('[data-nav-filter]'))link.addEventListener('click',()=>{
  activeFilter=link.dataset.navFilter;
  search.value='';
  applyFilter();
  const details=link.closest('details');
  if(details)details.open=false;
});
clearFilters.addEventListener('click',()=>{
  activeFilter='Todas';
  search.value='';
  applyFilter();
  search.focus();
});
search.addEventListener('input',applyFilter);
applyFilter();
