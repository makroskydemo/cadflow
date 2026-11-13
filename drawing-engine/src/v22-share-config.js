// Generated from the CadFlow public connection configuration.
{
 const origin="https://rqstvpmqgkdghrbokbzn.supabase.co";
 const inline={mode:'inline'};
 let pending;
 window.PLMR_ANIMATION_SHARE_CONFIG=location.protocol==='file:'?inline:{
  load(){
   if(!pending)pending=fetch(new URL('../plmr-public-config.json',location.href),{cache:'no-store',signal:AbortSignal.timeout(8000)})
    .then(async response=>{
     if(!response.ok)throw Error('Cloud configuration could not be loaded.');
     const settings=await response.json();
     if(settings.supabaseUrl!==origin||!/^sb_publishable_[A-Za-z0-9_-]{16,}$/.test(settings.supabasePublishableKey))
      throw Error('Configure the MAKROSKY CadFlow publishable key before sharing.');
     return {mode:'cloud',endpoint:origin+'/functions/v1/plmr-platform',publicKey:settings.supabasePublishableKey,
      getAccessToken:()=>window.parent.PLMRCloud?.getAccessToken(),getCompanyId:()=>window.parent.PLMRCloud?.getCompanyId()};
    }).catch(error=>{pending=undefined;throw error});
   return pending;
  }
 };
}
