'use strict';
(() => {
  const reportId='TT-SOP-20261103-01', expiry=Date.parse('2027-02-01T03:00:00Z');
  const gate=document.querySelector('#gate'),form=document.querySelector('#unlock'),pinInput=document.querySelector('#pin'),status=document.querySelector('#status'),submit=document.querySelector('#submit'),unlocked=document.querySelector('#unlocked'),report=document.querySelector('#report');
  const message=value=>{status.textContent=value};
  const bytes=encoded=>{const raw=atob(encoded.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-encoded.length%4)%4));return Uint8Array.from(raw,ch=>ch.charCodeAt(0))};
  const token=new URLSearchParams(location.hash.slice(1)).get('k')??'';
  document.querySelector('#savepdf').addEventListener('click',()=>window.print());
  if(Date.now()>=expiry){form.hidden=true;message('El plazo de acceso de este informe ha finalizado. Contacta a Tooltician si necesitas una copia.');return;}
  if(!/^[A-Za-z0-9_-]{43}$/.test(token)){form.hidden=true;message('Este enlace no incluye autorización. Escanea el QR original de tu comprobante.');return;}
  if(!globalThis.crypto?.subtle||!globalThis.DecompressionStream){form.hidden=true;message('Utiliza un navegador actualizado para abrir este informe protegido.');return;}
  form.addEventListener('submit',async event=>{
    event.preventDefault();const pin=pinInput.value;
    if(!/^[0-9]{4}$/.test(pin)){message('Introduce los cuatro dígitos de tu clave.');return;}
    submit.disabled=true;let phase='authentication';message('Verificando clave y descifrando el informe…');
    try{
      const response=await fetch('./payload.json',{cache:'no-store'});
      if(!response.ok)throw Error('missing');
      const data=await response.json();
      if(data.id!==reportId||data.version!==1||data.compression!=='gzip'||data.iterations!==600000)throw Error('invalid');
      const encoder=new TextEncoder();
      const base=await crypto.subtle.importKey('raw',encoder.encode('TT-REPORT-v1|'+pin+'|'+token),'PBKDF2',false,['deriveKey']);
      const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes(data.salt),iterations:data.iterations,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['decrypt']);
      const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(data.nonce),additionalData:encoder.encode(reportId)},key,bytes(data.ciphertext));
      const expanded=new Blob([plain]).stream().pipeThrough(new DecompressionStream('gzip'));
      const originalHtml=await new Response(expanded).text();
      // Same derived key and the existing QR/PIN: separate nonce and AAD for the addendum.
      phase='addendum';
      const extraResponse=await fetch('./addendum-20261105.json',{cache:'no-store'});
      if(!extraResponse.ok)throw Error('missing addendum');
      const extra=await extraResponse.json();
      if(extra.id!==reportId||extra.version!==1||extra.published!=='2026-11-05'||extra.compression!=='gzip'||!/^[-_A-Za-z0-9]{16}$/.test(extra.nonce)||!/^[-_A-Za-z0-9]{4000,}$/.test(extra.ciphertext))throw Error('invalid addendum');
      const supplement=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(extra.nonce),additionalData:encoder.encode(reportId+'|ADDENDUM-20261105')},key,bytes(extra.ciphertext));
      const decompressed=new Blob([supplement]).stream().pipeThrough(new DecompressionStream('gzip'));
      const appendixHtml=await new Response(decompressed).text();
      report.innerHTML=originalHtml+appendixHtml;
      pinInput.value='';gate.hidden=true;unlocked.hidden=false;
      document.title='Informe técnico | Tooltician Soporte';
      window.scrollTo({top:0,behavior:'instant'});
    }catch(_){message(phase==='addendum'?'No fue posible cargar la actualización del 5 de noviembre. Intenta nuevamente o contacta a Tooltician.':'No fue posible abrir el informe. Verifica la clave y vuelve a escanear el QR.');}
    finally{submit.disabled=false;}
  });
})();