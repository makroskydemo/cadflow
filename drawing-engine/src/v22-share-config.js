// Generated from the CadFlow public connection configuration.
{
 const origin="https://rqstvpmqgkdghrbokbzn.supabase.co";
 const inline={mode:'inline'};
 const publishedKey="";
 const cloud=publicKey=>({mode:'cloud',endpoint:origin+'/functions/v1/plmr-platform',publicKey,
  getAccessToken:()=>window.parent.PLMRCloud?.getAccessToken(),getCompanyId:()=>window.parent.PLMRCloud?.getCompanyId()});
 let pending;
 window.PLMR_ANIMATION_SHARE_CONFIG=location.protocol==='file:'?inline:{
  load(){
   if(publishedKey)return Promise.resolve(cloud(publishedKey));
   const host=window.parent.PLMRCloud;
   if(host?.endpoint===origin+'/functions/v1/plmr-platform'&&host.key)return Promise.resolve(cloud(host.key));
   if(!pending)pending=fetch(new URL('../plmr-public-config.json',location.href),{cache:'no-store',signal:AbortSignal.timeout(8000)})
    .then(async response=>{
     if(!response.ok)throw Error('Cloud configuration could not be loaded.');
     const settings=await response.json();
     if(settings.supabaseUrl!==origin||!/^sb_publishable_[A-Za-z0-9_-]{16,}$/.test(settings.supabasePublishableKey))
      throw Error('Configure the MAKROSKY CadFlow publishable key before sharing.');
     return cloud(settings.supabasePublishableKey);
    }).catch(error=>{pending=undefined;throw error});
   return pending;
  }
 };
}
