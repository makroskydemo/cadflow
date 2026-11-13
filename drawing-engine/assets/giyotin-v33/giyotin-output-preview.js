/* One closed, dimensioned and fitted document path shared by preview and PDF. */
(function(root){
 'use strict';
 function normalize(project){const copy=JSON.parse(JSON.stringify(project));copy.drawingSettings={...copy.drawingSettings,showDimensions:true,openState:'CLOSED',positionOpenStates:{},selectedPositionId:''};return copy;}
 const P2=root.createPLMRGiyotin2DPreview();
  function render3dPdfOverlay(document,sceneDataUrl,sceneWidth,sceneHeight){
    const baseSvg=P2.toSvg(document,{showDimensions:false,hidePositionEntities:true}),frame=document.outerFrame||{x:60,y:60,width:document.bounds.width-120,height:document.bounds.height-120},title=document.titleBlock&&document.titleBlock.bounds||{maxX:3160};
    const edgePad=110,drawX=Math.max(frame.x+edgePad,Number(title.maxX||0)+180),drawRight=frame.x+frame.width-edgePad,drawTopModel=frame.y+frame.height-edgePad,drawBottomModel=frame.y+edgePad,drawY=document.bounds.height-drawTopModel,drawW=Math.max(300,drawRight-drawX),drawH=Math.max(300,drawTopModel-drawBottomModel);
    const innerPad=68,availW=Math.max(120,drawW-innerPad*2),availH=Math.max(120,drawH-innerPad*2),scale=Math.min(availW/Math.max(1,sceneWidth),availH/Math.max(1,sceneHeight)),imgW=sceneWidth*scale,imgH=sceneHeight*scale,imgX=drawX+(drawW-imgW)/2,imgY=drawY+(drawH-imgH)/2;
    const overlay=`<rect x="${drawX}" y="${drawY}" width="${drawW}" height="${drawH}" fill="#ffffff"/><image href="${sceneDataUrl}" x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" preserveAspectRatio="xMidYMid meet"/>`;
    return baseSvg.replace('</svg>',`${overlay}</svg>`);
  }

 async function render(project,mode,colors){
  const source=normalize(project),columns=source.layout.columnCount||2,dimensionUnits=source.drawingSettings.dimensionUnits;
  const document=root.PLMRGiyotin2DDocument.buildDocument(source,{columns,dimensionUnits});
  if(mode!=='3D')return {svg:P2.toSvg(document,{showDimensions:true}),document,mode:'2D'};
  const container=window.document.createElement('div');container.style.cssText='position:fixed;left:-10000px;top:0;width:1600px;height:1000px;pointer-events:none';window.document.body.appendChild(container);
  const viewer=root.createPLMRGiyotinViewer();
  try{viewer.init(container,{});viewer.render(root.PLMRGiyotinState.drawingItems(source,{all:colors}),{columns,preserveView:false});const shot=viewer.captureFitJpeg(4200,2600,.985,{dimensionColor:0xef4444});return {svg:render3dPdfOverlay(document,shot.dataUrl,shot.width,shot.height),document,mode:'3D'};}
  finally{viewer.dispose();container.remove();}
 }
 root.PLMRGiyotinOutput={normalize,render};
})(window);
