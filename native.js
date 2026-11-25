(function(){
var $=function(s){return document.querySelector(s)};
var NATIVE=!!(window.Capacitor&&typeof window.Capacitor.isNativePlatform==='function'&&window.Capacitor.isNativePlatform());
function toast(t){var r=$('#toastRoot');if(r){r.innerHTML='<div class="toast">'+t+'</div>';setTimeout(function(){r.innerHTML=''},2200)}}
var ov=null;
function authed(){return document.body.classList.contains('authed')}

/* ---- Reports open on an in-app page with a Back button (Android app only) ---- */
function showRep(h){
 if(ov){ov.remove();ov=null}
 ov=document.createElement('div');ov.id='repOv';
 ov.style.cssText='position:fixed;left:0;top:0;right:0;bottom:0;z-index:9999;background:#fff;display:flex;flex-direction:column';
 var bs='border:1px solid #fff;background:transparent;color:#fff;border-radius:8px;padding:8px 14px;font-weight:700;font-size:14px';
 ov.innerHTML='<div style="display:flex;gap:10px;align-items:center;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 10px;background:#0b6b58;color:#fff"><button type="button" id="repBack" style="'+bs+'">\u2190 Back</button><b style="flex:1;font-size:15px">Report</b><button type="button" id="repPrint" style="'+bs+'">Print</button></div><iframe id="repFrame" style="flex:1;border:0;width:100%;background:#fff;margin-bottom:env(safe-area-inset-bottom,0px)"></iframe>';
 document.body.appendChild(ov);
 $('#repFrame').srcdoc=h;
 history.pushState({mwlrep:1},'');
}
function fakeWin(){
 var buf=[];
 var d={open:function(){buf=[]},write:function(h){buf.push(h)},writeln:function(h){buf.push(h)},close:function(){showRep(buf.join(''))}};
 return {document:d,focus:function(){},print:function(){},close:function(){if(ov)history.back()}};
}
if(NATIVE){
 var oo=window.open;
 window.open=function(u){if(u&&String(u).length>0)return oo.apply(window,arguments);return fakeWin()};
}
document.addEventListener('click',function(e){
 if(e.target.closest('#repBack')){if(ov)history.back()}
 else if(e.target.closest('#repPrint')){try{var f=$('#repFrame');f.contentWindow.focus();f.contentWindow.print()}catch(x){toast('Printing is not available here. Use Download report.')}}
});

/* ---- Android back button ---- */
function activePage(){var b=document.querySelector('#mnav .nav.active[data-page],#sidenav .nav.active[data-page]');return b&&b.getAttribute('data-page')}
function go(p){var b=document.querySelector('#mnav [data-page="'+p+'"],#sidenav [data-page="'+p+'"]');if(b)b.click()}
function ensure(){if(!(history.state&&(history.state.mwlapp||history.state.mwlrep)))history.pushState({mwlapp:1},'')}
if(NATIVE){
 try{history.replaceState({mwlbase:1},'');history.pushState({mwlapp:1},'')}catch(e){}
 document.addEventListener('click',ensure,true);
 window.addEventListener('popstate',function(){
  if(ov){ov.remove();ov=null;return}
  if(!authed())return;
  if(document.body.classList.contains('is-guardian')){toast('Press back again to exit');return}
  var a=activePage();
  if(a&&a!=='dashboard'){go('dashboard');ensure();return}
  toast('Press back again to exit');
 });
}

/* ---- Swipe between pages ---- */
var sx=0,sy=0,t0=0,ok=false;
function hscroll(el){while(el&&el!==document.body){var c=getComputedStyle(el);if(/(auto|scroll)/.test(c.overflowX)&&el.scrollWidth>el.clientWidth+2)return true;el=el.parentElement}return false}
function step(dir){
 var m=$('#mnav'),box=(m&&m.offsetParent!==null)?m:$('#sidenav');if(!box)return;
 var L=Array.prototype.slice.call(box.querySelectorAll('.nav')).filter(function(b){return b.offsetParent!==null});
 var i=-1;L.forEach(function(b,k){if(b.classList.contains('active'))i=k});
 if(i<0||!L[i+dir])return;
 L[i+dir].click();window.scrollTo(0,0);
}
document.addEventListener('touchstart',function(e){
 ok=false;if(e.touches.length!==1||!authed()||ov)return;
 var t=e.target;if(!t.closest||t.closest('input,select,textarea,canvas,svg,.mback,[data-noswipe]')||hscroll(t))return;
 sx=e.touches[0].clientX;sy=e.touches[0].clientY;t0=Date.now();ok=true;
},{passive:true});
document.addEventListener('touchend',function(e){
 if(!ok)return;ok=false;
 var c=e.changedTouches[0],dx=c.clientX-sx,dy=c.clientY-sy;
 if(Date.now()-t0>700||Math.abs(dx)<90||Math.abs(dy)>Math.abs(dx)*0.5)return;
 step(dx>0?1:-1);
},{passive:true});

/* ---- Short notes on Find a child and Child records ---- */
function hint(){
 var m=$('#main');if(!m||!authed())return;
 var p=activePage(),w=m.querySelector('.welcome');if(!w)return;
 if(p==='lookup'&&!m.querySelector('#hintL'))w.insertAdjacentHTML('afterend','<div class="notice" id="hintL">Search any registered child by NRC, QR code or ID, in any facility or district.</div>');
 else if(p==='records'&&!document.body.classList.contains('is-super')&&!m.querySelector('#hintR'))w.insertAdjacentHTML('afterend','<div class="notice" id="hintR">Shows children registered in your facility or jurisdiction. To open any other registered child, use Find a child.</div>');
}
var mm=$('#main');if(mm)new MutationObserver(hint).observe(mm,{childList:true});
})();
