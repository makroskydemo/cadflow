/* Detached placements retain identity and options until an explicit user command resolves them. */
(function(root){'use strict';
function create(E){
 const key=(owner,slot,id)=>owner+':'+slot+':'+id;
 function source(id){
  for(const owner of E.owners())for(const [slot,store]of [['primary','placements'],['zip','zipPlacements']])for(const [zoneId,placement]of Object.entries(owner.spec[store]||{})){
   if(key(owner.id,slot,zoneId)!==id)continue;
   const resolved=E.details().find(row=>row.kind==='facade'&&row.owner===owner.id&&row.zoneId===zoneId&&row.slot===slot);
   if(resolved?.placementStatus!=='unresolved')throw Error('Bu ürünün yerleşimi zaten geçerli.');
   return{owner,slot,store,zoneId,placement};
  }
  throw Error('Yerleşimi bekleyen ürün bulunamadı.');
 }
 function options(id){
  const from=source(id),owners=E.owners(),result=[];
  for(const zone of E.zones()){
   const target=owners.find(owner=>owner.id===zone.owner);
   if(!target||target.spec[from.store]?.[zone.id])continue;
   const check=E.fit(zone,from.placement,from.slot),fitted=check.fitted;
   if(check.problem||!(fitted?.width>0&&fitted?.height>0))continue;
   result.push({key:key(target.id,from.slot,zone.id),label:(zone.label||zone.code||zone.id)+' · '+Math.round(fitted.width)+' × '+Math.round(fitted.height)+' mm',owner:target.id,zoneId:zone.id});
  }
  return result;
 }
 function transact(change,reason){
  if(root.PLMRFinalReadOnly?.())throw Error('Çizim kilitli veya salt okunur.');
  const before=E.snapshot();
  try{change();E.commit(reason,before);}
  catch(error){E.restore(before);throw error;}
 }
 function remove(id){
  transact(()=>{const from=source(id);delete from.owner.spec[from.store][from.zoneId];const flag=from.slot==='zip'?'zip:'+from.zoneId:from.zoneId;for(const field of ['productOpenStates','panelStates'])delete from.owner.spec[field]?.[flag];},'v4-placement-remove');
 }
 function relocate(id,targetKey){
  transact(()=>{
   const from=source(id),target=options(id).find(option=>option.key===targetKey);
   if(!target)throw Error('Seçilen açıklık artık boş veya uygun değil. Başka bir açıklık seçin.');
   const owner=E.owners().find(owner=>owner.id===target.owner),zone=E.zones().find(zone=>zone.owner===target.owner&&zone.id===target.zoneId);
   if(!owner||!zone||owner.spec[from.store]?.[zone.id])throw Error('Seçilen açıklık artık boş değil.');
   owner.spec[from.store]=owner.spec[from.store]||{};
   owner.spec[from.store][zone.id]=from.placement;delete from.owner.spec[from.store][from.zoneId];
   const oldFlag=from.slot==='zip'?'zip:'+from.zoneId:from.zoneId,newFlag=from.slot==='zip'?'zip:'+zone.id:zone.id;
   for(const field of ['productOpenStates','panelStates'])if(Object.hasOwn(from.owner.spec[field]||{},oldFlag)){
    const value=from.owner.spec[field][oldFlag];delete from.owner.spec[field][oldFlag];owner.spec[field]=owner.spec[field]||{};owner.spec[field][newFlag]=value;
   }
   E.moved(from.placement,owner.id);
  },'v4-placement-recover');
 }
 function assertComplete(){const row=E.details().find(row=>row.placementStatus==='unresolved');if(row)throw Error(row.poz+': Önce yerleşimi bekleyen ürünü bir açıklığa yerleştirin veya silin.');}
 return Object.freeze({options,remove,relocate,assertComplete});
}
root.PLMRPlacementRecovery=Object.freeze({create});
})(typeof globalThis!=='undefined'?globalThis:this);
