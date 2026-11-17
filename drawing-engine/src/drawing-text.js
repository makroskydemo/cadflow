/* Drawing captions share the application dictionary. Model values, position
 * codes, layer names and measurements never pass through a DOM translator. */
(function(root){
 'use strict';
 function locale(){return root.PLMRI18n||root.parent?.PLMRI18n||root.PLMRLocale||root.parent?.PLMRLocale;}
 function t(source){
  const api=locale(),value=String(source??'');
  const quantity=value.match(/^(.*?) - (\d+) Adet$/);
  if(quantity)return (api?.t('{position} - {count} Adet')||'{position} - {count} Adet').replace('{position}',quantity[1]).replace('{count}',quantity[2]);
  const total=value.match(/^Toplam · (.*)$/);
  if(total)return (api?.t('Toplam')||'Toplam')+' · '+total[1];
  return api?.t(value)||value;
 }
 /** The owning object holds its callback; removing it from the scene releases
  * everything. No global strong-reference label registry or per-frame work. */
 function bind(object,source,render){
  let last=t(source);
  object.userData.plmrRefreshText=()=>{const next=t(source);if(next===last)return;render(next);last=next;};
 }
 function refresh(scene){scene.traverse(object=>object.userData.plmrRefreshText?.());}
 function documentView(document){
  if(!document)return document;
  return {...document,entities:document.entities.map(entity=>{
   if(!['text','mtext'].includes(entity.type))return entity;
   const role=entity.role;
   const caption=['view','motor','position-label'].includes(role)||role==='position'&&/^.* - \d+ Adet$/.test(entity.value||'');
   return caption?{...entity,value:t(entity.value)}:entity;
  })};
 }
 root.PLMRDrawingText=Object.freeze({t,bind,refresh,document:documentView,language:()=>locale()?.getLanguage?.()||'TR'});
})(window);
