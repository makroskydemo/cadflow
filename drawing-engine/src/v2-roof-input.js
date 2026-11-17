/* Shared quote and drawing input contract. */
(function(root){'use strict';
  const gutterHeights = Object.freeze({'b-cube':260,'bio-rise':218,'b-cube-galaxy':225});
  function minimumHeight(group){return gutterHeights[group] ?? gutterHeights['b-cube'];}
  function heightMessage(group){
    const message='Yükseklik oluk yüksekliğinden az olamaz. En az {height} mm girin.';
    return (root.PLMRLocale?.t(message) || message).replace('{height}',String(minimumHeight(group)));
  }
  function requireHeight(value,group){
    const height=Number(value);
    if(!Number.isFinite(height)||height<minimumHeight(group))throw Error(heightMessage(group));
    return height;
  }
  function validate(input){
    const width=Number(input.width),depth=Number(input.depth),height=requireHeight(input.height,input.productGroup);
    if(![width,depth].every(Number.isFinite)||width<1000||depth<2104||Math.max(width,depth,height)>1000000)
      throw Error(root.PLMRLocale?.t('Cephe en az 1000 mm, açılım en az 2104 mm olmalıdır.') || 'Cephe en az 1000 mm, açılım en az 2104 mm olmalıdır.');
    return {width,depth,height};
  }
  const api=Object.freeze({validate,minimumHeight,heightMessage,requireHeight});
  root.PLMRRoofInput=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
