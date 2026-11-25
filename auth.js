(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc,me=null,fails={},SK='mwl_sess_v1',aq='',aact='';
var RL={staff:'Health worker',admin:'Admin',super:'Super user'};
function isAdm(){return !!me&&(me.role==='admin'||me.role==='super')}
function isSup(){return !!me&&me.role==='super'}
function meId(){return me&&me.id}
function rnd(n){var a=crypto.getRandomValues(new Uint8Array(n));return Array.prototype.map.call(a,function(b){return('0'+b.toString(16)).slice(-2)}).join('')}
async function hash(pw,salt){var te=new TextEncoder(),k=await crypto.subtle.importKey('raw',te.encode(pw),'PBKDF2',false,['deriveBits']),b=await crypto.subtle.deriveBits({name:'PBKDF2',salt:te.encode(salt),iterations:100000,hash:'SHA-256'},k,256);return Array.prototype.map.call(new Uint8Array(b),function(x){return('0'+x.toString(16)).slice(-2)}).join('')}
async function mkUser(name,username,pw,role,facility,position){var salt=rnd(16);return{id:'USR-'+rnd(3).toUpperCase(),name:name,username:username,salt:salt,hash:await hash(pw,salt),role:role,facility:facility,position:position||'',active:true,created:new Date().toISOString()}}
function sysLog(action,detail,by,fac){MWL.db.audit.unshift({time:new Date().toISOString(),by:by||(me?me.name:'System'),facility:fac||(me?me.facility:'-'),action:action,childId:'-',detail:detail});MWL.save()}
function toast(t){var r=$('#toastRoot');r.innerHTML='<div class="toast">'+esc(t)+'</div>';setTimeout(function(){r.innerHTML=''},3000)}
function val(id){var e=$('#'+id);return e?e.value.trim():''}
MWL.audit=function(a,id,d){MWL.db.audit.unshift({time:new Date().toISOString(),by:MWL.STAFF,facility:MWL.FACILITY,action:a,childId:id,detail:d});MWL.save()};
var om=MWL.makeChild;MWL.makeChild=function(){var c=om.apply(MWL,arguments);c.origin=MWL.FACILITY;c.lastFacility=MWL.FACILITY;return c};
async function init(){var d=MWL.db,ch=false;
 if(!d.facilities){d.facilities=[{id:'FAC-001',name:'Demo Health Centre',district:'Lusaka',province:'Lusaka'}];ch=true}
 if(!d.users){d.users=[await mkUser('Demo Admin','admin','MwanaLink#2026','admin','System Administration','Administrator'),await mkUser('Demo Super User','superuser','SuperUser#2026','super','System Administration','Super User'),await mkUser('Demo Health Worker','nurse1','Staff#2026','staff','Demo Health Centre','Nurse')];d.roleMig=1;ch=true}
 else if(!d.roleMig){
  d.users.forEach(function(u){if(u.role==='super'){u.role='admin';u.position='Administrator';if(u.username==='superadmin'&&!d.users.some(function(x){return x.username==='admin'})){u.username='admin';u.name='Demo Admin'}}});
  if(!d.users.some(function(x){return x.username==='superuser'}))d.users.push(await mkUser('Demo Super User','superuser','SuperUser#2026','super','System Administration','Super User'));
  d.roleMig=1;ch=true}
 if(ch)MWL.save()}

/* ---------- Sign-in screen ---------- */
function overlay(){var o=document.createElement('div');o.id='authOv';
 o.innerHTML='<div class="acard"><div class="brand"><div class="logo">✚</div><div>MwanaLink<small>Every child. One connected health record.</small></div></div><div class="atabs"><button class="active" data-atab="staff">Staff sign-in</button><button data-atab="guardian">Parent / guardian</button></div>'+
 '<div id="pStaff"><div class="field"><label for="au">Username</label><input id="au" autocomplete="username" autocapitalize="none"></div><div class="field"><label for="ap">Password</label><input id="ap" type="password" autocomplete="current-password"></div><div class="ierr" id="aerr" role="alert"></div><button class="btn primary" id="aln" style="width:100%;justify-content:center">Sign in</button><div class="notice">Demo accounts (demonstration only).<br>Super user: <b>superuser</b> / SuperUser#2026<br>Admin: <b>admin</b> / MwanaLink#2026<br>Health worker: <b>nurse1</b> / Staff#2026</div></div>'+
 '<div id="pGuard" class="hidden"><p class="sub">View your children’s health records. This is read-only.</p><button class="btn primary" id="agd" style="width:100%;justify-content:center">Continue as parent / guardian</button></div></div>';
 document.body.appendChild(o);$('.layout').setAttribute('inert','')}
function closeOv(){var o=$('#authOv');if(o)o.remove();$('.layout').removeAttribute('inert')}
async function login(){var u=$('#au').value.trim().toLowerCase().slice(0,30),p=$('#ap').value,e=$('#aerr'),f=fails[u]||{n:0,t:0};
 if(f.n>=5&&Date.now()-f.t<60000){e.textContent='Too many attempts. Wait a minute and try again.';return}
 var usr=MWL.db.users.filter(function(x){return x.username===u})[0],ok=false;
 if(usr&&usr.active)ok=(await hash(p,usr.salt))===usr.hash;
 if(!ok){fails[u]={n:f.n+1,t:Date.now()};sysLog('Failed sign-in','Username entered: '+u,'Unknown','-');e.textContent=usr&&!usr.active?'This account is deactivated. Contact the administrator.':'Incorrect username or password.';return}
 delete fails[u];enter(usr,false)}
function chip(label,role){var tr=$('.top-right');if(!tr||$('#uchip'))return;
 var c=document.createElement('div');c.className='uchip';c.id='uchip';c.innerHTML='<b>'+esc(label)+'</b>'+esc(role);tr.insertBefore(c,$('#themeBtn'));
 var b=document.createElement('button');b.className='themebtn';b.id='outBtn';b.type='button';b.textContent='Sign out';tr.appendChild(b)}
function enter(u,restore){me=u;MWL.STAFF=u.name;MWL.FACILITY=u.facility;
 var cl=document.body.classList;cl.remove('is-super','is-staff','is-admin','is-superuser','is-guardian');cl.add('authed',u.role==='staff'?'is-staff':'is-super');
 if(u.role==='admin')cl.add('is-admin');if(u.role==='super')cl.add('is-superuser');
 try{sessionStorage.setItem(SK,JSON.stringify({u:u.id}))}catch(e){}
 if(!restore)sysLog('Sign in',RL[u.role]);
 chip(u.name+' · '+u.facility,RL[u.role]);closeOv();navFix();
 var n=$('[data-page="dashboard"]');if(n)n.click()}
function guardian(){document.body.classList.add('authed','is-guardian');try{sessionStorage.setItem(SK,JSON.stringify({g:1}))}catch(e){}
 chip('Parent / guardian','Read-only');closeOv();var r=$('[data-role="parent"]');if(r)r.click()}
function signout(){if(me)sysLog('Sign out','');try{sessionStorage.removeItem(SK)}catch(e){}location.reload()}

/* ---------- Navigation and page fixes ---------- */
function navFix(){['#sidenav','#mnav'].forEach(function(sel){var n=$(sel);if(!n||!me)return;
 if(me.role==='staff'){var a=n.querySelector('[data-page="audit"]');if(a)a.remove();return}
 if(n.querySelector('[data-sa]'))return;var side=sel==='#sidenav',g=[['Admin',[['staff','Staff accounts','☻']]]];
 if(me.role==='super')g.push(['Super user',[['ind','Indicators','◈'],['fac','Facilities','⌂']]]);
 n.insertAdjacentHTML('beforeend',g.map(function(x){return(side?'<div class="side-label" style="margin-top:18px">'+x[0]+'</div>':'')+x[1].map(function(s){return'<button class="nav" data-sa="'+s[0]+'">'+(side?'<span class="ico">'+s[2]+'</span> ':'')+s[1]+'</button>'}).join('')}).join(''))})}
function mainFix(){var m=$('#main');if(!m||!me)return;var adm=isAdm();
 if(!adm){m.querySelectorAll('.tab[data-tab="hist"]').forEach(function(x){x.remove()});m.querySelectorAll('.card').forEach(function(c){var h=c.querySelector('h2');if(h&&h.textContent==='Recent record activity')c.remove()})}
 var pa=m.querySelector('.profile-actions');if(adm&&pa&&pa.querySelector('[data-back]')&&!pa.querySelector('[data-sadel]'))pa.insertAdjacentHTML('beforeend','<button class="btn danger small" data-sadel="1">Delete record</button>');
 if(!m.querySelector('#auditwrap'))m.querySelectorAll('.card').forEach(function(c){var h=c.querySelector('h2');if(h&&h.textContent==='Audit trail'&&c.textContent.indexOf('later step')>-1){var w=document.createElement('div');w.id='auditwrap';c.replaceWith(w);w.innerHTML=adm?auditHtml():'<div class="card"><p>Restricted: only administrators can view the audit trail.</p></div>'}})}

/* ---------- Admin pages ---------- */
function hd(t,s,e){return'<div class="welcome"><div><div class="eyebrow">'+e+'</div><h1>'+t+'</h1><div class="sub">'+s+'</div></div></div>'}
function inp(id,l,t,full){return'<div class="field'+(full?' full':'')+'"><label for="'+id+'">'+l+'</label><input id="'+id+'" type="'+t+'" autocomplete="off"></div>'}
function facPage(msg){var F=MWL.db.facilities,U=MWL.db.users;
 return hd('Facilities','Create and review the health facilities that staff can be assigned to.','Super user')+(msg?'<div class="notice" role="status">'+esc(msg)+'</div>':'')+
 '<div class="card"><div class="card-head"><h2>Create a facility</h2></div><div class="formgrid">'+inp('fn','Facility name','text',1)+inp('fd','District','text')+inp('fp','Province','text')+'</div><div class="ierr" id="saerr" role="alert"></div><button class="btn primary" data-sact="addfac">Create facility</button></div>'+
 '<div class="card"><div class="card-head"><h2>Facilities ('+F.length+')</h2></div><div class="table-wrap"><table><thead><tr><th>ID</th><th>Name</th><th>District</th><th>Province</th><th>Staff</th><th>Records started</th></tr></thead><tbody>'+F.map(function(f){return'<tr><td>'+esc(f.id)+'</td><td><b>'+esc(f.name)+'</b></td><td>'+esc(f.district)+'</td><td>'+esc(f.province)+'</td><td>'+U.filter(function(u){return u.facility===f.name&&u.role==='staff'}).length+'</td><td>'+MWL.db.children.filter(function(c){return c.origin===f.name}).length+'</td></tr>'}).join('')+'</tbody></table></div></div>'}
function staffPage(msg){var F=MWL.db.facilities,U=MWL.db.users,sup=isSup();
 return hd('Staff accounts',sup?'Create accounts, edit details and assign roles and facilities.':'Create and manage health worker accounts. Each staff member is assigned to one facility.','Admin')+(msg?'<div class="notice" role="status">'+esc(msg)+'</div>':'')+
 '<div class="card"><div class="card-head"><h2>Create an account</h2></div><div class="formgrid">'+inp('sn','Full name','text',1)+inp('su','Username (letters, numbers, . _)','text')+inp('sp','Temporary password (8+ characters, letters and numbers)','text')+(sup?'<div class="field full"><label for="srole">Role</label><select id="srole"><option value="staff">Health worker</option><option value="admin">Admin</option><option value="super">Super user</option></select></div>':'')+'<div class="field full"><label for="sf">Assigned facility (health workers only)</label><select id="sf">'+F.map(function(f){return'<option>'+esc(f.name)+'</option>'}).join('')+'</select></div></div><div class="ierr" id="saerr" role="alert"></div><button class="btn primary" data-sact="addstaff">Create account</button></div>'+
 '<div class="card"><div class="card-head"><h2>Accounts ('+U.length+')</h2></div><div class="table-wrap"><table><thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Facility</th><th>Status</th><th></th></tr></thead><tbody>'+U.map(function(u){var mng=sup?u.id!==meId():u.role==='staff';return'<tr><td><b>'+esc(u.name)+'</b></td><td>'+esc(u.username)+'</td><td><span class="rolepill">'+RL[u.role]+'</span></td><td>'+esc(u.facility)+'</td><td><span class="status '+(u.active?'good':'late')+'">'+(u.active?'Active':'Deactivated')+'</span></td><td>'+(mng?'<button class="btn outline small" data-sact="toggle" data-uid="'+esc(u.id)+'">'+(u.active?'Deactivate':'Activate')+'</button> <button class="btn outline small" data-sact="reset" data-uid="'+esc(u.id)+'">Reset password</button>':'')+'</td></tr>'}).join('')+'</tbody></table></div></div>'}
function showAdmin(w,msg){if(w==='ind')return;if(w==='fac'&&!isSup())return;$('#main').innerHTML=w==='fac'?facPage(msg):staffPage(msg);
 document.querySelectorAll('#sidenav .nav,#mnav .nav').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-sa')===w)});window.scrollTo(0,0)}
function addFac(){if(!isSup())return;var n=val('fn'),d=val('fd'),p=val('fp'),e=$('#saerr'),F=MWL.db.facilities;
 if(n.length<3||!d||!p){e.textContent='Enter the facility name, district and province.';return}
 if(F.some(function(f){return f.name.toLowerCase()===n.toLowerCase()})){e.textContent='A facility with this name already exists.';return}
 var f={id:'FAC-'+('00'+(F.length+1)).slice(-3),name:n,district:d,province:p};F.push(f);sysLog('Facility created',f.id+' · '+n+' ('+d+', '+p+')');showAdmin('fac','Facility created: '+n+'.')}
async function addStaff(){var n=val('sn'),u=val('su').toLowerCase(),p=$('#sp').value,f=$('#sf').value,e=$('#saerr'),role=isSup()?val('srole'):'staff';
 if(['staff','admin','super'].indexOf(role)<0)role='staff';
 if(n.length<3){e.textContent='Enter the full name.';return}
 if(!/^[a-z0-9._]{3,20}$/.test(u)){e.textContent='Username must be 3–20 characters: lowercase letters, numbers, dot or underscore.';return}
 if(MWL.db.users.some(function(x){return x.username===u})){e.textContent='This username is already taken.';return}
 if(!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(p)){e.textContent='Password needs at least 8 characters with letters and numbers.';return}
 if(role==='staff'&&!f){e.textContent='Choose a facility.';return}
 var fac=role==='staff'?f:'System Administration';
 MWL.db.users.push(await mkUser(n,u,p,role,fac));sysLog('Account created',u+' ('+RL[role]+') assigned to '+fac);showAdmin('staff','Account created for '+u+' ('+RL[role]+'). Share the temporary password securely.')}
function toggle(id){var u=MWL.db.users.filter(function(x){return x.id===id})[0];if(!u||u.id===meId())return;if(!isSup()&&u.role!=='staff')return;
 if(u.role==='super'&&u.active&&!MWL.db.users.some(function(x){return x.id!==id&&x.role==='super'&&x.active})){toast('At least one active super user must remain.');return}
 u.active=!u.active;sysLog(u.active?'Account activated':'Account deactivated',u.username);showAdmin('staff',u.username+(u.active?' activated.':' deactivated.'))}
async function reset(id){var u=MWL.db.users.filter(function(x){return x.id===id})[0];if(!u)return;if(!isSup()&&u.role!=='staff')return;var p=prompt('New temporary password for '+u.username+' (8+ characters, letters and numbers):');if(p==null)return;
 if(!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(p)){toast('Password not changed: needs 8+ characters with letters and numbers.');return}
 u.salt=rnd(16);u.hash=await hash(p,u.salt);sysLog('Password reset',u.username);showAdmin('staff','Password reset for '+u.username+'.')}

/* ---------- Audit trail (admin and super user) ---------- */
function arows(){var q=aq.toLowerCase(),A=MWL.db.audit.filter(function(a){return(!aact||a.action===aact)&&(!q||(a.by+' '+a.facility+' '+a.action+' '+a.childId+' '+a.detail).toLowerCase().indexOf(q)>-1)});
 return'<p>Showing '+Math.min(A.length,300)+' of '+A.length+' matching events (newest first).</p><div class="table-wrap"><table><thead><tr><th>Time</th><th>Staff</th><th>Facility</th><th>Action</th><th>Record</th><th>Detail</th></tr></thead><tbody>'+(A.slice(0,300).map(function(a){return'<tr><td>'+a.time.slice(0,16).replace('T',' ')+'</td><td>'+esc(a.by)+'</td><td>'+esc(a.facility)+'</td><td><b>'+esc(a.action)+'</b></td><td>'+esc(a.childId)+'</td><td style="white-space:normal;min-width:200px">'+esc(a.detail)+'</td></tr>'}).join('')||'<tr><td colspan="6" class="muted">No matching events.</td></tr>')+'</tbody></table></div>'}
function auditHtml(){var acts=[];MWL.db.audit.forEach(function(a){if(acts.indexOf(a.action)<0)acts.push(a.action)});acts.sort();
 return'<div class="card"><div class="card-head"><h2>Audit trail</h2><button class="btn outline small" data-sact="auditcsv">Export CSV</button></div><div class="abar"><div class="field"><label for="aq">Search</label><input id="aq" value="'+esc(aq)+'" placeholder="Staff, record ID, action or detail"></div><div class="field"><label for="aa">Action</label><select id="aa"><option value="">All actions</option>'+acts.map(function(x){return'<option'+(x===aact?' selected':'')+'>'+esc(x)+'</option>'}).join('')+'</select></div></div><div id="abody">'+arows()+'</div><div class="notice">Audit entries cannot be edited or deleted from the app. Only administrators can view them.</div></div>'}
function dl(name,mime,text){var b=new Blob([text],{type:mime}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},600)}
function auditCsv(){var q=function(x){return'"'+String(x).replace(/"/g,'""')+'"'},L=[['Time','Staff','Facility','Action','Record','Detail']].concat(MWL.db.audit.map(function(a){return[a.time,a.by,a.facility,a.action,a.childId,a.detail]}));
 dl('MwanaLink_audit_trail.csv','text/csv;charset=utf-8','\ufeff'+L.map(function(r){return r.map(q).join(',')}).join('\r\n'));sysLog('Audit trail exported','CSV');toast('CSV downloaded.')}

/* ---------- Delete a child record (admin and super user) ---------- */
function openDel(){if(!isAdm())return;var m=$('.profile-meta'),r=m&&/MWL-[A-Z0-9]+/.exec(m.textContent),c=r&&MWL.getChild(r[0]);if(!c)return;
 var d=document.createElement('div');d.className='mback';
 d.innerHTML='<div class="mbox" role="dialog" aria-modal="true"><h2>Delete this record permanently?</h2><p><b>'+esc(c.name)+'</b> · '+esc(c.id)+'</p><div class="notice warn">This removes the child’s card, immunisations, growth measurements and appointments. It cannot be undone. A deletion entry stays in the audit trail.</div><div class="field"><label>Reason for deletion</label><input class="dr" type="text" maxlength="120"></div><div class="field"><label>Type the Child Health ID to confirm</label><input class="di" type="text" placeholder="'+esc(c.id)+'" autocomplete="off"></div><button class="btn danger dgo" disabled>Delete permanently</button> <button class="btn outline dcx">Cancel</button></div>';
 document.body.appendChild(d);var go=d.querySelector('.dgo'),di=d.querySelector('.di'),dr=d.querySelector('.dr');
 function chk(){go.disabled=!(di.value.trim()===c.id&&dr.value.trim().length>=5)}di.oninput=chk;dr.oninput=chk;
 d.querySelector('.dcx').onclick=function(){d.remove()};
 go.onclick=function(){var why=dr.value.trim();MWL.db.children=MWL.db.children.filter(function(x){return x.id!==c.id});
  MWL.audit('Record deleted',c.id,c.name+', born '+c.dob+', guardian NRC '+c.nrc+'. Reason: '+why);d.remove();toast('Record '+c.id+' deleted.');var n=$('[data-page="records"]');if(n)n.click()}}

/* ---------- Events ---------- */
document.addEventListener('click',function(e){var t;
 if((t=e.target.closest('[data-atab]'))){var g=t.getAttribute('data-atab')==='guardian';document.querySelectorAll('.atabs button').forEach(function(b){b.classList.toggle('active',b===t)});$('#pStaff').classList.toggle('hidden',g);$('#pGuard').classList.toggle('hidden',!g)}
 else if(e.target.closest('#aln'))login();
 else if(e.target.closest('#agd'))guardian();
 else if(e.target.closest('#outBtn'))signout();
 else if((t=e.target.closest('[data-sa]')))showAdmin(t.getAttribute('data-sa'));
 else if(e.target.closest('[data-sadel]'))openDel();
 else if((t=e.target.closest('[data-sact]'))){var a=t.getAttribute('data-sact');if(a==='addfac')addFac();else if(a==='addstaff')addStaff();else if(a==='toggle')toggle(t.getAttribute('data-uid'));else if(a==='reset')reset(t.getAttribute('data-uid'));else if(a==='auditcsv')auditCsv()}});
document.addEventListener('input',function(e){if(e.target.id==='aq'){aq=e.target.value;$('#abody').innerHTML=arows()}});
document.addEventListener('change',function(e){if(e.target.id==='aa'){aact=e.target.value;$('#abody').innerHTML=arows()}});
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&(e.target.id==='au'||e.target.id==='ap'))login()});
['#sidenav','#mnav'].forEach(function(s){new MutationObserver(navFix).observe($(s),{childList:true})});
new MutationObserver(mainFix).observe($('#main'),{childList:true,subtree:true});
init().then(function(){var s=null;try{s=JSON.parse(sessionStorage.getItem(SK))}catch(e){}
 var u=s&&s.u&&MWL.db.users.filter(function(x){return x.id===s.u&&x.active})[0];
 overlay();if(u)enter(u,true);else if(s&&s.g)guardian()});
})();
