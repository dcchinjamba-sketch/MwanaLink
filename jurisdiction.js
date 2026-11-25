(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc,real=MWL.db,old=Object.getOwnPropertyDescriptor(MWL,'db'),pend=null,pendE=null,cache={k:'',v:null},free=false;
var st=document.createElement('style');st.textContent='body.is-admin [data-page="register"]{display:none!important}';document.head.appendChild(st);
/* Write text only when it differs, otherwise the page observer loops forever. */
function setT(el,t){if(el&&el.textContent!==t)el.textContent=t}
function setO(o,t){if(o&&o.text!==t)o.text=t}
function toast(t){var r=$('#toastRoot');if(r){r.innerHTML='<div class="toast">'+esc(t)+'</div>';setTimeout(function(){r.innerHTML=''},3200)}}
function admin(){return document.body.classList.contains('is-admin')}
function sup(){return document.body.classList.contains('is-superuser')}
function meU(){try{var s=JSON.parse(sessionStorage.getItem('mwl_sess_v1'));return s&&s.u&&(real.users||[]).filter(function(x){return x.id===s.u})[0]}catch(e){return null}}
function label(sc){return !sc||!sc.province?'Not assigned':sc.district?sc.district+' District, '+sc.province+' Province':sc.province+' Province (all districts)'}
function scope(){if(!admin())return null;var u=meU();if(!u)return{u:null,sc:{province:'',district:''},names:[]};
 var sc=u.scope||{province:'',district:''},k=u.id+JSON.stringify(sc)+real.facilities.length;
 if(cache.k!==k){cache.k=k;cache.v={u:u,sc:sc,names:real.facilities.filter(function(f){return sc.province&&f.province===sc.province&&(!sc.district||f.district===sc.district)}).map(function(f){return f.name})}}
 return cache.v}
function isIn(n){var s=scope();return !!s&&s.names.indexOf(n)>-1}
/* ---- Statistics view: lists, dashboard, reports, accounts and audit are limited to the jurisdiction ---- */
var W=['push','unshift','splice','pop','shift'];
function arr(t,keep){return new Proxy(t,{get:function(a,k){if(typeof k==='string'&&W.indexOf(k)>-1)return a[k].bind(a);var f=a.filter(keep),v=f[k];return typeof v==='function'?v.bind(f):v}})}
function view(){var s=scope(),nm=s.u?s.u.name:'';
 return new Proxy(real,{get:function(t,k){
  if(k==='children')return arr(t.children,function(c){return isIn(c.origin)});
  if(k==='audit')return arr(t.audit,function(a){return isIn(a.facility)||String(a.by).indexOf(nm)===0});
  if(k==='users')return arr(t.users,function(x){return(s.u&&x.id===s.u.id)||(x.role==='staff'&&isIn(x.facility))});
  if(k==='referrals'&&t.referrals)return arr(t.referrals,function(r){return isIn(r.from)||isIn(r.to)});
  if(k==='facilities')return arr(t.facilities,function(f){return isIn(f.name)});
  return t[k]},
  set:function(t,k,v){if(k==='children'){t.children=t.children.filter(function(c){return !isIn(c.origin)}).concat(Array.prototype.slice.call(v));return true}t[k]=v;return true}})}
Object.defineProperty(MWL,'db',{get:function(){var v=old.get.call(MWL);return(v===real&&!free&&admin()&&scope())?view():v},configurable:true});
/* Searching by NRC, QR token or ID reaches every registered child, in any jurisdiction. */
function lift(){free=true;setTimeout(function(){free=false},0)}
window.addEventListener('click',function(e){if(admin()&&e.target.closest('[data-act="find"]'))lift()},true);
window.addEventListener('keydown',function(e){if(admin()&&e.key==='Enter'&&e.target.id==='lq')lift()},true);
/* Monthly report: for admins, count only doses given at facilities inside the jurisdiction */
var oAll=MWL.all;
MWL.all=function(){var s=scope();if(!s)return oAll?oAll():real.children;
 return real.children.filter(function(c){return c.imm.some(function(i){return !i.void&&s.names.indexOf(i.facility)>-1})}).map(function(c){return Object.assign({},c,{imm:c.imm.filter(function(i){return s.names.indexOf(i.facility)>-1})})})};
/* ---- Account hooks: store jurisdiction on admin accounts; migrate the demo admin ---- */
var tries=0,iv=setInterval(function(){tries++;var U=real.users;
 if(U&&Object.prototype.hasOwnProperty.call(U,'push')&&!Object.prototype.hasOwnProperty.call(U,'__j')){clearInterval(iv);Object.defineProperty(U,'__j',{value:1,enumerable:false});
  var ch=false;U.forEach(function(u){if(u.role==='admin'&&!u.scope&&u.username==='admin'){u.scope={province:'Lusaka',district:''};ch=true}});if(ch)MWL.save();
  var p0=U.push;Object.defineProperty(U,'push',{value:function(u){
   if(pend&&u&&u.role==='admin'&&u.username===pend.u){u.scope={province:pend.p,district:pend.d};var l=label(u.scope),n=u.username;pend=null;setTimeout(function(){MWL.audit('Admin jurisdiction set','-',n+' → '+l)},0)}
   return p0.call(this,u)},enumerable:false,configurable:true,writable:true})}
 else if(tries>60)clearInterval(iv)},100);
/* ---- Click guards (capture phase) ---- */
window.addEventListener('click',function(e){var t,stop=function(){e.stopPropagation();e.preventDefault()};
 if(e.target.closest('[data-sact="addstaff"]')){pend=null;var un=(($('#su')||{}).value||'').trim().toLowerCase(),er=$('#saerr'),r=$('#srole');
  if(un&&real.users.some(function(x){return x.username===un})){stop();if(er)er.textContent='This username is already taken.';return}
  if(sup()&&r&&r.value==='admin'){var P=$('#sprov');if(!P||!P.value){stop();if(er)er.textContent='Choose the province for this admin’s jurisdiction.';return}pend={u:un,p:P.value,d:($('#sdist')||{}).value||''}}}
 else if((t=e.target.closest('[data-esave]'))){var m=$('#eMod');if(!m)return;pendE=null;var id=t.getAttribute('data-esave'),un2=((m.querySelector('#eUser')||{}).value||'').trim().toLowerCase(),er2=m.querySelector('#eErr');
  if(un2&&real.users.some(function(x){return x.id!==id&&x.username===un2})){stop();er2.textContent='This username is already taken.';return}
  var r2=m.querySelector('#eRole'),role=r2?r2.value:m.dataset.role;
  if(sup()&&role==='admin'&&m.querySelector('#eprov')){var pv=m.querySelector('#eprov').value;if(!pv){stop();er2.textContent='Choose the province for this admin’s jurisdiction.';return}
   var u=real.users.filter(function(x){return x.id===id})[0],prev=(u&&u.scope)||{province:'',district:''},d=m.querySelector('#edist').value||'';
   pendE={id:id,p:pv,d:d,changed:prev.province!==pv||(prev.district||'')!==d}}}},true);
/* After the existing account-save runs, apply the jurisdiction change */
document.addEventListener('click',function(e){if(!e.target.closest('[data-esave]')||!pendE)return;
 var u=real.users.filter(function(x){return x.id===pendE.id})[0];if(!u){pendE=null;return}
 var m=$('#eMod'),er=m&&m.querySelector('#eErr'),done=!m||(er&&er.textContent==='No changes made.'&&pendE.changed);if(!done)return;
 if(pendE.changed){u.scope={province:pendE.p,district:pendE.d};MWL.save();MWL.audit('Admin jurisdiction set','-',u.username+' → '+label(u.scope))}
 if(m){m.remove();toast('Jurisdiction updated.')}pendE=null;var b=$('[data-sa="staff"]');if(b)b.click()});
/* ---- UI patches (all idempotent: nothing is rewritten unless it changed) ---- */
var ALL='All districts in this province (province-level)',DOPT='District (optional: leave blank for province-level)';
function adminCreateUI(){if(!sup())return;var r=$('#srole'),g1=$('#sgeo1'),g2=$('#sgeo2'),sf=$('#sf');if(!r||!g1||!g2||!sf)return;var a=r.value==='admin';
 if(a){g1.classList.remove('hidden');g2.classList.remove('hidden');sf.closest('.field').classList.add('hidden');
  setT(g1.querySelector('label'),'Province (jurisdiction)');setT(g2.querySelector('label'),DOPT);
  var d=$('#sdist');if(d&&!d.disabled&&d.options.length&&d.options[0].value==='')setO(d.options[0],ALL)}
 else{setT(g1.querySelector('label'),'Province');setT(g2.querySelector('label'),'District')}}
function adminEditUI(){var m=$('#eMod');if(!m||!sup()||!m.querySelector('#eprov'))return;var r=m.querySelector('#eRole'),role=r?r.value:m.dataset.role,fld=m.querySelector('#eFac').closest('.field');
 if(role!=='admin'){fld.classList.remove('hidden');return}
 m.querySelector('#egeo1').classList.remove('hidden');m.querySelector('#egeo2').classList.remove('hidden');fld.classList.add('hidden');
 setT(m.querySelector('#egeo1 label'),'Province (jurisdiction)');setT(m.querySelector('#egeo2 label'),DOPT);
 var D=m.querySelector('#edist');if(D&&!D.disabled&&D.options.length&&D.options[0].value==='')setO(D.options[0],ALL);
 if(!m.dataset.sc){m.dataset.sc='1';var sv=m.querySelector('[data-esave]'),u=real.users.filter(function(x){return x.id===sv.getAttribute('data-esave')})[0],sc=(u&&u.scope)||{province:'',district:''},P=m.querySelector('#eprov');
  P.value=sc.province;P.dispatchEvent(new Event('change',{bubbles:true}));D=m.querySelector('#edist');D.value=sc.district||''}}
function restrict(){var s=scope();if(!s)return;
 [['sprov','sdist'],['eprov','edist']].forEach(function(p){var P=$('#'+p[0]),D=$('#'+p[1]);if(!P)return;
  Array.prototype.slice.call(P.options).forEach(function(o){if(o.value!==''&&o.text!==s.sc.province)o.remove()});
  if(s.sc.province&&P.value!==s.sc.province&&P.options.length>1){P.value=s.sc.province;P.dispatchEvent(new Event('change',{bubbles:true}))}
  if(D&&s.sc.district){Array.prototype.slice.call(D.options).forEach(function(o){if(o.value!==''&&o.text!==s.sc.district)o.remove()});
   if(D.value!==s.sc.district&&D.options.length>1){D.value=s.sc.district;D.dispatchEvent(new Event('change',{bubbles:true}))}}})}
function jbar(m){var w=m.querySelector('.welcome'),s=scope();if(!w||m.querySelector('#jbar'))return;
 w.insertAdjacentHTML('afterend','<div class="notice" id="jbar">'+(s.sc.province?'<b>Your jurisdiction:</b> '+esc(label(s.sc))+'. The dashboard, child lists, reports, staff accounts and audit trail are limited to '+s.names.length+' facilit'+(s.names.length===1?'y':'ies')+'. You can still find any registered child with <b>Find a child</b> (NRC or QR code).':'<b>No jurisdiction assigned.</b> Ask a super user to assign a province or district to this admin account.')+'</div>')}
function rep(m){var s=scope(),n=m.querySelector('#heiCard .notice');if(n&&n.textContent.indexOf('all facilities')>-1)n.innerHTML=n.innerHTML.replace('all facilities','your jurisdiction ('+esc(label(s.sc))+')')}
function tbl(){var m=$('#main');if(!m||!(sup()||admin()))return;
 m.querySelectorAll('table').forEach(function(t){var h=t.querySelector('thead tr');if(!h||t.dataset.jt||h.textContent.indexOf('Username')<0)return;t.dataset.jt='1';
  t.querySelectorAll('tbody tr').forEach(function(r){var un=r.children[1]&&r.children[1].textContent,u=real.users.filter(function(x){return x.username===un})[0];
   if(u&&u.role==='admin')Array.prototype.forEach.call(r.children,function(td){if(td.textContent.trim()==='System Administration')td.innerHTML='<b>Jurisdiction:</b> '+esc(label(u.scope))})})})}
new MutationObserver(function(){var m=$('#main');if(admin()&&m){jbar(m);rep(m)}restrict();adminCreateUI();adminEditUI();tbl()}).observe(document.body,{childList:true,subtree:true});
document.addEventListener('change',function(e){var i=e.target.id;if(i==='srole'||i==='sprov')adminCreateUI();else if(i==='eRole'||i==='eprov')adminEditUI()});
})();
