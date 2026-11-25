(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc,db=MWL.db;
var PROV=['Central','Copperbelt','Eastern','Luapula','Lusaka','Muchinga','Northern','North-Western','Southern','Western'];
var DIST={Central:['Chibombo','Chisamba','Chitambo','Kabwe','Kapiri Mposhi','Luano','Mkushi','Mumbwa','Ngabwe','Serenje','Shibuyunji']};
var MK=['Chibefwe Rural Health Centre','Lesa Wesu Private Clinic','Mayo Rural Health Centre','Milombwe  Health post','Mkushi District Hospital','Mulundu Health Post','Tazara Health Post','Tusekelemo Rural Health Centre','Xola Clinic Health Centre','Chitina Health Post','Fibanga Health Post','Munsakamba Health Post','Katuba Health Post','Chisanga Rural Health Centre','Musofu Rural Health Centre','Upper Musofu Health Post','Chengelo Clinic','Kasalamakanga Health Post','Nkolonga Farm Clinic','Nkolonga Health Post','Kasokota Health Post','Mikunku Rural Health centre','Nkumbi college Clinic','Nkumbi Rural Health Centre','Upper Lusemfwa Health Post','Chalata Rural Health Centre','Changilo Health Post','Chibwemukunga Health Post','Nambo Rural Health Post','Ntekete Health Post','Chikabile Health  Post','Kabengeshi Rural Health Post','Kakushi Health Post','Luanshimba Rural Health Centre (Mkushi)','Mboboli Rural Health post','Mulungwe Rural Health Centre','Matuku Health Post','Miloso Health Post','Momboshi Health Post','Twatasha Health Post','Chine Rural Health Post','Fiwila Rural Health Centre','Kalubula Rural Health post','Nkulumashiba Rural health post','Nyenje Health Post','Shaibila Health Post','Lilanda Health Post','Malubila Health Post','Mankanda Health Post','Milele Health post','Nshinso Rural Health Centre','Mutende Private Clinic'];
function clean(s){return String(s).replace(/\s+/g,' ').trim()}
/* ---- Seed provinces, Central Province districts and Mkushi facilities (runs once per missing item) ---- */
(function(){var ch=false;
 if(!db.facilities){db.facilities=[{id:'FAC-001',name:'Demo Health Centre',district:'Lusaka',province:'Lusaka'}];ch=true}
 if(!db.geoD){db.geoD={};ch=true}
 PROV.forEach(function(p){if(!db.geoD[p])db.geoD[p]=[]});
 Object.keys(DIST).forEach(function(p){DIST[p].forEach(function(d){if(db.geoD[p].indexOf(d)<0){db.geoD[p].push(d);ch=true}})});
 MK.forEach(function(raw){var n=clean(raw),f=db.facilities.filter(function(x){return x.name.toLowerCase()===n.toLowerCase()})[0];
  if(f){if(f.province!=='Central'||f.district!=='Mkushi'){f.province='Central';f.district='Mkushi';ch=true}}
  else{db.facilities.push({id:'FAC-'+('00'+(db.facilities.length+1)).slice(-3),name:n,district:'Mkushi',province:'Central'});ch=true}});
 if(ch)MWL.save()})();
function provinces(){var a=PROV.slice();db.facilities.forEach(function(f){if(f.province&&a.indexOf(f.province)<0)a.push(f.province)});return a.sort()}
function districts(p){var a=(db.geoD[p]||[]).slice();db.facilities.forEach(function(f){if(f.province===p&&f.district&&a.indexOf(f.district)<0)a.push(f.district)});return a.sort()}
function facs(p,d){return db.facilities.filter(function(f){return f.province===p&&f.district===d}).map(function(f){return f.name}).sort()}
function find(n){return db.facilities.filter(function(f){return f.name===n})[0]}
MWL.GEO={provinces:provinces,districts:districts,facilities:facs,find:find};
/* ---- Dropdown helpers ---- */
function opt(list,cur,ph){return '<option value="">'+ph+'</option>'+list.map(function(x){return '<option'+(x===cur?' selected':'')+'>'+esc(x)+'</option>'}).join('')}
function fillD(el,p,cur){if(!p){el.innerHTML=opt([],'','Select province first');el.disabled=true;return}
 var l=districts(p);el.innerHTML=l.length?opt(l,cur,'Select district'):opt([],'','No districts loaded yet for this province');el.disabled=!l.length}
function fillF(el,p,d,cur){if(!d){el.innerHTML=opt([],'','Select district first');el.disabled=true;return}
 var l=facs(p,d);el.innerHTML=l.length?opt(l,cur,'Select health facility'):opt([],'','No facilities in this district yet');el.disabled=!l.length}
/* ---- Create account: Province > District > Facility ---- */
function toggleCreate(){var r=$('#srole'),st=!r||r.value==='staff';['sgeo1','sgeo2'].forEach(function(i){var e=$('#'+i);if(e)e.classList.toggle('hidden',!st)});var f=$('#sf');if(f)f.closest('.field').classList.toggle('hidden',!st)}
function patchCreate(m){var sf=m.querySelector('#sf');if(!sf||m.querySelector('#sprov'))return;var fld=sf.closest('.field');
 fld.insertAdjacentHTML('beforebegin','<div class="field" id="sgeo1"><label for="sprov">Province</label><select id="sprov">'+opt(provinces(),'','Select province')+'</select></div><div class="field" id="sgeo2"><label for="sdist">District</label><select id="sdist"></select></div>');
 fld.querySelector('label').textContent='Health facility';fillD($('#sdist'),'');fillF(sf,'','');toggleCreate()}
/* ---- Edit account ---- */
function toggleEdit(){var m=$('#eMod');if(!m||!m.querySelector('#eprov'))return;var r=m.querySelector('#eRole'),role=r?r.value:m.dataset.role,st=role==='staff',fc=m.querySelector('#eFac');
 ['egeo1','egeo2'].forEach(function(i){m.querySelector('#'+i).classList.toggle('hidden',!st)});
 if(!st){fc.innerHTML='<option value="System Administration">System Administration</option>';fc.disabled=true}
 else{fillF(fc,m.querySelector('#eprov').value,m.querySelector('#edist').value,fc.value==='System Administration'?'':fc.value)}}
function patchEdit(){var m=$('#eMod');if(!m||m.querySelector('#eprov'))return;var fc=m.querySelector('#eFac'),sv=m.querySelector('[data-esave]');if(!fc||!sv)return;
 var u=(db.users||[]).filter(function(x){return x.id===sv.getAttribute('data-esave')})[0],f=u&&find(u.facility),fld=fc.closest('.field');
 fld.insertAdjacentHTML('beforebegin','<div class="field" id="egeo1"><label for="eprov">Province</label><select id="eprov">'+opt(provinces(),f?f.province:'','Select province')+'</select></div><div class="field" id="egeo2"><label for="edist">District</label><select id="edist"></select></div>');
 fld.querySelector('label').textContent='Health facility';
 fillD(m.querySelector('#edist'),f?f.province:'',f?f.district:'');fillF(fc,f?f.province:'',f?f.district:'',f?u.facility:'');
 if(u&&u.role==='staff'&&f&&f.name!==u.facility)fillF(fc,'','');
 toggleEdit()}
/* ---- Facilities page: Province and District dropdowns, with "add a new district" ---- */
function patchFac(m){var fp=m.querySelector('#fp'),fd=m.querySelector('#fd');if(!fp||!fd||fp.tagName!=='INPUT')return;
 fd.closest('.field').innerHTML='<label for="fp">Province</label><select id="fp">'+opt(provinces(),'','Select province')+'</select>';
 var b=m.querySelector('#fp').closest('.field');
 var dField=m.querySelectorAll('.formgrid .field');
 dField[dField.length-1].innerHTML='<label for="fd">District</label><select id="fd" disabled><option value="">Select province first</option></select><input id="fdn" class="hidden" maxlength="40" placeholder="New district name" autocomplete="off" style="margin-top:6px">'}
function fillFD(p){var d=$('#fd');if(!d)return;if(!p){fillD(d,'');return}var l=districts(p);d.disabled=false;d.innerHTML=opt(l,'','Select district')+'<option value="__new">Other (add a new district)</option>';var n=$('#fdn');if(n)n.classList.add('hidden')}
/* ---- Accounts table: show district and province under the facility ---- */
function patchTable(m){m.querySelectorAll('table').forEach(function(t){var h=t.querySelector('thead tr');if(!h||t.dataset.gl||h.textContent.indexOf('Username')<0)return;t.dataset.gl='1';
 t.querySelectorAll('tbody tr').forEach(function(r){Array.prototype.forEach.call(r.children,function(td){var f=find(td.textContent.trim());if(f&&!td.children.length)td.insertAdjacentHTML('beforeend','<div class="muted">'+esc(f.district)+', '+esc(f.province)+'</div>')})})})}
new MutationObserver(function(){var m=$('#main');if(m){patchCreate(m);patchFac(m);patchTable(m)}patchEdit()}).observe(document.body,{childList:true,subtree:true});
/* ---- Events ---- */
document.addEventListener('change',function(e){var i=e.target.id,v=e.target.value;
 if(i==='sprov'){fillD($('#sdist'),v);fillF($('#sf'),'','')}
 else if(i==='sdist')fillF($('#sf'),$('#sprov').value,v)
 else if(i==='srole')toggleCreate()
 else if(i==='eprov'){fillD($('#edist'),v);fillF($('#eFac'),'','')}
 else if(i==='edist')fillF($('#eFac'),$('#eprov').value,v)
 else if(i==='eRole')toggleEdit()
 else if(i==='fp'&&e.target.tagName==='SELECT')fillFD(v)
 else if(i==='fd'&&e.target.tagName==='SELECT'){var n=$('#fdn');if(n)n.classList.toggle('hidden',v!=='__new')}});
window.addEventListener('click',function(e){
 if(e.target.closest('[data-esave]')){var m=$('#eMod'),r=m.querySelector('#eRole'),role=r?r.value:m.dataset.role,fc=m.querySelector('#eFac');
  if(role==='staff'&&!(fc&&fc.value&&fc.value!=='System Administration')){e.stopPropagation();e.preventDefault();m.querySelector('#eErr').textContent='Choose the province, district and health facility.'}}
 else if(e.target.closest('[data-sact="addstaff"]')){var sf=$('#sf'),r2=$('#srole'),er=$('#saerr');
  if(sf&&(!r2||r2.value==='staff')&&!sf.value){e.stopPropagation();e.preventDefault();if(er)er.textContent='Choose the province, district and health facility.'}}
 else if(e.target.closest('[data-sact="addfac"]')){var fp=$('#fp'),fd=$('#fd'),er2=$('#saerr');if(!fp||fp.tagName!=='SELECT'||!fd)return;
  var bad=function(t){e.stopPropagation();e.preventDefault();er2.textContent=t};
  if(!fp.value){bad('Select the province.');return}
  if(fd.value==='__new'){var n=clean($('#fdn').value);if(n.length<3){bad('Type the new district name.');return}
   var ex=districts(fp.value).filter(function(x){return x.toLowerCase()===n.toLowerCase()})[0];n=ex||n;
   if(!ex){(db.geoD[fp.value]=db.geoD[fp.value]||[]).push(n);MWL.save()}
   fd.insertAdjacentHTML('beforeend','<option>'+esc(n)+'</option>');fd.value=n}
  else if(!fd.value){bad('Select the district.');return}}},true);
})();
