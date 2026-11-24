(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc,page='dashboard',role='facility';
var NAV=[{l:'Workspace'},{p:'dashboard',i:'▦',t:'Dashboard'},{p:'records',i:'▤',t:'Child records'},{p:'register',i:'＋',t:'Register child'},{p:'lookup',i:'⌕',t:'Find a child'},{l:'Management'},{p:'reports',i:'▥',t:'Reports'},{p:'audit',i:'◷',t:'Audit trail'}];
function toast(t){var r=$('#toastRoot');r.innerHTML='<div class="toast">'+esc(t)+'</div>';setTimeout(function(){r.innerHTML=''},2600)}
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
function render(){
 nav();var m=$('#main');
 if(role==='parent'){m.innerHTML=head('Parent / guardian','My children','Read-only access to your children’s health records.')+'<div class="card"><div class="card-head"><h2>Parent view</h2><span class="status info">Coming in Step 6</span></div><p>Guardians will see their children’s cards, growth charts and appointments here. They cannot edit clinical records.</p></div>';return}
 if(page==='dashboard')m.innerHTML=dash();
 else if(page==='records')m.innerHTML=records();
 else if(page==='register')m.innerHTML=later('Register child','Step 3');
 else if(page==='lookup')m.innerHTML=later('Find a child','Step 3');
 else if(page==='reports')m.innerHTML=later('Reports','a later step');
 else m.innerHTML=later('Audit trail','a later step')}
document.addEventListener('click',function(e){
 var p=e.target.closest('[data-page]'),r=e.target.closest('[data-role]'),o=e.target.closest('[data-open]');
 if(p){page=p.getAttribute('data-page');role='facility';render()}
 else if(r){role=r.getAttribute('data-role');render()}
 else if(o)toast('The child’s health card opens in Step 4.')});
document.addEventListener('input',function(e){if(e.target.id==='q')$('#rows').innerHTML=rows(e.target.value)});
render();
})();
