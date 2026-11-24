(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc,cid=null,tab='overview';
var TABS=[['overview','Overview'],['imm','Immunisation'],['growth','Growth'],['appts','Appointments'],['hist','History']];
function toast(t){var r=$('#toastRoot');r.innerHTML='<div class="toast">'+esc(t)+'</div>';setTimeout(function(){r.innerHTML=''},2600)}
function doseLabel(d){return d===0?'Birth dose 0':'Dose '+d}
function kv(a){return '<div class="kv">'+a.map(function(x){return '<div><small>'+x[0]+'</small><b>'+esc(x[1]||'Not recorded')+'</b></div>'}).join('')+'</div>'}
function show(){
 var c=MWL.getChild(cid);if(!c)return;
 var od=MWL.dueList(c).filter(function(d){return d.overdue}).length;
 var h='<div class="card"><div class="profile-head"><div class="child-avatar">☺</div><div><h2>'+esc(c.name)+'</h2><div class="profile-meta">'+esc(c.id)+' · '+(c.sex==='F'?'Female':'Male')+' · '+MWL.ageText(c.dob)+' · Born '+MWL.fmt(c.dob)+'</div></div><div class="profile-actions"><button class="btn outline small" data-back="1">← Back</button></div></div>'+
 (c.fictional?'<div class="notice warn" style="margin-bottom:0">Fictional demonstration record.</div>':'')+
 '<div class="tabs">'+TABS.map(function(t){return '<button class="tab'+(t[0]===tab?' active':'')+'" data-tab="'+t[0]+'">'+t[1]+(t[0]==='imm'&&od?' ('+od+' overdue)':'')+'</button>'}).join('')+'</div>';
 if(tab==='overview')h+=overview(c);else if(tab==='imm')h+=imm(c);else if(tab==='hist')h+=hist(c);
 else h+='<div class="empty">'+(tab==='growth'?'Growth monitoring is built in Step 5.':'Appointments are built in a later step.')+'</div>';
 $('#main').innerHTML=h+'</div>';
 if(tab==='overview'&&window.QRCode&&$('#qr'))new QRCode($('#qr'),{text:'mwl:'+c.token,width:120,height:120});
 if(tab==='imm')dose()}
function overview(c){
 return '<div class="row2"><div class="grow"><h2 style="font-size:14px;margin:0 0 10px">Child and guardian</h2>'+kv([['Child Health ID',c.id],['Date of birth',MWL.fmt(c.dob)],['Guardian',c.guardian],['Relationship',c.rel],['Guardian NRC',c.nrc],['Phone',c.phone]])+'<h2 style="font-size:14px;margin:16px 0 10px">Birth and registration</h2>'+kv([['Place of birth',c.pob],['Birth weight',c.bw?c.bw+' kg':''],['Registered',MWL.fmt(c.registered)],['Originating facility',c.origin],['Last updated at',c.lastFacility]])+'</div><div><div class="muted" style="font-size:11px;margin-bottom:6px">QR TOKEN</div><div class="qrwrap" id="qr"></div></div></div>'}
function imm(c){
 var opts=Object.keys(MWL.VACCINES).map(function(v){return '<option>'+esc(v)+'</option>'}).join('');
 var rows=c.imm.filter(function(i){return !i.void}).sort(function(a,b){return a.date<b.date?-1:1}).map(function(i){return '<tr><td><b>'+esc(i.vaccine)+'</b></td><td>'+(i.dose==null?'–':doseLabel(i.dose))+'</td><td>'+MWL.fmt(i.date)+'</td><td>'+esc(i.by)+'<div class="muted">'+esc(i.facility)+'</div></td><td>'+esc(i.batch||'–')+'</td><td><span class="status good">Completed</span></td></tr>'}).join('')||'<tr><td colspan="6" class="muted">No vaccines recorded.</td></tr>';
 var due=MWL.dueList(c).slice(0,8).map(function(d){return '<div class="flag"><div><b>'+esc(d.vaccine)+'</b> · '+doseLabel(d.dose)+'<br><span class="muted">Due '+MWL.fmt(d.due)+'</span></div><span class="status '+(d.overdue?'late':'due')+'">'+(d.overdue?'Overdue':'Upcoming')+'</span></div>'}).join('')||'<div class="empty">All scheduled doses are complete.</div>';
 return '<h2 style="font-size:14px;margin:0 0 10px">Record a vaccine</h2><div class="iform"><div class="field"><label for="iv">Vaccine</label><select id="iv">'+opts+'</select></div><div class="field" id="dw"><label for="idose">Dose</label><select id="idose"></select></div><div class="field hidden" id="ow"><label for="iother">Vaccine name</label><input id="iother" type="text"></div><div class="field"><label for="idate">Date given</label><input id="idate" type="date" value="'+MWL.TODAY+'" min="'+c.dob+'" max="'+MWL.TODAY+'"></div><div class="field"><label for="ibatch">Batch (optional)</label><input id="ibatch" type="text"></div></div><div class="ierr" id="ierr" role="alert"></div><button class="btn primary" data-save="1">Save as completed</button><div class="notice">Saved doses are marked Completed automatically, with the date, health worker and facility recorded. Duplicate doses are blocked.</div>'+
 '<h2 style="font-size:14px;margin:18px 0 8px">Immunisation history</h2><div class="table-wrap"><table><thead><tr><th>Vaccine</th><th>Dose</th><th>Date</th><th>Given by</th><th>Batch</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
 '<h2 style="font-size:14px;margin:18px 0 4px">Due and overdue</h2>'+due+'<p>Schedule is prototype configuration and must be verified against current Zambian EPI guidance.</p>'}
function hist(c){var r=MWL.db.audit.filter(function(a){return a.childId===c.id}).map(function(a){return '<tr><td>'+a.time.slice(0,16).replace('T',' ')+'</td><td>'+esc(a.action)+'</td><td>'+esc(a.detail)+'</td><td>'+esc(a.by)+'</td></tr>'}).join('')||'<tr><td colspan="4" class="muted">No changes recorded yet.</td></tr>';
 return '<div class="table-wrap"><table><thead><tr><th>Time</th><th>Action</th><th>Detail</th><th>By</th></tr></thead><tbody>'+r+'</tbody></table></div>'}
function dose(){var v=$('#iv').value,d=MWL.VACCINES[v];$('#dw').classList.toggle('hidden',!d);$('#ow').classList.toggle('hidden',!!d);if(d)$('#idose').innerHTML=d.map(function(x){return '<option value="'+x+'">'+doseLabel(x)+'</option>'}).join('')}
function save(){
 var c=MWL.getChild(cid),v=$('#iv').value,other=!MWL.VACCINES[v],name=other?$('#iother').value.trim():v,d=other?null:+$('#idose').value,date=$('#idate').value,e=$('#ierr');
 if(!name){e.textContent='Enter the vaccine name.';return}
 if(!date||date<c.dob||date>MWL.TODAY){e.textContent='Date must be between the child’s birth and today.';return}
 var dup=c.imm.some(function(i){return !i.void&&i.vaccine===name&&(other?i.date===date:i.dose===d)});
 if(dup){e.textContent=other?'This vaccine is already recorded for that date.':name+' '+doseLabel(d).toLowerCase()+' is already recorded. Duplicate blocked.';return}
 c.imm.push({vaccine:name,dose:d,date:date,by:MWL.STAFF,facility:MWL.FACILITY,batch:$('#ibatch').value.trim(),notes:''});
 c.lastFacility=MWL.FACILITY;MWL.audit('Immunisation recorded',c.id,name+(other?'':' '+doseLabel(d))+' on '+date);toast('Saved as completed.');show()}
document.addEventListener('click',function(e){
 var o=e.target.closest('[data-open]'),vf=e.target.closest('[data-verify]'),t=e.target.closest('[data-tab]'),b=e.target.closest('[data-back]'),s=e.target.closest('[data-save]');
 if(o){e.stopPropagation();cid=o.getAttribute('data-open');tab='overview';show()}
 else if(vf){e.stopPropagation();var ck=$('#vf');if(!ck||!ck.checked){toast('Please confirm identity verification first.');return}cid=vf.getAttribute('data-verify');MWL.audit('Record retrieved',cid,'Opened after identity verification');tab='overview';show()}
 else if(t){tab=t.getAttribute('data-tab');show()}
 else if(b){var n=document.querySelector('[data-page="records"]');if(n)n.click()}
 else if(s)save()},true);
document.addEventListener('change',function(e){if(e.target.id==='iv')dose()});
})();
