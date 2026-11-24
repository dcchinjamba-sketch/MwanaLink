(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc,real=MWL.db,unscoped=false,qtype='',granted={},pend=null,stream=null,mb=null,bd=null;
var POS=['Nurse','Midwife','Medical Officer','Clinical Officer','Environmental Health Technologist','Other (specify)'];
var isStaff=function(){return document.body.classList.contains('is-staff')};
var own=function(c){return c.origin===MWL.FACILITY};
function toast(t){var r=$('#toastRoot');if(r){r.innerHTML='<div class="toast">'+esc(t)+'</div>';setTimeout(function(){r.innerHTML=''},3200)}}

/* 1. Facility scope: staff statistics cover only children registered at their facility */
var chH={get:function(t,k){if(k==='push')return function(){return t.push.apply(t,arguments)};var f=t.filter(own),v=f[k];return typeof v==='function'?v.bind(f):v}};
var view=new Proxy(real,{get:function(t,k){return k==='children'?new Proxy(t.children,chH):t[k]}});
Object.defineProperty(MWL,'db',{get:function(){return isStaff()&&!unscoped?view:real},configurable:true});
function byId(id){return real.children.filter(function(c){return c.id===id})[0]}

/* 5. Access rule: QR scan or NRC search required for staff */
function beginFind(){var q=(($('#lq')||{}).value||'').trim().toLowerCase().replace(/^mwl:/,'');
 qtype=/^\d{6}\/\d{2}\/\d$/.test(q)?'nrc':/^[0-9a-f]{24}$/.test(q)?'qr':'id';unscoped=true;setTimeout(function(){unscoped=false},0)}
function toLookup(id){var c=byId(id),n=document.querySelector('[data-page="lookup"]');if(!c||!n)return;
 toast('To open this record, verify the guardian’s NRC or scan the child’s QR code.');n.click();$('#lq').value=c.nrc;$('[data-act="find"]').click()}
function openCard(id){var b=document.createElement('button');b.setAttribute('data-open',id);b.style.display='none';document.body.appendChild(b);b.click();b.remove()}
window.addEventListener('click',function(e){
 var t;
 if(isStaff()){
  if(e.target.closest('[data-act="find"]'))beginFind();
  else if(e.target.closest('[data-act="register"]')){var b=real.children.map(function(c){return c.id});setTimeout(function(){real.children.forEach(function(c){if(b.indexOf(c.id)<0)granted[c.id]=1})},0)}
  else if((t=e.target.closest('[data-open]'))&&!granted[t.getAttribute('data-open')]){e.stopPropagation();e.preventDefault();toLookup(t.getAttribute('data-open'));return}
  else if((t=e.target.closest('[data-verify]'))){var ck=$('#vf');if(ck&&ck.checked){if(qtype==='nrc'||qtype==='qr')granted[t.getAttribute('data-verify')]=1;else{e.stopPropagation();e.preventDefault();toast('To open this record, search with the guardian’s NRC or scan the child’s QR code.');return}}}
 }
 if((t=e.target.closest('[data-sact="addstaff"]'))){pend=null;var p=$('#spos'),er=$('#saerr');
  if(p){var v=p.value;
   if(!v){e.stopPropagation();e.preventDefault();if(er)er.textContent='Select the staff member’s position.';return}
   if(v==='Other (specify)'){v=($('#spoth').value||'').trim();if(v.length<3){e.stopPropagation();e.preventDefault();if(er)er.textContent='Type the staff member’s position.';return}}
   pend={username:($('#su').value||'').trim().toLowerCase(),pos:v}}}
 if(e.target.closest('[data-scan]'))scan();
 else if(e.target.closest('[data-sstop]'))stopScan()},true);
window.addEventListener('keydown',function(e){if(isStaff()&&e.key==='Enter'&&e.target.id==='lq')beginFind()},true);
document.addEventListener('change',function(e){if(e.target.id==='spos'){var w=$('#sposw');if(w)w.classList.toggle('hidden',e.target.value!=='Other (specify)')}});

/* 3. Position: stored on the account and shown beside the name */
var tries=0,iv=setInterval(function(){tries++;if(real.users&&real.users.length){clearInterval(iv);var ch=false;
  Object.defineProperty(real.users,'push',{value:function(u){if(pend&&u.username===pend.username){u.position=pend.pos;pend=null}return Array.prototype.push.call(this,u)},enumerable:false,configurable:true,writable:true});
  real.users.forEach(function(u){if(!u.position){u.position=u.role==='super'?'System Administrator':'Nurse';ch=true}});if(ch)MWL.save()}
 else if(tries>60)clearInterval(iv)},100);
function applyPos(){var s=null;try{s=JSON.parse(sessionStorage.getItem('mwl_sess_v1'))}catch(e){}
 var u=s&&s.u&&(real.users||[]).filter(function(x){return x.id===s.u})[0];if(!u||!u.position)return;
 MWL.STAFF=u.name+' ('+u.position+')';var c=$('#uchip');if(c)c.innerHTML='<b>'+esc(MWL.STAFF)+'</b>'+esc(u.facility)+(u.role==='super'?' · Super user':'')}
new MutationObserver(function(){if($('#uchip')&&MWL.STAFF.indexOf('(')<0)applyPos()}).observe($('.top-right'),{childList:true});

/* 4. QR scanning */
try{if('BarcodeDetector' in window)bd=new BarcodeDetector({formats:['qr_code']})}catch(e){}
function stopScan(){if(stream){stream.getTracks().forEach(function(t){t.stop()});stream=null}if(mb){mb.remove();mb=null}}
function handle(code){var m=/^mwl:([0-9a-f]{24})$/.exec((code||'').trim().toLowerCase()),c=m&&real.children.filter(function(x){return x.token===m[1]})[0];
 if(!c){toast('This is not a recognised MwanaLink QR code.');return}
 granted[c.id]=1;MWL.audit('Record retrieved',c.id,'Opened by QR scan');openCard(c.id)}
async function scan(){
 mb=document.createElement('div');mb.className='mback';
 mb.innerHTML='<div class="mbox" role="dialog" aria-modal="true"><h2>Scan QR code</h2><video id="sv" playsinline muted style="width:100%;border-radius:10px;background:#000;max-height:55vh"></video><p class="sub" id="ss">Point the camera at the child’s QR code.</p><button class="btn outline" data-sstop="1">Cancel</button></div>';
 document.body.appendChild(mb);var v=$('#sv'),ss=$('#ss');
 if(!bd&&!window.jsQR){ss.textContent='QR scanning is not available in this browser. Search with the guardian’s NRC instead.';return}
 try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});v.srcObject=stream;await v.play()}
 catch(e){ss.textContent='The camera is unavailable or permission was denied. Search with the guardian’s NRC instead.';return}
 var cv=document.createElement('canvas'),cx=cv.getContext('2d',{willReadFrequently:true});
 (async function tick(){if(!stream)return;var code=null;
  if(v.readyState>=2){try{if(bd){var r=await bd.detect(v);if(r[0])code=r[0].rawValue}else{cv.width=v.videoWidth;cv.height=v.videoHeight;cx.drawImage(v,0,0);var im=cx.getImageData(0,0,cv.width,cv.height),q=window.jsQR(im.data,im.width,im.height);if(q)code=q.data}}catch(e){}}
  if(code){stopScan();handle(code);return}setTimeout(tick,200)})()}

/* Page patches */
function fix(){var m=$('#main');if(!m)return;
 var cm=m.querySelector('#comm');if(cm&&!cm.querySelector('option[value="WhatsApp"]')){var cur=cm.value;cm.innerHTML=['SMS','Phone call','WhatsApp','Any method'].map(function(o){return'<option'+(o===cur?' selected':'')+'>'+o+'</option>'}).join('')}
 var sn=m.querySelector('#sn');if(sn&&!m.querySelector('#spos'))sn.closest('.field').insertAdjacentHTML('afterend','<div class="field"><label for="spos">Position</label><select id="spos"><option value="">Select position</option>'+POS.map(function(p){return'<option>'+p+'</option>'}).join('')+'</select></div><div class="field hidden" id="sposw"><label for="spoth">Specify position</label><input id="spoth" maxlength="40" autocomplete="off"></div>');
 m.querySelectorAll('table').forEach(function(t){var h=t.querySelector('thead tr');if(!h||t.dataset.pos||h.textContent.indexOf('Username')<0)return;t.dataset.pos=1;var th=document.createElement('th');th.textContent='Position';h.insertBefore(th,h.children[2]);
  t.querySelectorAll('tbody tr').forEach(function(r){var u=(real.users||[]).filter(function(x){return x.username===r.children[1].textContent})[0],td=document.createElement('td');td.textContent=u&&u.position||'–';r.insertBefore(td,r.children[2])})});
 var h1=m.querySelector('h1'),st=m.querySelector('.stats');
 if(h1&&h1.textContent==='Dashboard'&&st&&!m.querySelector('#scanCard')&&(isStaff()||document.body.classList.contains('is-super')))
  st.insertAdjacentHTML('afterend','<div class="card" id="scanCard"><div class="card-head"><h2>Scan QR code for Smart Underfive</h2></div><p>Scan the child’s QR code to open the record directly and record services.'+(isStaff()?' If the QR code is not available, search with the guardian’s NRC. The figures above cover children registered at '+esc(MWL.FACILITY)+'; you can serve any child in the system once you scan or verify them.':' As super user you can open any record.')+'</p><button class="btn primary" data-scan="1">Scan QR code</button> <button class="btn outline" data-page="lookup">Search with NRC</button></div>');
 var w=m.querySelector('#pwrap');
 if(w&&!w.querySelector('#pqr')&&window.QRCode){var tabs=w.querySelector('.tabs'),meta=w.querySelector('.profile-meta'),act=w.querySelector('.tab.active');
  if(tabs&&meta&&act&&act.getAttribute('data-ptab')==='overview'){var r=/MWL-[A-Z0-9]+/.exec(meta.textContent),c=r&&byId(r[0]);
   if(c){tabs.insertAdjacentHTML('beforebegin','<div class="gcard" id="pqr" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:6px"><div class="qrwrap" id="pqrc"></div><div style="flex:1;min-width:200px"><b>Your child’s QR code</b><p>Show this QR code at the health facility so the health worker can open '+esc(c.name)+'’s record. Keep it private.</p></div></div>');new QRCode(w.querySelector('#pqrc'),{text:'mwl:'+c.token,width:140,height:140})}}}}
new MutationObserver(fix).observe($('#main'),{childList:true,subtree:true});
})();
