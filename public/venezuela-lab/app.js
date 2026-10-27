'use strict';
// Edición cero: interacción local, sin telemetría, backend ni formularios.
const articleData={
actas:{category:'EXPEDIENTE · MUESTRA',title:'2024: las actas frente al relato oficial',paragraphs:['Un expediente electoral serio debería permitir que cualquier lector encuentre la documentación original, identifique su procedencia y comprenda qué se ha podido verificar de manera independiente.','Este espacio incluiría una cronología, enlaces a las actas disponibles, sus métodos de validación y las respuestas documentadas de las instituciones. El rigor del método es tan importante como la conclusión editorial.']},
chavismo:{category:'OPINIÓN · MUESTRA',title:'El chavismo no es Venezuela',paragraphs:['Ningún partido, dirigente o proyecto político tiene derecho a apropiarse de una nación. Venezuela es su gente, su historia y sus libertades; no una marca registrada por quienes ejercen el poder.','Una línea editorial puede combatir abiertamente al chavismo sin convertir la crítica en un sustituto de los hechos. Las ideas se defienden con argumentos; las acusaciones concretas, con pruebas.']},
dinero:{category:'EXPEDIENTES · MUESTRA',title:'Cómo seguir el rastro del dinero público',paragraphs:['El presupuesto público no debería ser un acertijo reservado para funcionarios. Cada adjudicación, contrato o transferencia relevante tendría que dejar evidencia consultable, fechada y trazable.','Este formato combinaría tablas abiertas, documentos originales y una explicación legible de las limitaciones de los datos. Donde falte evidencia, se dirá con claridad que falta.']},
preguntas:{category:'ACTUALIDAD · MUESTRA',title:'Las preguntas que todo funcionario debería responder',paragraphs:['¿Dónde están los presupuestos ejecutados? ¿Cómo se adjudican los contratos? ¿Dónde se publican las decisiones y quién responde por sus resultados? Estas preguntas corresponden a cualquier gobierno.','La rendición de cuentas no es un favor que el Estado concede a la ciudadanía: es una obligación pública que un medio independiente debe vigilar.']},
archivo:{category:'ARCHIVO · MUESTRA',title:'Un archivo público contra el olvido',paragraphs:['Las declaraciones desaparecen de los portales, los enlaces se rompen y la memoria pública se vuelve vulnerable cuando no existen registros consultables.','La propuesta sería conservar referencias, documentos y cronologías de interés público, con metadatos suficientes para que futuras investigaciones puedan recorrer el expediente.']}
};
const cards=[...document.querySelectorAll('.story-card')];
const filterButtons=[...document.querySelectorAll('[data-filter]')];
const search=document.querySelector('#article-search');
const count=document.querySelector('#result-count');
const noResults=document.querySelector('#no-results');
let activeFilter='Todas';
function normalizeSearch(value){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');}
function applyFilter(){
const query=normalizeSearch(search.value).trim();let visible=0;let demos=0;
for(const card of cards){const show=(activeFilter==='Todas'||card.dataset.category===activeFilter)&&(!query||normalizeSearch(card.dataset.search+' '+card.innerText).includes(query));card.hidden=!show;if(show){visible++;if(card.querySelector('.demo-tag'))demos++;}}
const sourced=visible-demos;
count.textContent=`${visible} ${visible===1?'contenido':'contenidos'}: ${sourced} con fuentes y ${demos} ${demos===1?'muestra':'muestras'}`;
noResults.hidden=visible!==0;
for(const button of filterButtons){const pressed=button.dataset.filter===activeFilter;button.classList.toggle('active',pressed);button.setAttribute('aria-pressed',String(pressed));}
}
for(const button of filterButtons)button.addEventListener('click',()=>{activeFilter=button.dataset.filter;applyFilter();});
for(const link of document.querySelectorAll('[data-nav-filter]'))link.addEventListener('click',()=>{activeFilter=link.dataset.navFilter;search.value='';applyFilter();const details=link.closest('details');if(details)details.open=false;});
search.addEventListener('input',applyFilter);
const dialog=document.querySelector('#reader-dialog');
let opener=null;
for(const button of document.querySelectorAll('[data-article]'))button.addEventListener('click',()=>{
const article=articleData[button.dataset.article];if(!article)return;opener=button;
document.querySelector('#reader-category').textContent=article.category;
document.querySelector('#reader-title').textContent=article.title;
const content=document.querySelector('#reader-content');content.replaceChildren();
for(const paragraph of article.paragraphs){const p=document.createElement('p');p.textContent=paragraph;content.appendChild(p);}
dialog.showModal();
});
function closeDialog(){dialog.close();}
document.querySelector('.dialog-close').addEventListener('click',closeDialog);
document.querySelector('.dialog-done').addEventListener('click',closeDialog);
dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog();});
dialog.addEventListener('close',()=>{if(opener)opener.focus();opener=null;});
applyFilter();