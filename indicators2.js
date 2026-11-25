(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc;
var BAD=/nderweight|tunted|asted|Zero-dose|overdue|Low birth|MUAC|dropout|Elevated/;
var DROP=/^(Doses given: |Exposed share of children with a recorded status$|Children with a growth measurement$)/;

/* ---- remove repeated indicators from the table ---- */
function clean(){
 var t=$('#indbody table');if(!t)return;var tb=t.querySelector('tbody');if(!tb)return;var seen={};
 Array.prototype.slice.call(tb.querySelectorAll('tr')).forEach(function(r){var c=r.children;if(c.length<4)return;
  var b=c[0].querySelector('b'),n=b?b.textContent:'';
  if(DROP.test(n)||seen[n])r.remove();else seen[n]=1});
 if(!tb.querySelector('tr'))tb.innerHTML='<tr><td colspan="4" class="muted">No indicators match.</td></tr>';
 var s=$('#indsum');
 if(s){var k=tb.querySelectorAll('tr td.num').length,h=s.innerHTML.replace(/Showing <b>\d+<\/b> of \d+ indicators/,'Showing <b>'+k+'</b> indicators');if(h!==s.innerHTML)s.innerHTML=h}}

function rows(){var t=$('#indbody table');if(!t)return[];
 return Array.prototype.map.call(t.querySelectorAll('tbody tr'),function(r){var c=r.children;if(c.length<4)return null;
  var b=c[0].querySelector('b'),d=c[0].querySelector('.muted');
  return{n:b?b.textContent:'',c:d?d.textContent:'',v:c[1].textContent.trim(),d:c[2].textContent.trim(),t:c[3].textContent.trim()}}).filter(Boolean)}
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
 var b=$('#indbody');if(!b)return;clean();var card=b.closest('.card');if(!card)return;
 var csvb=card.querySelector('[data-icsv]');
 if(csvb&&!card.querySelector('[data-ipdf]'))csvb.insertAdjacentHTML('beforebegin','<button class="btn outline small" data-ipdf="1">Download PDF</button>');
 var h=$('#indchart');
 if(!h){h=document.createElement('div');h.id='indchart';h.className='card';card.parentNode.insertBefore(h,card.nextSibling)}
 var sig=b.textContent;if(h.dataset.s!==sig){h.dataset.s=sig;h.innerHTML=chartHtml()}}
var main=$('#main');if(main)new MutationObserver(sync).observe(main,{childList:true,subtree:true});

/* ---- CSV (built from the cleaned list) ---- */
function csv(){
 var q=function(x){return'"'+String(x).replace(/"/g,'""')+'"'},s=($('#indsum')||{}).textContent||'';
 var L=[['MwanaLink under-five indicators'],[s],['Generated',MWL.TODAY],[],['Category','Indicator','Value','Detail','Type']].concat(rows().map(function(r){return[r.c,r.n,r.v,r.d,r.t]}));
 var b=new Blob(['\ufeff'+L.map(function(r){return r.map(q).join(',')}).join('\r\n')],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
 a.href=URL.createObjectURL(b);a.download='MwanaLink_indicators.csv';document.body.appendChild(a);a.click();
 setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},600);MWL.audit('Indicators exported','-','CSV ('+rows().length+' indicators)')}
window.addEventListener('click',function(e){if(e.target.closest('[data-icsv]')){e.stopPropagation();e.preventDefault();csv()}},true);

/* ---- logo for the PDF ---- */
var LG=null;
function loadLogo(){return new Promise(function(res){
 if(LG)return res(LG);
 var src=window.MWL_LOGO&&window.MWL_LOGO.full;if(!src)return res(null);
 var im=new Image();
 im.onload=function(){try{
  var sc=Math.min(1,360/im.naturalWidth),w=Math.max(1,Math.round(im.naturalWidth*sc)),h=Math.max(1,Math.round(im.naturalHeight*sc)),
   c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');
  x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);
  var d=x.getImageData(0,0,w,h).data,parts=[];
  for(var i=0;i<w*h;i++)parts.push(String.fromCharCode(d[i*4],d[i*4+1],d[i*4+2]));
  LG={w:w,h:h,s:parts.join('')};res(LG)}catch(e){res(null)}};
 im.onerror=function(){res(null)};im.src=src})}

/* ---- PDF ---- */
function san(s){return String(s).replace(/[\u2212\u2013\u2014]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/\u2265/g,'>=').replace(/\u2264/g,'
