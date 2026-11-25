(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc;
var BAD=/nderweight|tunted|asted|Zero-dose|overdue|Low birth|MUAC|dropout|Elevated/;
function rows(){var t=$('#indbody table');if(!t)return[];
 return Array.prototype.map.call(t.querySelectorAll('tbody tr'),function(r){var c=r.children;if(c.length<4)return null;
  var b=c[0].querySelector('b'),d=c[0].querySelector('.muted');
  return{n:b?b.textContent:'',c:d?d.textContent:'',v:c[1].textContent.trim(),d:c[2].textContent.trim()}}).filter(Boolean)}
function pct(r){var m=/^(\d+(?:\.\d+)?)%$/.exec(r.v);return m?parseFloat(m[1]):null}

/* ---- on-screen chart ---- */
function chartHtml(){
 var R=rows().filter(function(r){return pct(r)!==null});
 if(!R.length)return'<div class="card-head"><h2>Coverage and prevalence (%)</h2></div><p class="muted">No percentage indicators in this view.</p>';
 return'<div class="card-head"><h2>Coverage and prevalence (%)</h2></div>'+R.map(function(r){
  var p=pct(r),bad=BAD.test(r.n);
  return'<div style="display:grid;grid-template-columns:minmax(120px,2fr) 3fr 58px;gap:8px;align-items:center;margin:7px 0;font-size:13px"><div>'+esc(r.n)+'</div><div style="height:12px;border-radius:6px;background:rgba(128,128,128,.25);overflow:hidden"><div style="height:100%;width:'+Math.min(100,p)+'%;background:'+(bad?'#d98c1f':'#16836e')+'"></div></div><div style="text-align:right;font-weight:700">'+esc(r.v)+'</div></div>'}).join('')+
  '<div class="muted" style="margin-top:8px">Green: coverage (higher is better). Amber: burden or gap indicators (lower is better).</div>'}
function sync(){
 var b=$('#indbody');if(!b)return;var card=b.closest('.card');if(!card)return;
 var csvb=card.querySelector('[data-icsv]');
 if(csvb&&!card.querySelector('[data-ipdf]'))csvb.insertAdjacentHTML('beforebegin','<button class="btn outline small" data-ipdf="1">Download PDF</button>');
 var h=$('#indchart');
 if(!h){h=document.createElement('div');h.id='indchart';h.className='card';card.parentNode.insertBefore(h,card.nextSibling)}
 var sig=b.textContent;if(h.dataset.s!==sig){h.dataset.s=sig;h.innerHTML=chartHtml()}}
var main=$('#main');if(main)new MutationObserver(sync).observe(main,{childList:true,subtree:true});

/* ---- PDF ---- */
function san(s){return String(s).replace(/[\u2212\u2013\u2014]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/\u2265/g,'>=').replace(/\u2264/g,'<=').replace(/\u00b7/g,'|').replace(/[^\x20-\x7e]/g,'?')}
function pe(s){return san(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')}
function wrap(s,w,sz,bold,max){var n=Math.max(8,Math.floor(w/(sz*(bold?.58:.54)))),words=san(s).split(' '),L=[],cur='';
 words.forEach(function(x){while(x.length>n){if(cur){L.push(cur);cur=''}L.push(x.slice(0,n));x=x.slice(n)}
  if((cur+' '+x).trim().length>n){L.push(cur);cur=x}else cur=(cur+' '+x).trim()});
 if(cur)L.push(cur);if(!L.length)L=[''];
 if(max&&L.length>max){L=L.slice(0,max);L[max-1]=L[max-1].slice(0,Math.max(0,n-3))+'...'}return L}
function buildPdf(){
 var W=595,H=842,M=40,pages=[],ops,y,GREEN=[22,131,110],AMB=[217,140,31],DARK=[30,30,30],GREY=[110,110,110];
 function np(){ops=[];pages.push(ops);y=M}
 function col(c){return c.map(function(v){return(v/255).toFixed(3)}).join(' ')}
 function rect(x,yy,w,h,c){ops.push(col(c)+' rg '+x.toFixed(1)+' '+(H-yy-h).toFixed(1)+' '+w.toFixed(1)+' '+h.toFixed(1)+' re f')}
 function text(x,yy,s,sz,b,c){ops.push('BT /'+(b?'F2':'F1')+' '+sz+' Tf '+col(c||DARK)+' rg '+x.toFixed(1)+' '+(H-yy-sz).toFixed(1)+' Td ('+pe(s)+') Tj ET')}
 function need(h){if(y+h>H-50)np()}
 var R=rows(),sum=($('#indsum')||{}).textContent||'',tab=$('.tabs .tab.active');
 np();rect(0,0,W,64,[11,107,88]);text(M,14,'MwanaLink',18,1,[255,255,255]);text(M,40,'Under-five indicators',10,0,[255,255,255]);y=80;
 wrap(sum,W-2*M,9,0,3).forEach(function(l){text(M,y,l,9,0,DARK);y+=12});
 text(M,y,'Category: '+(tab?tab.textContent:'All')+'   |   Generated: '+MWL.TODAY,9,0,GREY);y+=22;
 /* coverage chart */
 var P=R.filter(function(r){return pct(r)!==null});
 text(M,y,'Coverage and prevalence (%)',12,1,DARK);y+=18;
 if(!P.length){text(M,y,'No percentage indicators in this view.',9,0,GREY);y+=16}
 else{
  P.forEach(function(r){var p=pct(r),bad=BAD.test(r.n),lab=wrap(r.n,215,8,0,1)[0];need(16);
   text(M,y+1,lab,8,0,DARK);
   rect(M+225,y+1,240,9,[225,228,227]);rect(M+225,y+1,240*Math.min(100,p)/100,9,bad?AMB:GREEN);
   text(M+474,y+1,r.v,8,1,DARK);y+=15});
  need(26);y+=4;rect(M,y+2,8,8,GREEN);text(M+13,y+1,'Coverage (higher is better)',8,0,GREY);rect(M+170,y+2,8,8,AMB);text(M+183,y+1,'Burden or gap (lower is better)',8,0,GREY);y+=20}
 /* table */
 need(40);y+=6;text(M,y,'All indicators in this view',12,1,DARK);y+=20;
 var X1=M,X2=M+215,X3=M+275,W1=205,W3=W-M-X3,lastC='';
 function head(){rect(M,y,W-2*M,15,[226,239,235]);text(X1+4,y+3,'Indicator',8,1);text(X2,y+3,'Value',8,1);text(X3,y+3,'Detail',8,1);y+=18}
 head();
 R.forEach(function(r){
  var a=wrap(r.n,W1,8,1,3),d=wrap(r.d,W3,8,0,3),n=Math.max(a.length,d.length),h=n*10+6;
  if(r.c!==lastC){need(h+24);rect(M,y,W-2*M,13,[240,242,241]);text(X1+4,y+2,r.c,8,1,GREEN);y+=16;lastC=r.c}
  else if(y+h>H-50){np();head()}
  a.forEach(function(l,i){text(X1+4,y+i*10,l,8,1)});
  text(X2,y,r.v,8,1);
  d.forEach(function(l,i){text(X3,y+i*10,l,8,0,GREY)});
  y+=h;rect(M,y-3,W-2*M,0.4,[225,228,227])});
 if(!R.length)text(M,y,'No indicators match.',9,0,GREY);
 pages.forEach(function(p,i){ops=p;text(M,H-30,'MwanaLink | Demonstration data only | Page '+(i+1)+' of '+pages.length,7,0,GREY)});
 /* assemble PDF file */
 var objs=[];function add(s){objs.push(s);return objs.length}
 add('<< /Type /Catalog /Pages 2 0 R >>');add('');
 add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
 add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
 var kids=[];
 pages.forEach(function(p){var s=p.join('\n'),c=add('<< /Length '+s.length+' >>\nstream\n'+s+'\nendstream'),
  pg=add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents '+c+' 0 R >>');kids.push(pg+' 0 R')});
 objs[1]='<< /Type /Pages /Kids ['+kids.join(' ')+'] /Count '+kids.length+' >>';
 var out='%PDF-1.4\n',off=[];
 objs.forEach(function(o,i){off.push(out.length);out+=(i+1)+' 0 obj\n'+o+'\nendobj\n'});
 var xr=out.length;
 out+='xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n'+off.map(function(o){return('0000000000'+o).slice(-10)+' 00000 n \n'}).join('')+'trailer\n<< /Size '+(objs.length+1)+' /Root 1 0 R >>\nstartxref\n'+xr+'\n%%EOF';
 var u=new Uint8Array(out.length);for(var i=0;i<out.length;i++)u[i]=out.charCodeAt(i)&255;return u}
function toast(t){var r=$('#toastRoot');if(r){r.innerHTML='<div class="toast">'+esc(t)+'</div>';setTimeout(function(){r.innerHTML=''},3000)}}
document.addEventListener('click',function(e){
 if(!e.target.closest('[data-ipdf]'))return;
 try{var u=buildPdf(),b=new Blob([u],{type:'application/pdf'}),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download='MwanaLink_indicators.pdf';document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},800);
  MWL.audit('Indicators exported','-','PDF');toast('PDF downloaded.')}
 catch(x){toast('Could not create the PDF.')}});
})();
