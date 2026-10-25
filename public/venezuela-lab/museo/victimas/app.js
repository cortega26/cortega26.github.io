import { CASES, SOURCES, CATEGORIES, EPISODES } from './data.js';

function normalize(value) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}
function elem(tag, className, value) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (value !== undefined) item.textContent = value;
  return item;
};
function external(label, href, className = '') {
  const link = elem('a', className, label);
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
};
function internal(label, href, className = '') {
  const link = elem('a', className, label);
  link.href = href;
  return link;
};
const sorted = [...CASES].sort((a,b) => b.year-a.year || a.name.localeCompare(b.name, 'es'));
function dateLabel(person) {
  return person.date ? new Date(`${person.date}T12:00:00Z`).toLocaleDateString('es-VE',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}) : person.period || String(person.year);
}

function renderIndex() {
  const container = document.querySelector('#cases');
  if (!container) return;
  const search = document.querySelector('#search');
  const year = document.querySelector('#year');
  const episode = document.querySelector('#episode');
  const loadMore = document.querySelector('#load-more');
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const results = document.querySelector('#result-status');
  const none = document.querySelector('#none');
  document.querySelector('#registered-count').textContent = String(CASES.length);
  for (const y of [...new Set(CASES.map(v => v.year))].sort((a,b) => b-a)) {
    const option = elem('option', '', String(y)); option.value=String(y); year.append(option);
  }
  for (const [key,label] of Object.entries(EPISODES)) {
    if (!CASES.some(p => p.episode === key)) continue;
    const option = elem('option', '', `${label} · ${CASES.filter(p=>p.episode===key).length}`);
    option.value=key;
    episode.append(option);
  }
  let kind = 'todas';
  let limit = 24;
  function draw() {
    const needle = normalize(search.value.trim());
    const records = sorted.filter(p => (kind === 'todas' || kind === p.category) && (episode.value === 'todos' || p.episode === episode.value) && (year.value === 'todos' || (+year.value >= p.year && +year.value <= (p.yearEnd || p.year))) && (!needle || normalize(p.name).includes(needle)));
    const displayed = records.slice(0,limit);
    const frag = document.createDocumentFragment();
    for (const person of displayed) {
      const card = elem('article', 'person-card');
      const top = elem('div','person-top');
      top.append(elem('span','person-year', dateLabel(person)),elem('span','person-category', CATEGORIES[person.category]));
      const name = elem('h3','person-name'); name.append(internal(person.name, `./perfil.html?id=${encodeURIComponent(person.id)}`)); card.append(top,name);
      const excerpt=elem('p','person-excerpt',person.note);card.append(excerpt);
      const actions=elem('div','person-actions');
      actions.append(internal('VER FICHA DOCUMENTAL →',`./perfil.html?id=${encodeURIComponent(person.id)}`,'detail-link'));
      if(person.biography)actions.append(external('PERFIL EXTERNO ↗',person.biography,'bio-link'));
      card.append(actions);frag.append(card);
    }
    container.replaceChildren(frag);
    none.hidden=records.length!==0;
    loadMore.hidden=displayed.length>=records.length;
    results.textContent=`${records.length} ${records.length===1?'nombre':'nombres'} ${records.length===CASES.length?'registrados':'coincidentes'} · Mostrando ${displayed.length}`;
  }
  for(const button of buttons)button.addEventListener('click',()=>{
    kind=button.dataset.filter;
    for(const item of buttons)item.setAttribute('aria-pressed',String(item===button));
    limit=24;
    draw();
  });
  search.addEventListener('input',()=>{limit=24;draw();});
  year.addEventListener('change',()=>{limit=24;draw();});
  episode.addEventListener('change',()=>{limit=24;draw();});
  loadMore.addEventListener('click',()=>{limit+=24;draw();});
  document.querySelector('[data-open-2002]')?.addEventListener('click',()=>{
    episode.value='2002-11A';kind='todas';year.value='todos';search.value='';limit=24;
    for (const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.filter==='todas'));
    draw();
  });
  draw();
  const sources=document.querySelector('#source-index');
  for(const [key,source] of Object.entries(SOURCES)){
    const node=elem('article','reference');
    node.append(elem('span','reference-number',key));
    const name=elem('h3'); name.append(external(`${source.title} ↗`,source.url));node.append(name);
    node.append(elem('p','',source.scope)); sources.append(node);
  }
}
function renderProfile() {
  const target=document.querySelector('#profile-content');
  if(!target)return;
  const id=new URLSearchParams(window.location.search).get('id');
  const person=CASES.find(p=>p.id===id);
  if(!person){
    target.replaceChildren(elem('h1','','Ficha no encontrada'),elem('p','','El identificador no corresponde a una ficha de este registro.'));
    target.append(internal('← VOLVER AL DIRECTORIO','./'));
    return;
  }
  document.title=`${person.name} — Memorial | Contrapeso`;
  target.replaceChildren();
  const top=elem('div','profile-top');
  top.append(elem('span','',CATEGORIES[person.category]),elem('span','',dateLabel(person)));
  target.append(top,elem('h1','profile-name',person.name),elem('p','profile-lede',person.note));
  if (person.episode) target.append(elem('p','profile-period',`Colección: ${EPISODES[person.episode] || person.episode}`));
  const note=elem('div','profile-caution');
  note.append(elem('strong','','Nota sobre la atribución'));
  note.append(elem('p','','La inclusión en el memorial documenta un fallecimiento en el contexto indicado. No implica una sentencia judicial de homicidio, ni determina por sí sola quién es responsable de la muerte.'));
  target.append(note);
  const section=elem('section','profile-sources');
  section.append(elem('h2','','Documentos y contexto'));
  const intro=elem('p','','Estas referencias permiten contrastar el registro. Algunas son fuentes generales y no expedientes forenses individualizados; su alcance se precisa a continuación.');
  section.append(intro);
  const list=elem('div','profile-source-list');
  for(const id of person.sources){
    const source=SOURCES[id];
    if(!source)continue;
    const item=elem('article','reference');
    const heading=elem('h3');heading.append(external(`${source.title} ↗`,source.url));
    item.append(heading,elem('p','',source.scope));list.append(item);
  }
  section.append(list);target.append(section);
  if(person.biography){
    const bio=elem('section','profile-bio');
    bio.append(elem('h2','','Perfil biográfico publicado'));
    bio.append(elem('p','','Esta persona tiene un perfil publicado por Wikipedia o por una organización de derechos humanos. Se incluye como consulta complementaria; la ficha distingue las afirmaciones documentadas de las que aún requieren cotejo.'));
    bio.append(external('CONSULTAR PERFIL EXTERNO ↗',person.biography,'detail-link'));
    target.append(bio);
  }else{
    const pending=elem('section','profile-bio');
    pending.append(elem('h2','','Biografía individual pendiente'));
    pending.append(elem('p','','En esta edición no se ha verificado una página biográfica individual independiente. El nombre queda enlazado a esta ficha con sus fuentes en vez de dirigir a una biografía inventada.'));
    target.append(pending);
  }
  target.append(internal('← REGRESAR AL ÍNDICE DE NOMBRES','./','back-index'));
}
renderIndex();
renderProfile();
