(function(root){'use strict';
const ui=value=>root.PLMRI18n?.t(value)||value;
const LAYERS={title:'Antetler',logo:'PLMR'},TITLE_WIDTH=3100,FRAME_INSET=60,TITLE_TEXT_HEIGHT=82;
const finite=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f,clean=v=>String(v??'').trim(),display=v=>clean(v)||'—';
const LOGO_POLYLINES=[[[145.216,43.3642],[145.216,0.0],[155.2469,0.0],[155.2469,16.358],[155.4012,16.5123],[158.4877,16.5123],[158.642,16.358],[159.7222,16.358],[159.8765,16.2037],[160.3395,16.2037],[161.7284,15.5864],[162.3457,15.1234],[163.4259,13.8889],[164.0432,12.9629],[165.4321,10.1852],[165.4321,9.8765],[166.5123,7.716],[166.5123,7.4074],[167.5926,5.2469],[167.5926,4.9383],[168.2099,3.858],[168.2099,3.5494],[169.2901,1.3889],[169.2901,1.0802],[169.7531,0.3086],[169.7531,0.0],[180.4012,0.0],[180.4012,0.3086],[179.6296,1.6975],[179.6296,2.0062],[179.0123,3.0864],[179.0123,3.395],[177.3148,6.9444],[177.3148,7.2531],[176.6975,8.3333],[176.6975,8.642],[176.0802,9.7222],[176.0802,10.0308],[175.463,11.1111],[175.463,11.4197],[174.8457,12.5],[174.8457,12.8086],[173.7654,14.8148],[173.9198,15.1234],[178.7037,10.6481],[183.7963,8.0247],[184.1049,7.716],[185.4938,7.0987],[185.8025,6.7901],[188.1173,5.7099],[188.4259,5.4012],[190.1235,4.6296],[190.4321,4.321],[193.8272,2.6234],[194.1358,2.3148],[196.142,1.3889],[196.4506,1.0802],[197.8395,0.4629],[198.1481,0.1543],[199.6914,-0.6173],[200.0,-0.6173],[199.537,-0.463],[196.6049,1.5432],[196.142,1.6975],[191.9753,4.4753],[191.5123,4.6296],[189.0432,6.3271],[188.5802,6.4815],[187.3457,7.4074],[186.8827,7.5617],[184.4136,9.2592],[183.9506,9.4136],[182.2531,10.6481],[181.7901,10.8025],[178.0864,13.2716],[177.6235,13.4259],[176.3889,14.3518],[175.9259,14.5062],[173.4568,16.2037],[172.9938,16.358],[172.3765,16.9753],[171.9136,17.7469],[170.9877,18.6728],[169.9074,19.4444],[168.2099,20.216],[168.5185,20.5247],[169.1358,20.8333],[169.4444,20.8333],[171.2963,21.9136],[173.1481,23.6111],[173.9198,24.6913],[174.6914,26.2346],[174.6914,26.5432],[175.1543,27.6234],[175.1543,28.2407],[175.3086,28.395],[175.3086,29.1667],[175.463,29.321],[175.463,33.642],[175.3086,33.7963],[175.3086,34.5679],[175.1543,34.7222],[175.0,35.9568],[174.537,36.8827],[174.537,37.1913],[173.4568,39.0432],[171.7593,40.7407],[170.8333,41.358],[169.5988,41.9753],[168.8272,42.1296],[168.3642,42.4383],[167.9012,42.4383],[167.7469,42.5926],[166.6667,42.7469],[166.5123,42.9012],[165.8951,42.9012],[165.7407,43.0555],[163.5802,43.2099],[163.4259,43.3642],[145.216,43.3642]],[[155.4012,35.3395],[161.2654,35.3395],[161.4198,35.1852],[162.037,35.1852],[163.5802,34.5679],[164.8148,33.3333],[165.4321,31.7901],[165.4321,30.8642],[165.5864,30.7099],[165.5864,28.7037],[165.4321,28.5494],[165.4321,27.7778],[165.2778,27.6234],[165.1235,26.8518],[164.5062,25.7716],[163.8889,25.1543],[162.8086,24.537],[161.8827,24.3827],[161.7284,24.2284],[160.9568,24.2284],[160.8025,24.0741],[155.4012,24.0741],[155.2469,24.2284],[155.2469,35.1852],[155.4012,35.3395]],[[39.5062,43.3642],[39.5062,0.0],[67.1296,0.0],[67.1296,8.3333],[49.537,8.3333],[49.3827,8.4876],[49.3827,43.3642],[39.5062,43.3642]],[[22.6852,42.7469],[21.4506,42.9012],[21.2963,43.0555],[20.5247,43.0555],[20.3704,43.2099],[19.2901,43.2099],[19.1358,43.3642],[0.0,43.3642],[0.0,0.0],[10.0309,0.0],[10.0309,14.9691],[10.1852,15.1234],[19.2901,15.1234],[19.4444,15.2778],[20.5247,15.2778],[20.679,15.4321],[21.2963,15.4321],[21.4506,15.5864],[22.0679,15.5864],[23.3025,16.0494],[23.7654,16.0494],[26.3889,17.2839],[27.4691,18.0555],[29.0123,19.4444],[30.2469,21.142],[31.1728,22.9938],[31.1728,23.3025],[31.6358,24.3827],[31.6358,24.8457],[31.9444,25.6173],[31.9444,26.3889],[32.0988,26.5432],[32.0988,28.2407],[32.2531,28.395],[32.0988,31.9444],[31.9444,32.0987],[31.9444,32.8704],[31.7901,33.0247],[31.7901,33.4876],[31.6358,33.642],[31.6358,34.1049],[31.4815,34.2592],[31.1728,35.4938],[29.6296,38.2716],[28.7037,39.1975],[28.7037,39.3518],[27.4691,40.4321],[26.0802,41.358],[24.8457,41.9753],[24.537,41.9753],[24.0741,42.2839],[23.7654,42.2839],[22.6852,42.7469]],[[10.1852,35.3395],[17.1296,35.3395],[17.284,35.1852],[17.9012,35.1852],[19.5988,34.4136],[20.8333,33.179],[21.4506,32.0987],[21.4506,31.7901],[21.7593,31.1728],[21.7593,30.5555],[21.9136,30.4012],[21.9136,28.2407],[21.7593,28.0864],[21.7593,27.3148],[20.9877,25.4629],[19.5988,24.0741],[18.3642,23.4568],[17.4383,23.3025],[17.284,23.1481],[10.1852,23.1481],[10.0309,23.3025],[10.0309,35.1852],[10.1852,35.3395]],[[141.0494,1.0802],[139.6605,2.1605],[139.9691,2.4691],[140.7407,2.7778],[140.5864,3.395],[140.1235,4.1667],[140.1235,4.4753],[139.3519,6.0185],[139.3519,6.3271],[139.0432,6.7901],[138.7346,7.8704],[138.2716,8.642],[138.2716,8.9506],[137.963,9.4136],[137.6543,10.4938],[137.1914,11.2654],[136.8827,12.3457],[136.4198,13.1173],[136.4198,13.4259],[136.1111,13.8889],[136.1111,14.1975],[135.8025,14.6605],[135.4938,15.7407],[135.0309,16.5123],[135.0309,16.821],[134.2593,18.3642],[133.9506,19.4444],[133.4877,20.216],[133.4877,20.5247],[133.179,20.9876],[132.8704,22.0679],[132.4074,22.8395],[132.4074,23.1481],[132.0988,23.6111],[131.7901,24.6913],[130.5556,27.3148],[130.5556,27.6234],[130.2469,28.0864],[129.9383,29.1667],[128.7037,31.7901],[128.5494,32.5617],[128.0864,33.3333],[127.7778,34.4136],[126.8519,36.2654],[126.8519,36.5741],[126.5432,37.037],[126.5432,37.3457],[126.2346,37.8086],[125.9259,38.8889],[125.463,39.6605],[125.463,39.9691],[125.1543,40.4321],[124.8457,41.5123],[124.3827,42.2839],[124.3827,42.5926],[123.9198,43.3642],[123.6111,44.4444],[123.1481,45.216],[123.1481,45.5247],[122.8395,45.9876],[122.8395,46.2963],[122.5309,46.7592],[122.2222,47.8395],[121.6049,49.0741],[120.216,50.4629],[118.5185,51.0802],[116.6667,50.9259],[115.4321,50.3086],[114.1975,48.9197],[113.7346,47.9938],[113.7346,47.6852],[112.5,45.3704],[112.5,45.0617],[111.2654,42.7469],[111.2654,42.4383],[110.0309,40.1234],[110.0309,39.8148],[107.4074,34.5679],[107.4074,34.2592],[106.4815,32.5617],[106.4815,32.2531],[104.784,29.0123],[104.784,28.7037],[103.858,27.0062],[103.858,26.6975],[102.6235,24.3827],[102.6235,24.0741],[101.0802,21.142],[101.0802,20.8333],[100.463,19.5987],[100.1543,19.2901],[92.4383,29.6296],[91.6667,30.4012],[90.7407,31.0185],[90.4321,31.0185],[89.8148,31.3271],[88.1173,31.3271],[86.8827,30.8642],[85.4938,29.6296],[84.7222,28.2407],[83.179,26.0802],[83.0247,25.6173],[81.4815,23.4568],[81.3272,22.9938],[79.784,20.8333],[79.6296,20.3704],[77.4691,17.2839],[77.3148,16.821],[72.3765,9.4136],[72.2222,8.9506],[68.5185,3.395],[69.7531,2.6234],[67.9012,1.0802],[72.2222,1.0802],[74.6914,-0.6173],[76.0802,-0.6173],[89.1975,19.5987],[97.5309,8.4876],[98.4568,7.5617],[100.0,6.7901],[102.1605,6.7901],[103.2407,7.2531],[104.4753,8.3333],[104.9383,9.2592],[105.2469,9.5679],[105.2469,9.8765],[106.1728,11.5741],[106.1728,11.8827],[107.4074,14.1975],[107.4074,14.5062],[108.7963,17.1296],[108.7963,17.4383],[110.0309,19.7531],[110.0309,20.0617],[111.2654,22.3765],[111.2654,22.6852],[112.6543,25.3086],[112.6543,25.6173],[113.5802,27.3148],[113.5802,27.6234],[115.1235,30.5555],[115.1235,30.8642],[117.5926,35.9568],[117.7469,35.9568],[118.0556,35.4938],[118.0556,35.1852],[118.8272,33.642],[119.1358,32.5617],[119.5988,31.7901],[119.5988,31.4815],[119.9074,31.0185],[119.9074,30.7099],[120.216,30.2469],[120.5247,29.1667],[120.9877,28.395],[121.2963,27.3148],[121.7593,26.5432],[121.7593,26.2346],[122.5309,24.6913],[122.5309,24.3827],[122.8395,23.9197],[122.8395,23.6111],[123.1481,23.1481],[123.4568,22.0679],[123.9198,21.2963],[124.2284,20.216],[125.1543,18.3642],[125.1543,18.0555],[125.463,17.5926],[125.463,17.2839],[125.7716,16.821],[126.0802,15.7407],[126.5432,14.9691],[126.5432,14.6605],[126.8519,14.1975],[126.8519,13.8889],[127.1605,13.4259],[127.4691,12.3457],[127.9321,11.5741],[128.2407,10.4938],[129.1667,8.642],[129.1667,8.3333],[129.4753,7.8704],[129.784,6.7901],[130.2469,6.0185],[130.2469,5.7099],[130.5556,5.2469],[130.8642,4.1667],[131.3272,3.395],[131.3272,3.0864],[131.6358,2.6234],[131.6358,2.3148],[132.0988,1.5432],[132.0988,1.2346],[132.8704,-0.463],[133.9506,-0.1543],[136.5741,1.0802],[141.0494,1.0802]]];
function rect(x,y,w,h,layer){return {type:'polyline',layer,color:0,closed:true,points:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]};}
function line(x1,y1,x2,y2,layer){return {type:'polyline',layer,color:0,points:[[x1,y1],[x2,y2]]};}
function text(x,y,value,layer,height,rotation,align,extra){return {type:'text',layer,color:0,x,y,value:String(value??''),height,rotation,align,...extra};}
  function wrapWords(value,width,fontH,padX=44,widthFactor=.72){
    const raw=display(value).replace(/\r\n/g,'\n').replace(/\r/g,'\n'),usable=Math.max(1,Number(width||0)-2*Number(padX||0)),maxChars=Math.max(1,Math.floor(usable/Math.max(1,Number(fontH||1)*widthFactor))),out=[];
    raw.split('\n').forEach(paragraph=>{
      const rawWords=String(paragraph).trim().split(/\s+/).filter(Boolean),words=[];
      rawWords.forEach(word=>{
        if(word.length<=maxChars){words.push(word);return;}
        for(let i=0;i<word.length;i+=maxChars)words.push(word.slice(i,i+maxChars));
      });
      if(!words.length){out.push('');return;}
      let current='';
      words.forEach(word=>{
        if(!current)current=word;
        else if((current+' '+word).length<=maxChars)current+=' '+word;
        else{out.push(current);current=word;}
      });
      if(current)out.push(current);
    });
    return out.length?out:['—'];
  }
  function fitCellValue(value,width,baseH=TITLE_TEXT_HEIGHT,padX=44,widthFactor=.72){
    const usable=Math.max(1,Number(width||0)-2*Number(padX||0)),raw=display(value),words=raw.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split(/\s+/).filter(Boolean),longestWord=Math.max(1,...words.map(w=>w.length)),minH=14;
    const wordFit=usable/(longestWord*widthFactor),h=Math.max(minH,Math.min(baseH,wordFit)),lines=wrapWords(raw,width,h,padX,widthFactor),lineStep=h*1.22,blockH=h+Math.max(0,lines.length-1)*lineStep;
    return {h,lines,lineStep,blockH,padX,widthFactor};
  }
  function drawCellText(entities,x,y,w,rowH,plan,align='left'){
    const centerY=y+rowH/2,firstY=centerY+(plan.lines.length-1)*plan.lineStep/2,tx=align==='center'?x+w/2:align==='right'?x+w-plan.padX:x+plan.padX,cellWidth=Math.max(1,w-plan.padX*2),cellText=plan.lines.join('\n');
    plan.lines.forEach((value,index)=>{
      const ent=text(tx,firstY-index*plan.lineStep,value,LAYERS.title,plan.h,0,align,{cellWidth,cellHeight:rowH,wrapped:true,dxfPreviewLine:true});
      if(index===0){
        ent.dxfCellText=cellText;
        ent.dxfCellX=align==='center'?x+w/2:(align==='right'?x+w-plan.padX:x+plan.padX);
        ent.dxfCellY=centerY;
        ent.dxfCellWidth=cellWidth;
        ent.dxfCellHeight=rowH;
        ent.dxfAttachment=align==='center'?5:(align==='right'?6:4);
        ent.dxfLineSpacing=1.0;
      }else ent.dxfSkip=true;
      entities.push(ent);
    });
  }
  function sectionRowPlan(label,value,w,labelW=950){
    label=ui(label);
    const labelPlan=fitCellValue(label,labelW,TITLE_TEXT_HEIGHT,44,.68),valuePlan=fitCellValue(value,w-labelW,TITLE_TEXT_HEIGHT,48,.72),rowH=Math.max(166,labelPlan.blockH+108,valuePlan.blockH+108);
    return {label,value,labelW,labelPlan,valuePlan,rowH};
  }
  function sectionRow(entities,x,y,w,plan){
    const h=plan.rowH,labelW=plan.labelW;
    entities.push(rect(x,y,w,h,LAYERS.title),line(x+labelW,y,x+labelW,y+h,LAYERS.title));
    drawCellText(entities,x,y,labelW,h,plan.labelPlan,'left');
    drawCellText(entities,x+labelW,y,w-labelW,h,plan.valuePlan,'left');
  }
  function sectionHeader(entities,x,y,w,h,label){
    label=ui(label);
    const header=text(x+w/2,y+h/2,label,LAYERS.title,86,0,'center',{cellWidth:Math.max(1,w-180),cellHeight:h});
    header.dxfCellText=String(label||'');header.dxfCellX=x+w/2;header.dxfCellY=y+h/2;header.dxfCellWidth=Math.max(1,w-180);header.dxfCellHeight=h;header.dxfAttachment=5;header.dxfLineSpacing=1.0;
    entities.push(rect(x,y,w,h,LAYERS.title),header);
  }

  function titleBlockData(project){
    const p=project.projectInfo||{};
    return {
      projectRows:[['PROJE KODU',p.projectCode],['MÜŞTERİ',p.customerName],['ÜLKE',p.country],['PROJE ADI',p.projectName||p.projectCode],['REVİZYON',p.revision||'R01'],['TARİH',root.PLMRProjectDate.displayProjectDate(p.date||p.createdAt||'')],['AÇIKLAMA',p.description||'']],
      representative:p.customerRepresentative||p.customerContact||'—',designer:p.designer||p.projectRepresentative||'—'
    };
  }

  function buildLogoBlock(){
    const entities=[];
    LOGO_POLYLINES.forEach(points=>entities.push({type:'polyline',layer:LAYERS.logo,color:0,closed:true,points:points.map(p=>[p[0],p[1]])}));
    return {entities};
  }

  function signatureCellPlan(label,value,width){
    label=ui(label);
    const labelPlan=fitCellValue(label,width,56,48,.68),valuePlan=fitCellValue(value,width,62,48,.72),height=Math.max(540,70+labelPlan.blockH+70+valuePlan.blockH+70);
    return {labelPlan,valuePlan,height};
  }
  function titleBlockLayout(project){
    // V34 revised canonical PLMR title block: project identity + bottom logo/contact cells only.
    // Sürme product/detail data is intentionally kept out of the drawing title block.
    const data=titleBlockData(project),headH=176,labelW=950,projectPlans=data.projectRows.map(r=>sectionRowPlan(r[0],r[1],TITLE_WIDTH,labelW));
    const logoW=1150,signW=(TITLE_WIDTH-logoW)/2,repPlan=signatureCellPlan('MÜŞTERİ TEMSİLCİSİ',data.representative,signW),designerPlan=signatureCellPlan('PROJEYİ ÇİZEN',data.designer,signW),bottomH=Math.max(repPlan.height,designerPlan.height),topContentH=headH+projectPlans.reduce((sum,p)=>sum+p.rowH,0),requiredInnerHeight=topContentH+bottomH+180;
    return {data,headH,labelW,projectPlans,productPlan:null,logoW,signW,repPlan,designerPlan,bottomH,topContentH,requiredInnerHeight};
  }
  function drawSignatureText(entities,x,y,w,h,plan){
    const topPad=70,bottomPad=70,labelCenter=y+h-topPad-plan.labelPlan.blockH/2,valueCenter=y+bottomPad+plan.valuePlan.blockH/2;
    const drawAround=(subPlan,center)=>{
      const first=center+(subPlan.lines.length-1)*subPlan.lineStep/2,cellWidth=Math.max(1,w-96),cellText=subPlan.lines.join('\n');
      subPlan.lines.forEach((v,i)=>{
        const ent=text(x+w/2,first-i*subPlan.lineStep,v,LAYERS.title,subPlan.h,0,'center',{cellWidth,cellHeight:h,wrapped:true});
        if(i===0){ent.dxfCellText=cellText;ent.dxfCellX=x+w/2;ent.dxfCellY=center;ent.dxfCellWidth=cellWidth;ent.dxfAttachment=5;ent.dxfLineSpacing=0.75;}else ent.dxfSkip=true;
        entities.push(ent);
      });
    };
    drawAround(plan.labelPlan,labelCenter);drawAround(plan.valuePlan,valueCenter);
  }
  function buildTitleBlock(project,sheetHeight,layoutInput){
    const layout=layoutInput||titleBlockLayout(project),entities=[],x=FRAME_INSET,y=FRAME_INSET,w=TITLE_WIDTH,h=Math.max(1,sheetHeight-FRAME_INSET*2),data=layout.data,headH=layout.headH;
    entities.push(rect(x,y,w,h,LAYERS.title));
    const top=y+h;let cy=top-headH;
    sectionHeader(entities,x,cy,w,headH,'PROJE BİLGİLERİ');
    for(const plan of layout.projectPlans){cy-=plan.rowH;sectionRow(entities,x,cy,w,plan);}
    const productTable=null;

    const bottomH=layout.bottomH,logoW=layout.logoW,signX=x+logoW,signW=layout.signW;
    entities.push(line(x,y+bottomH,x+w,y+bottomH,LAYERS.title));
    entities.push(line(signX,y,signX,y+bottomH,LAYERS.title),line(signX+signW,y,signX+signW,y+bottomH,LAYERS.title));
    drawSignatureText(entities,signX,y,signW,bottomH,layout.repPlan);
    drawSignatureText(entities,signX+signW,y,signW,bottomH,layout.designerPlan);

    const logoPts=LOGO_POLYLINES.flat(),logoMinX=Math.min(...logoPts.map(p=>p[0])),logoMaxX=Math.max(...logoPts.map(p=>p[0])),logoMinY=Math.min(...logoPts.map(p=>p[1])),logoMaxY=Math.max(...logoPts.map(p=>p[1])),logoRawW=Math.max(1,logoMaxX-logoMinX),logoRawH=Math.max(1,logoMaxY-logoMinY),logoScale=Math.min(4.5,(logoW-180)/logoRawW,(bottomH-180)/logoRawH),logoX=x+logoW/2-((logoMinX+logoMaxX)/2)*logoScale,logoY=y+bottomH/2-((logoMinY+logoMaxY)/2)*logoScale;
    entities.push({type:'insert',layer:LAYERS.title,name:'PLMR - LOGO',color:0,x:logoX,y:logoY,scaleX:logoScale,scaleY:logoScale,rotation:0});
    return {entities,bounds:{minX:x,minY:y,maxX:x+w,maxY:y+h,width:w,height:h},data,productTable,layout:{bottomH,topContentH:layout.topContentH,requiredInnerHeight:layout.requiredInnerHeight},detailBlockRemoved:true};
  }


const api=Object.freeze({TITLE_WIDTH,FRAME_INSET,layout:titleBlockLayout,build:buildTitleBlock,logo:buildLogoBlock});root.PLMRV53TitleBlock=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
