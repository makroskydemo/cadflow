/* One physical shared post, several stable logical member records. No scene writes here. */
(function(root){'use strict';
function plan(owners,ownerId,memberId,x,z,vector){
 const selected=owners.find(owner=>owner.id===ownerId),post=selected?.posts.find(p=>p.memberId===memberId);
 const group=selected?.spec.sceneEditor?.members?.[memberId]?.commonGroup;
 if(!post||!group)throw Error('Ortak dikme bulunamadı.');
 const delta=vector([x-post.x,0,z-post.z],selected.pose.angle||0),records=[];
 for(const owner of owners)for(const [id,edit]of Object.entries(owner.spec.sceneEditor?.members||{})){
  if(edit.commonGroup!==group)continue;
  const member=owner.posts.find(p=>p.memberId===id);
  if(!member)throw Error('Ortak dikmenin bağlantısı eksik. Önce bu grubun bağlantısını kontrol edin.');
  const local=vector(delta,-(owner.pose.angle||0));
  records.push({owner:owner.id,memberId:id,edit:{...edit,sharedX:(Number(edit.sharedX)||0)+local[0],sharedZ:(Number(edit.sharedZ)||0)+local[2]}});
 }
 if(records.length<2)throw Error('Ortak dikmenin bağlantısı eksik.');
 const others=[];
 for(const owner of owners)for(const member of owner.posts){
  const edit=owner.spec.sceneEditor?.members?.[member.memberId]||{};
  if(edit.commonGroup===group||edit.sharedWith||edit.deleted)continue;
  const polygon=[];
  for(const [a,b]of [[-1,-1],[1,-1],[1,1],[-1,1]]){
   const world=vector([member.x+a*member.section.x/2,0,member.z+b*member.section.z/2],owner.pose.angle||0);
   const local=vector([world[0]+(owner.pose.x||0)-(selected.pose.x||0),0,world[2]+(owner.pose.z||0)-(selected.pose.z||0)],-(selected.pose.angle||0));
   polygon.push({x:local[0],z:local[2]});
  }
  // Separate storeys do not collide merely because their plan projection overlaps.
  const bottom=(owner.pose.y||0)+(owner.spec.sceneEditor?.groundY||0)+(member.added?owner.spec.height/2:0)+(member.bottom||0);
  const top=bottom+member.height,selectedBottom=(selected.pose.y||0)+(selected.spec.sceneEditor?.groundY||0)+(post.added?selected.spec.height/2:0)+(post.bottom||0);
  if(Math.min(top,selectedBottom+post.height)-Math.max(bottom,selectedBottom)<=.5)continue;
  others.push({key:owner.id+'|'+member.memberId,kind:'post',polygon});
 }
 if(root.PLMRV12Core.collision({key:ownerId+'|'+memberId,x,z,section:post.section},others))throw Error('Ortak dikme başka bir dikmeyle çakışıyor.');
 return records;
}
root.PLMRSharedPostShift=Object.freeze({plan});
if(typeof module==='object'&&module.exports)module.exports=root.PLMRSharedPostShift;
})(typeof globalThis!=='undefined'?globalThis:this);
