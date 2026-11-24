(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc;
var POS=['Nurse','Midwife','Medical Officer','Clinical Officer','Environmental Health Technologist','Other (specify)'];
function toast(t){var r=$('#toastRoot');if(r){r.innerHTML='<div class="toast">'+esc(t)+'</div>';setTimeout(function(){r.innerHTML=''},3200)}}
function val(id){var e=$('#'+id);return e?e.value.trim():''}
function meId(){try{return JSON.parse(sessionStorage.getItem('mwl_sess_v1')).u}catch(e){return null}}
/* Show password on the sign-in screen */
function pw(){var p=$('#ap');if(p&&!$('#apShow'))p.closest('.field').insertAdjacentHTML('afterend','<label class="check" style="margin:0 0 6px"><input type="checkbox" id="apShow"> Show password</label>')}
new MutationObserver(pw).observe(document.body,{childList:true});pw();
/* Edit buttons in Staff accounts */
function patch(){var m=$('#main');if(!m)return;m.querySelectorAll('table').forEach(function(t){var h=t.querySelector('thead tr');if(!h||t.dataset.ed||h.textContent.indexOf('Username')<0)return;t.dataset.ed='1';
 t.querySelectorAll('tbody tr').forEach(function(r){var un=r.children[1]&&r.children[1].textContent,u=(MWL.db.users||[]).filter(function(x){return x.username===un})[0],td=r.lastElementChild;if(u&&td)td.insertAdjacentHTML('beforeend',' <button class="btn secondary small" data-uedit="'+esc(u.id)+'">Edit</button>')})})}
new MutationObserver(patch).observe($('#main'),{childList:true,subtree:true});
function f(id,l,v,x){return '<div class="field"><label for="'+id+'">'+l+'</label><input id="'+id+'" value="'+esc(v||'')+'" '+(x||'')+' autocomplete="off"></div>'}
function opts(a,cur){return a.map(function(o){var x=Array.isArray(o)?o:[o,o];return '<option value="'+esc(x[0])+'"'+(String(x[0])===String(cur)?' selected':'')+'>'+esc(x[1])+'</option>'}).join('')}
function syncRole(){var r=$('#eRole'),fc=$('#eFac');if(!r||!fc)return;if(r.value==='super'){fc.value='System Administration';fc.disabled=true}else{fc.disabled=false;if(fc.value==='System Administration')fc.selectedIndex=0}}
function open(id){var u=MWL.db.users.filter(function(x){return x.id===id})[0];if(!u)return;var self=meId()===u.id,inList=POS.indexOf(u.position)>-1,fs=(MWL.db.facilities||[]).map(function(x){return x.name});if(u.role!=='super'&&fs.indexOf(u.facility)<0)fs.push(u.facility);fs=fs.filter(function(x){return x!=='System Administration'});fs.push('System Administration');
 var d=document.createElement('div');d.className='mback';d.id='eMod';
 d.innerHTML='<div class="mbox" role="dialog" aria-modal="true"><h2>Edit account</h2>'+f('eName','Full name',u.name,'maxlength="60"')+f('eUser','Username',u.username,'maxlength="20" autocapitalize="none"')+'<div class="field"><label for="ePos">Position</label><select id="ePos">'+opts(POS,inList?u.position:'Other (specify)')+'</select></div><div class="field'+(inList?' hidden':'')+'" id="ePow"><label for="ePo">Specify position</label><input id="ePo" maxlength="40" value="'+esc(inList?'':u.position)+'" autocomplete="off"></div><div class="field"><label for="eRole">Role</label><select id="eRole"'+(self?' disabled':'')+'>'+opts([['staff','Health worker'],['super','Super user']],u.role)+'</select></div><div class="field"><label for="eFac">Assigned facility</label><select id="eFac">'+opts(fs,u.facility)+'</select></div><div class="field"><label for="eAct">Status</label><select id="eAct"'+(self?' disabled':'')+'>'+opts([['1','Active'],['0','Deactivated']],u.active?'1':'0')+'</select></div>'+(self?'<p class="mu">You cannot change your own role or status.</p>':'')+'<div class="ierr" id="eErr" role="alert"></div><button class="btn primary" data-esave="'+esc(id)+'">Save changes</button> <button class="btn outline" data-eclose="1">Cancel</button></div>';
 document.body.appendChild(d);syncRole()}
function save(id){var U=MWL.db.users,u=U.filter(function(x){return x.id===id})[0],e=$('#eErr'),self=meId()===u.id,nm=val('eName'),un=val('eUser').toLowerCase(),pos=val('ePos'),role=self?u.role:val('eRole'),fac=$('#eFac').value,act=self?u.active:val('eAct')==='1';
 if(pos==='Other (specify)')pos=val('ePo');
 if(nm.length<3){e.textContent='Enter the full name.';return}
 if(!/^[a-z0-9._]{3,20}$/.test(un)){e.textContent='Username must be 3–20 characters: lowercase letters, numbers, dot or underscore.';return}
 if(U.some(function(x){return x.id!==id&&x.username===un})){e.textContent='This username is already taken.';return}
 if(pos.length<3){e.textContent='Enter the position.';return}
 if(role==='super')fac='System Administration';else if(fac==='System Administration'){e.textContent='Choose a facility for a health worker.';return}
 var others=U.filter(function(x){return x.id!==id&&x.role==='super'&&x.active}).length;
 if(u.role==='super'&&(role!=='super'||!act)&&!others){e.textContent='At least one active super user must remain.';return}
 var ch=[],cmp=function(l,a,b){if(String(a)!==String(b))ch.push(l+': '+a+' → '+b)};
 cmp('Name',u.name,nm);cmp('Username',u.username,un);cmp('Position',u.position||'',pos);cmp('Role',u.role==='super'?'Super user':'Health worker',role==='super'?'Super user':'Health worker');cmp('Facility',u.facility,fac);cmp('Status',u.active?'Active':'Deactivated',act?'Active':'Deactivated');
 if(!ch.length){e.textContent='No changes made.';return}
 u.name=nm;u.username=un;u.position=pos;u.role=role;u.facility=fac;u.active=act;MWL.save();
 MWL.audit('Staff account edited','-',un+'. '+ch.join('; '));
 $('#eMod').remove();toast('Account updated.');var b=$('[data-sa="staff"]');if(b)b.click()}
document.addEventListener('click',function(e){var t;
 if((t=e.target.closest('[data-uedit]')))open(t.getAttribute('data-uedit'));
 else if(e.target.closest('[data-eclose]')){var m=$('#eMod');if(m)m.remove()}
 else if((t=e.target.closest('[data-esave]')))save(t.getAttribute('data-esave'))});
document.addEventListener('change',function(e){var i=e.target.id;
 if(i==='apShow'){var p=$('#ap');p.type=e.target.checked?'text':'password';p.focus()}
 else if(i==='eRole')syncRole();
 else if(i==='ePos')$('#ePow').classList.toggle('hidden',e.target.value!=='Other (specify)')});
})();
