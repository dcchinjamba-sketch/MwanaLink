(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc,page='dashboard',role='facility';
var draft={},formErr='',created=null,found=null,lastQ='';
var NAV=[{l:'Workspace'},{p:'dashboard',i:'▦',t:'Dashboard'},{p:'records',i:'▤',t:'Child records'},{p:'register',i:'＋',t:'Register child'},{p:'lookup',i:'⌕',t:'Find a child'},{l:'Management'},{p:'reports',i:'▥',t:'Reports'},{p:'audit',i:'◷',t:'Audit trail'}];
function toast(t){var r=$('#toastRoot');r.innerHTML='<div class="toast">'+esc(t)+'</div>';setTimeout(function(){r.innerHTML=''},2800)}
function nav(){
 $('#sidenav').innerHTML=NAV.map(function(n){return n.l?'<div class="side-label"'+(n.l==='Management'?' style="margin-top:18px"':'')+'>'+n.l+'</div>':'<button class="nav'+(n.p===page?' active':'')+'" data-page="'+n.p+'"><span class="ico">'+n.i+'</span> '+n.t+'</button>'}).join('');
 $('#mnav').innerHTML=NAV.filter(function(n){return n.p}).map(function(n){return '<button class="nav'+(n.p===page?' active':'')+'" data-page="'+n.p+'">'+n.t+'</button>'}).join('')}
function head(eyebrow,title,sub){return '<div class="welcome"><div><div class="eyebrow">'+eyebrow+'</div><h1>'+title+'</h1><div class="sub">'+sub+'</div></div><div class="switcher"><button type="button" data-role="facility" class="'+(role==='facility'?'active':'')+'">Health facility</button><button type="button" data-role="parent" class="'+(role==='parent'?'active':'')+'">Parent / guardian</button></div></div>'}
function stat(l,i,v,s){return '<div class="stat"><div class="stat-top">'+l+'<span class="stat-icon">'+i+'</span></div><strong>'+v+'</strong><small>'+s+'</small></div>'}
function overdueN(c){return MWL.dueList(c).filter(function(d){return d.overdue}).length}
function dash(){
 var k=MWL.db.children,od=k.filter(function(c){return overdueN(c)>0}),given=k.reduce(function(n,c){return n+c.imm.filter(function(i){return !i.void}).length},0),up=0;
 k.forEach(function(c){c.appts.forEach(function(a){if(a.date>=MWL.TODAY)up++})});
 var flags=od.map(function(c){return '<div class="flag"><div><b class="child-name">'+esc(c.name)+'</b><br><span class="muted">'+esc(c.id)+' · '+MWL.ageText(c.dob)+'</span></div><span class="status late">'+overdueN(c)+' overdue dose(s)</span></div>'}).join('')||'<div class="empty">No children flagged.</div>';
 var act=MWL.db.audit.slice(0,6).map(function(a){return '<tr><td>'+a.time.slice(0,16).replace('T',' ')+'</td><td>'+esc(a.action)+'</td><td>'+esc(a.childId)+'</td></tr>'}).join('')||'<tr><td colspan="3" class="muted">No activity yet.</td></tr>';
 return head('Health facility workspace','Dashboard','Overview of child health services at '+esc(MWL.FACILITY)+'.')+
 '<div class="grid stats">'+stat('Children registered','☺',k.length,'Total records')+stat('Children with overdue vaccines','!',od.length,'Need follow-up')+stat('Vaccine doses recorded','✓',given,'All children')+stat('Upcoming appointments','▣',up,'Confirmed')+'</div>'+
 '<div class="card"><div class="card-head"><h2>Children needing follow-up</h2></div>'+flags+'</div>'+
 '<div class="card"><div class="card-head"><h2>Recent record activity</h2></div><div class="table-wrap"><table><thead><tr><th>Time</th><th>Action</th><th>Record</th></tr></thead><tbody>'+act+'</tbody></table></div></div>'}
function rows(q){q=(q||'').toLowerCase();var r=MWL.db.children.filter(function(c){return !q||(c.name+' '+c.id+' '+c.guardian).toLowerCase().indexOf(q)>-1});
 return r.map(function(c){var o=overdueN(c);return '<tr><td><div class="child-name">'+esc(c.name)+'</div><div class="muted">'+esc(c.id)+'</div></td><td>'+(c.sex==='F'?'Female':'Male')+'</td><td>'+MWL.ageText(c.dob)+'</td><td>'+esc(c.guardian)+'</td><td>'+esc(c.lastFacility)+'</td><td><span class="status '+(o?'late':'good')+'">'+(o?o+' overdue':'Up to date')+'</span></td><td><button class="btn secondary small" data-open="'+esc(c.id)+'">Open</button></td></tr>'}).join('')||'<tr><td colspan="7" class="empty">No matching children.</td></tr>'}
function records(){return head('Health facility workspace','Child records','All children registered at connected facilities.')+'<div class="card"><div class="searchrow"><input id="q" placeholder="Search by name, Child Health ID or guardian" autocomplete="off"></div><div class="table-wrap"><table><thead><tr><th>Child</th><th>Sex</th><th>Age</th><th>Guardian</th><th>Last facility</th><th>Vaccines</th><th></th></tr></thead><tbody id="rows">'+rows('')+'</tbody></table></div></div>'}
function later(t,n){return head('Health facility workspace',t,'')+'<div class="card"><div class="card-head"><h2>'+t+'</h2><span class="status info">Coming in '+n+'</span></div><p>This page is built in a later step.</p></div>'}

/* ---------- Register ---------- */
var IDS=['n','s','d','pb','bw','g','nrc','ph','alt','rel','addr','comm'];
function v(id){return esc(draft[id]||'')}
function fld(id,label,type,ph,full){return '<div class="field'+(full?' full':'')+'"><label for="'+id+'">'+label+'</label><input id="'+id+'" type="'+type+'" value="'+v(id)+'" placeholder="'+(ph||'')+'" autocomplete="off"'+(type==='date'?' max="'+MWL.TODAY+'"':'')+(type==='number'?' step="0.01"':'')+'></div>'}
function sel(id,label,opts){return '<div class="field"><label for="'+id+'">'+label+'</label><select id="'+id+'">'+opts.map(function(o){return '<option'+(draft[id]===o?' selected':'')+'>'+o+'</option>'}).join('')+'</select></div>'}
function readDraft(){IDS.forEach(function(i){var e=document.getElementById(i);if(e)draft[i]=e.value.trim()})}
function newId(){var cs='ABCDEFGHJKMNPQRSTUVWXYZ23456789',id;do{var a=crypto.getRandomValues(new Uint8Array(6));id='MWL-'+Array.prototype.map.call(a,function(b){return cs[b%cs.length]}).join('')}while(MWL.getChild(id));return id}
function registerPage(){
 if(created){var c=MWL.getChild(created);return head('Health facility workspace','Register child','Child registered successfully.')+'<div class="card"><div class="card-head"><h2>Registration complete</h2><span class="status good">Saved</span></div><div class="idbox"><div><div class="muted" style="font-size:11px">CHILD HEALTH ID</div><div class="big">'+esc(c.id)+'</div><p>'+esc(c.name)+' · born '+MWL.fmt(c.dob)+'<br>Guardian: '+esc(c.guardian)+'</p></div><div><div class="qrwrap" id="qr"></div></div></div><div class="notice">The QR code holds a secure random token, not personal or clinical information. Print or save it for the child’s record.</div><button class="btn primary" data-act="again">Register another child</button> <button class="btn outline" data-page="records">View child records</button></div>'}
 return head('Health facility workspace','Register child','Create a new child health record and Child Health ID.')+(formErr?'<div class="notice err" role="alert">'+esc(formErr)+'</div>':'')+
 '<div class="card"><div class="card-head"><h2>Child details</h2></div><div class="formgrid">'+fld('n','Child full name','text','',1)+sel('s','Sex',['Female','Male'])+fld('d','Date of birth','date')+fld('pb','Place of birth (optional)','text')+fld('bw','Birth weight in kg (optional)','number','3.2')+'</div></div>'+
 '<div class="card"><div class="card-head"><h2>Parent / guardian</h2></div><div class="formgrid">'+fld('g','Guardian full name','text','',1)+fld('nrc','Guardian NRC','text','123456/10/1')+sel('rel','Relationship to child',['Mother','Father','Guardian','Other'])+fld('ph','Phone number','tel','0970000000')+fld('alt','Alternative number (optional)','tel')+fld('addr','Residential address or community','text','',1)+sel('comm','Preferred communication',['SMS','Phone call','In-app only'])+'</div>'+
 '<div class="notice warn">The guardian’s NRC is an identifier only. It is not proof of guardianship.</div><button class="btn primary" data-act="register">Register child</button></div>'}
function doRegister(){
 readDraft();var d=draft,err='';
 if(!d.n)err='Enter the child’s full name.';
 else if(!d.d||d.d>MWL.TODAY)err='Enter a valid date of birth that is not in the future.';
 else if(MWL.ageMonths(d.d)>60)err='MwanaLink registers children under five years old.';
 else if(d.bw&&!(+d.bw>=0.5&&+d.bw<=6))err='Birth weight must be between 0.5 and 6 kg.';
 else if(!d.g)err='Enter the guardian’s full name.';
 else if(!/^\d{6}\/\d{2}\/\d$/.test(d.nrc||''))err='Enter the NRC like 123456/10/1.';
 else if(!/^[0-9+ ]{9,15}$/.test(d.ph||''))err='Enter a valid phone number.';
 if(!err){var dup=MWL.db.children.filter(function(c){return c.nrc===d.nrc&&c.dob===d.d&&c.name.toLowerCase()===d.n.toLowerCase()})[0];if(dup)err='Possible duplicate: '+dup.name+' ('+dup.id+') already exists with this guardian NRC and date of birth. Open the existing record instead.'}
 if(err){formErr=err;render();window.scrollTo(0,0);return}
 var c=MWL.makeChild(newId(),d.n,d.s==='Male'?'M':'F',0,d.g,d.nrc,d.ph);
 c.dob=d.d;c.registered=MWL.TODAY;c.pob=d.pb||'';c.bw=d.bw?+d.bw:null;c.rel=d.rel;c.addr=d.addr||'';c.alt=d.alt||'';c.comm=d.comm;delete c.fictional;
 MWL.db.children.push(c);MWL.audit('Child registered',c.id,'New registration');
 created=c.id;draft={};formErr='';render();window.scrollTo(0,0)}

/* ---------- Find ---------- */
function lookupPage(){
 var res='';
 if(found){res=found.length?'<div class="notice warn">Before opening a record, confirm the child’s name, date of birth and guardian. A matching NRC is not proof of guardianship.</div>'+found.map(function(c){return '<div class="flag"><div><b class="child-name">'+esc(c.name)+'</b><br><span class="muted">Born '+MWL.fmt(c.dob)+' · '+esc(c.id)+'</span></div><button class="btn secondary small" data-verify="'+esc(c.id)+'">Open record</button></div>'}).join('')+'<label class="check"><input type="checkbox" id="vf"> I have verified the child’s identity (name, date of birth and guardian).</label>':'<div class="empty">No matching record. Check the details and try again.</div>'}
 return head('Health facility workspace','Find a child','Retrieve a record by Child Health ID, guardian NRC or QR token.')+'<div class="card"><div class="searchrow"><input id="lq" value="'+esc(lastQ)+'" placeholder="MWL-XXXXXX, 123456/10/1, or pasted QR token" autocomplete="off"><button class="btn primary" data-act="find">Search</button></div><p>Exact matches only. QR camera scanning is added when the app is packaged for Android.</p>'+res+'</div>'}
function doFind(){var q=$('#lq').value.trim().toLowerCase().replace(/^mwl:/,'');lastQ=$('#lq').value.trim();found=q?MWL.db.children.filter(function(c){return c.id.toLowerCase()===q||c.nrc===q||c.token===q}):[];render()}
function doVerify(id){var b=$('#vf');if(!b||!b.checked){toast('Please confirm identity verification first.');return}MWL.audit('Record retrieved',id,'Opened after identity verification');toast('Verified. The child’s health card opens in Step 4.')}

function render(){
 nav();var m=$('#main');
 if(role==='parent'){m.innerHTML=head('Parent / guardian','My children','Read-only access to your children’s health records.')+'<div class="card"><div class="card-head"><h2>Parent view</h2><span class="status info">Coming in Step 6</span></div><p>Guardians will see their children’s cards, growth charts and appointments here. They cannot edit clinical records.</p></div>';return}
 if(page==='dashboard')m.innerHTML=dash();
 else if(page==='records')m.innerHTML=records();
 else if(page==='register'){m.innerHTML=registerPage();if(created&&window.QRCode){var c=MWL.getChild(created);new QRCode($('#qr'),{text:'mwl:'+c.token,width:130,height:130})}else if(created&&$('#qr'))$('#qr').textContent='QR unavailable offline'}
 else if(page==='lookup')m.innerHTML=lookupPage();
 else if(page==='reports')m.innerHTML=later('Reports','a later step');
 else m.innerHTML=later('Audit trail','a later step')}
document.addEventListener('click',function(e){
 var p=e.target.closest('[data-page]'),r=e.target.closest('[data-role]'),o=e.target.closest('[data-open]'),a=e.target.closest('[data-act]'),vf=e.target.closest('[data-verify]');
 if(p){page=p.getAttribute('data-page');role='facility';formErr='';if(page!=='register')created=null;if(page!=='lookup')found=null;render()}
 else if(r){role=r.getAttribute('data-role');render()}
 else if(o)toast('The child’s health card opens in Step 4.')
 else if(vf)doVerify(vf.getAttribute('data-verify'))
 else if(a){var k=a.getAttribute('data-act');if(k==='register')doRegister();else if(k==='again'){created=null;draft={};render()}else if(k==='find')doFind()}});
document.addEventListener('input',function(e){if(e.target.id==='q')$('#rows').innerHTML=rows(e.target.value)});
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.id==='lq')doFind()});
render();
})();
