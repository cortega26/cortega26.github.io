'use strict';
// Filtros solo locales: no analytics ni información personal.
const buttons=[...document.querySelectorAll('[data-room-filter]')];
const rooms=[...document.querySelectorAll('[data-room]')];
const count=document.querySelector('#room-count');
function filterRooms(category){
 let visible=0;
 for(const room of rooms){
   const show=category==='Todas'||room.dataset.room===category;
   room.hidden=!show;if(show)visible++;
 }
 for(const button of buttons){
   const selected=button.dataset.roomFilter===category;
   button.classList.toggle('selected',selected);
   button.setAttribute('aria-pressed',String(selected));
 }
 count.textContent=visible+' '+(visible===1?'sala':'salas')+' de introducción documental';
}
for(const button of buttons)button.addEventListener('click',()=>filterRooms(button.dataset.roomFilter));
filterRooms('Todas');
