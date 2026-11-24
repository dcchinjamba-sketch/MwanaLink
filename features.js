(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc,mine='';
var st=document.createElement('style');
st.textContent='.xt{width:100%;min-height:76px;padding:10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink);font:inherit;font-size:13px}.xl{display:block;font-size:11px;font-weight:750;color:var(--muted);margin:12px 0 4px}.xs{padding:7px 0;border-bottom:1px solid var(--line);font-size:12px}.xs:last-child{border:0}.xm{margin-bottom:12px}';
document.head.appendChild(st);
var SC={Sent:'due',Received:'info',Completed:'good'},UC={Emergency:'late',Urgent:'due',Routine:'info'},LB={Sent:'Awaiting receipt',Received:'Received',Completed:'Counter-referral recorded'};
function toast(t){var r=$('#toastRoot');r.innerHTML='<div class="toast">'+esc(t)+'</div>';setTimeout(function(){r.innerHTML=''},3200)}
function sup(){return document.body.classList.contains('is-super')}
function R(){var d=MWL.db;if(!d.referrals)d.referrals=[];return d.referrals}
function get(id){return R().filter(function(x){return x.id===id})[0]}
function curId(){var m=$('.profile-meta'),r=m&&/MWL-[A-Z0-9]+/.exec(m.textContent);return r?r[0]:null}
function now(){return new Date().toISOString()}
function ts(t){return t.slice(0,16).replace('T',' ')}
function val(id){var e=$('#'+id);return e?e.value.trim():''}
function n(x){return x==null?'':String(x)}
function fv(x){return n(x)===''?'(blank)':n(x)}
function dl(d){return d===0?'Birth dose 0':'Dose '+d}
function snap(o){var s={};Object.keys(o).forEach(function(k){if(k!=='orig'&&k!=='corrected')s[k]=o[k]});return s}
function modal(h){closeM();var d=document.createElement('div');d.className='mback';d.id='xm';d.innerHTML='<div class="mbox" role="dialog" aria-modal="true">'+h+'</div>';document.body.appendChild(d)}
function closeM(){var d=$('#xm');if(d)d.remove()}
function refresh(){var b=mine&&$('.tabs [data-tab="'+mine+'"]');if(b)b.click()}
function fld(id,l,t,v,x){return '<div class="field"><label for="'+id+'">'+l+'</label><input id="'+id+'" type="'+t+'" value="'+esc(n(v))+'" '+(x||'')+' autocomplete="off"></div>'}
function sel(id,l,o,v){return '<div class="field"><label for="'+id+'">'+l+'</label><select id="'+id+'">'+o.map(function(x){var a=Array.isArray(x)?x:[x,x];return '<option value="'+esc(a[0])+'"'+(String(a[0])===String(v)?' selected':'')+'>'+esc(a[1])+'</option>'}).join('')+'</select></div>'}
function badges(r){return '<span class="status '+(UC[r.urgency]||'info')+'">'+esc(r.urgency)+'</span> <span class="status '+SC[r.status]+'">'+LB[r.status]+'</span>'}
function ch(a){return a.filter(function(x){return n(x[1])!==n(x[2])}).map(function(x){return{f:x[0],from:x[1],to:x[2]}})}

/* ===== Referrals ===== */
function refPanel(c){
 var f=sup()?c.lastFacility:MWL.FACILITY,fs=(MWL.db.facilities||[]).map(function(x){return x.name}).filter(function(x){return x!==f});fs.push('Other (not listed)');
 var L=R().filter(function(r){return r.childId===c.id}).sort(function(a,b){return a.events[0].time<b.events[0].time?1:-1});
 var rows=L.map(function(r){return '<tr><td>'+MWL.fmt(r.date)+'</td><td>'+esc(r.from)+' → '+esc(r.to)+'</td><td>'+esc(r.reason)+'</td><td>'+badges(r)+'</td><td><button class="btn secondary small" data-rview="'+r.id+'">View</button></td></tr>'}).join('')||'<tr><td colspan="5" class="muted">No referrals for this child.</td></tr>';
 return '<h2 style="font-size:14px;margin:0 0 10px">Refer this child</h2><div class="formgrid">'+sel('rto','Receiving facility',fs)+'<div class="field hidden" id="rotw"><label for="rot">Facility name</label><input id="rot" maxlength="60" autocomplete="off"></div>'+sel('rur','Urgency',['Routine','Urgent','Emergency'])+fld('rre','Reason for referral','text','','maxlength="120"')+'<div class="field full"><label for="rsu">Clinical summary</label><textarea id="rsu" class="xt" maxlength="800"></textarea></div>'+fld('rfu','Follow-up required (optional)','text','','maxlength="160"')+'</div><div class="ierr" id="xerr" role="alert"></div><button class="btn primary" data-rsend="1">Send referral</button><h2 style="font-size:14px;margin:18px 0 8px">Referral history</h2><div class="table-wrap"><table><thead><tr><th>Date</th><th>From → To</th><th>Reason</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'}
function send(){
 var c=MWL.getChild(curId()),e=$('#xerr'),to=val('rto'),re=val('rre'),su=val('rsu'),from=sup()?c.lastFacility:MWL.FACILITY;
 if(to==='Other (not listed)'){to=val('rot');if(to.length<3){e.textContent='Enter the receiving facility name.';return}}
 if(re.length<5){e.textContent='Enter the reason for referral.';return}
 if(su.length<10){e.textContent='Enter a clinical summary (at least 10 characters).';return}
 if(to.toLowerCase()===from.toLowerCase()){e.textContent='The receiving facility must be different from the referring facility.';return}
 var cs='ABCDEFGHJKMNPQRSTUVWXYZ23456789',a=crypto.getRandomValues(new Uint8Array(6)),id='REF-'+Array.prototype.map.call(a,function(b){return cs[b%cs.length]}).join('');
 var r={id:id,childId:c.id,childName:c.name,from:from,to:to,date:MWL.TODAY,urgency:val('rur'),reason:re,summary:su,followup:val('rfu'),by:MWL.STAFF,status:'Sent',outcome:'',counter:'',followup2:'',events:[{time:now(),by:MWL.STAFF,facility:from,action:'Referral sent',note:re}]};
 R().push(r);MWL.audit('Referral sent',c.id,id+': '+from+' → '+to+' ('+r.urgency+'). '+re);toast('Referral sent to '+to+'.');refresh()}
function detail(id){
 var r=get(id);if(!r)return;var can=sup()||r.to===MWL.FACILITY;
 var h='<h2>Referral '+esc(r.id)+'</h2><p>'+badges(r)+'</p><div class="kv xm">'+[['Child',r.childName+' · '+r.childId],['Date',MWL.fmt(r.date)],['Referring facility',r.from],['Receiving facility',r.to],['Referred by',r.by],['Reason',r.reason]].map(function(x){return '<div><small>'+x[0]+'</small><b>'+esc(x[1])+'</b></div>'}).join('')+'</div><div class="xl">Clinical summary</div><p>'+esc(r.summary)+'</p>'+(r.followup?'<div class="xl">Follow-up requested by referring facility</div><p>'+esc(r.followup)+'</p>':'');
 if(r.status==='Completed')h+='<div class="notice"><b>Counter-referral:</b> '+esc(r.outcome)+'<br>'+esc(r.counter)+(r.followup2?'<br><b>Follow-up required:</b> '+esc(r.followup2):'')+'</div>';
 h+='<div class="xl">Trail</div>'+r.events.map(function(x){return '<div class="xs"><b>'+esc(x.action)+'</b> · '+ts(x.time)+'<br><span class="muted">'+esc(x.by)+' · '+esc(x.facility)+'</span>'+(x.note?'<br>'+esc(x.note):'')+'</div>'}).join('');
 if(can&&r.status==='Sent')h+='<p><button class="btn secondary" data-rack="'+id+'">Acknowledge receipt</button></p>';
 if(can&&r.status!=='Completed')h+='<div class="xl" style="margin-top:16px">Record outcome and counter-referral</div>'+sel('xo','Outcome',['Treated and discharged','Admitted','Referred onward','Needs follow-up at referring facility','Child did not attend'])+'<div class="field"><label for="xc">Counter-referral details</label><textarea id="xc" class="xt" maxlength="800"></textarea></div>'+fld('xf','Follow-up required at referring facility (optional)','text','','maxlength="160"')+fld('xd','Follow-up appointment date (optional)','date','','min="'+MWL.TODAY+'"')+'<div class="ierr" id="xerr" role="alert"></div><button class="btn primary" data-rout="'+id+'">Save counter-referral</button> ';
 modal(h+'<button class="btn outline" data-xclose="1">Close</button>')}
function afterRef(id){if($('#xpage'))showPage();else refresh();detail(id)}
function rcv(r){r.status='Received';r.receivedBy=MWL.STAFF;r.events.push({time:now(),by:MWL.STAFF,facility:MWL.FACILITY,action:'Referral received',note:''})}
function ack(id){var r=get(id);if(!r||r.status!=='Sent')return;rcv(r);MWL.audit('Referral received',r.childId,r.id+' acknowledged by '+r.to);toast('Receipt acknowledged.');afterRef(id)}
function out(id){
 var r=get(id),c=MWL.getChild(r.childId),e=$('#xerr'),o=val('xo'),tx=val('xc'),fu=val('xf'),dt=val('xd');
 if(tx.length<5){e.textContent='Enter the counter-referral details.';return}
 if(dt&&dt<MWL.TODAY){e.textContent='Choose a follow-up date today or later.';return}
 if(r.status==='Sent')rcv(r);
 r.status='Completed';r.outcome=o;r.counter=tx;r.followup2=fu;
 r.events.push({time:now(),by:MWL.STAFF,facility:MWL.FACILITY,action:'Counter-referral recorded',note:o+'. '+tx+(fu?' Follow-up: '+fu:'')});
 if(dt&&c)c.appts.push({type:'Referral follow-up',date:dt,status:'confirmed',attended:false,by:MWL.STAFF,facility:MWL.FACILITY});
 MWL.audit('Counter-referral recorded',r.childId,r.id+' ('+r.to+' → '+r.from+'): '+o);toast('Counter-referral recorded.');afterRef(id)}
function openChild(id){
 var c=MWL.getChild(id),l=$('[data-page="lookup"]');if(!c||!l)return;
 l.click();$('#lq').value=c.nrc;$('[data-act="find"]').click();
 var vf=$('#vf'),b=$('[data-verify="'+id+'"]');
 if(vf&&b){vf.checked=true;MWL.audit('Record opened via referral',id,'Receiving facility opened referred child');b.click()}else toast('Record not found.')}
function stat(l,i,v){return '<div class="stat"><div class="stat-top">'+l+'<span class="stat-icon">'+i+'</span></div><strong>'+v+'</strong></div>'}
function showPage(){
 var m=$('#main'),f=MWL.FACILITY,S=sup(),L=R().slice().sort(function(a,b){return a.events[0].time<b.events[0].time?1:-1}),
 inc=S?L:L.filter(function(r){return r.to===f}),outg=S?[]:L.filter(function(r){return r.from===f}),
 op=function(a){return a.filter(function(r){return r.status!=='Completed'}).length};
 function tb(a,i){return '<div class="table-wrap"><table><thead><tr><th>Date</th><th>Child</th><th>From → To</th><th>Reason</th><th>Status</th><th></th></tr></thead><tbody>'+(a.map(function(r){return '<tr><td>'+MWL.fmt(r.date)+'</td><td><div class="child-name">'+esc(r.childName)+'</div><div class="muted">'+esc(r.childId)+'</div></td><td>'+esc(r.from)+' → '+esc(r.to)+'</td><td>'+esc(r.reason)+'</td><td>'+badges(r)+'</td><td><button class="btn secondary small" data-rview="'+r.id+'">View</button> '+(i?'<button class="btn outline small" data-rop="'+esc(r.childId)+'">Open record</button>':'')+'</td></tr>'}).join('')||'<tr><td colspan="6" class="muted">None.</td></tr>')+'</tbody></table></div>'}
 m.innerHTML='<div id="xpage"></div><div class="welcome"><div><div class="eyebrow">Health facility workspace</div><h1>Referrals</h1><div class="sub">Referrals sent and received, with counter-referrals. To refer a child, open the child’s record and use the Referrals tab.</div></div></div><div class="grid stats">'+stat('Incoming awaiting action','↓',op(inc))+stat('Outgoing awaiting outcome','↑',op(outg))+stat('Referrals sent','⇄',S?L.length:outg.length)+stat('Counter-referrals received','✓',(S?L:outg).filter(function(r){return r.status==='Completed'}).length)+'</div><div class="card"><div class="card-head"><h2>'+(S?'All referrals':'Incoming referrals')+'</h2></div>'+tb(inc,true)+'</div>'+(S?'':'<div class="card"><div class="card-head"><h2>Outgoing referrals</h2></div>'+tb(outg,false)+'</div>');
 document.querySelectorAll('#sidenav .nav,#mnav .nav').forEach(function(b){b.classList.toggle('active',b.hasAttribute('data-ref'))});window.scrollTo(0,0)}

/* ===== Corrections ===== */
function corrPanel(c){
 var cs=c.corrections||[];
 var im=c.imm.map(function(i,ix){return{i:i,ix:ix}}).filter(function(x){return !x.i.void}).map(function(x){var i=x.i;return '<tr><td><b>'+esc(i.vaccine)+'</b> '+(i.dose==null?'':dl(i.dose))+(i.corrected?' <span class="status info">Corrected</span>':'')+'</td><td>'+MWL.fmt(i.date)+'</td><td>'+esc(i.batch||'–')+'</td><td><button class="btn outline small" data-ccor="imm:'+x.ix+'">Correct</button></td></tr>'}).join('')||'<tr><td colspan="4" class="muted">No immunisations.</td></tr>';
 var gr=c.growth.map(function(g,ix){return '<tr><td>'+MWL.fmt(g.date)+(g.corrected?' <span class="status info">Corrected</span>':'')+'</td><td>'+g.weight+' kg</td><td>'+(g.length!=null?g.length+' cm':'–')+'</td><td>'+(g.muac!=null?g.muac+' cm':'–')+'</td><td><button class="btn outline small" data-ccor="gr:'+ix+'">Correct</button></td></tr>'}).join('')||'<tr><td colspan="5" class="muted">No measurements.</td></tr>';
 var hi=cs.slice().reverse().map(function(x){return '<div class="xs"><b>'+esc(x.target)+'</b> <span class="status '+(x.kind==='removed'?'late':'info')+'">'+(x.kind==='removed'?'Removed':'Corrected')+'</span><br><span class="muted">'+ts(x.time)+' · '+esc(x.by)+' · '+esc(x.facility)+'</span><br>'+x.changes.map(function(k){return esc(k.f)+': '+esc(fv(k.to))+' <span class="muted">(was '+esc(fv(k.from))+')</span>'}).join('<br>')+'<br><i>Reason: '+esc(x.reason)+'</i></div>'}).join('')||'<p class="muted">No corrections yet.</p>';
 return '<div class="notice">Corrections never erase history. The original is kept, a reason is required, and each correction is logged with who made it and when.</div><h2 style="font-size:14px;margin:0 0 10px">Child details</h2><div class="kv"><div><small>Name</small><b>'+esc(c.name)+'</b></div><div><small>Sex</small><b>'+(c.sex==='F'?'Female':'Male')+'</b></div><div><small>Date of birth</small><b>'+MWL.fmt(c.dob)+'</b></div><div><small>Guardian</small><b>'+esc(c.guardian)+'</b></div><div><small>Phone</small><b>'+esc(c.phone)+'</b></div><div><small>NRC</small><b>'+esc(c.nrc)+'</b></div></div><p><button class="btn outline small" data-ccor="det">Correct details</button></p><h2 style="font-size:14px;margin:16px 0 8px">Immunisations</h2><div class="table-wrap"><table><thead><tr><th>Vaccine</th><th>Date given</th><th>Batch</th><th></th></tr></thead><tbody>'+im+'</tbody></table></div><h2 style="font-size:14px;margin:16px 0 8px">Growth measurements</h2><div class="table-wrap"><table><thead><tr><th>Date</th><th>Weight</th><th>Length/height</th><th>MUAC</th><th></th></tr></thead><tbody>'+gr+'</tbody></table></div><h2 style="font-size:14px;margin:16px 0 8px">Correction history</h2>'+hi}
function reasonBox(){return fld('crs','Reason for correction (required)','text','','maxlength="140"')+'<div class="ierr" id="xerr" role="alert"></div>'}
function btns(k){return '<button class="btn primary" data-csave="'+k+'">Save correction</button> <button class="btn outline" data-xclose="1">Cancel</button>'}
function logC(c,target,kind,why,changes){
 if(!c.corrections)c.corrections=[];
 c.corrections.push({time:now(),by:MWL.STAFF,facility:MWL.FACILITY,target:target,kind:kind,reason:why,changes:changes});c.lastFacility=MWL.FACILITY;
 MWL.audit(kind==='removed'?'Entry removed (entered in error)':'Record corrected',c.id,target+': '+changes.map(function(x){return x.f+' '+fv(x.from)+' → '+fv(x.to)}).join('; ')+'. Reason: '+why);
 toast(kind==='removed'?'Entry removed from the record. The original is kept in the history.':'Correction saved. The original is kept in the history.');closeM();refresh()}
function cDet(c){modal('<h2>Correct child details</h2><p class="sub">Original values stay in the correction history.</p>'+fld('cn','Child full name','text',c.name,'maxlength="80"')+sel('cs','Sex',[['F','Female'],['M','Male']],c.sex)+fld('cd','Date of birth','date',c.dob,'max="'+MWL.TODAY+'"')+fld('cg','Guardian full name','text',c.guardian,'maxlength="80"')+fld('cp','Guardian phone','tel',c.phone)+fld('cr','Guardian NRC','text',c.nrc)+reasonBox()+btns('det'))}
function sDet(c){
 var e=$('#xerr'),nm=val('cn'),s=val('cs'),d=val('cd'),g=val('cg'),p=val('cp'),r=val('cr'),why=val('crs');
 if(why.length<5){e.textContent='Enter the reason for the correction (at least 5 characters).';return}
 if(nm.length<2||g.length<2){e.textContent='The child’s name and the guardian’s name are required.';return}
 if(!d||d>MWL.TODAY){e.textContent='Enter a valid date of birth.';return}
 if(!/^\d{6}\/\d{2}\/\d$/.test(r)){e.textContent='Enter the NRC like 123456/10/1.';return}
 if(!/^[0-9+ ]{9,15}$/.test(p)){e.textContent='Enter a valid phone number.';return}
 var ds=c.imm.filter(function(i){return !i.void}).map(function(i){return i.date}).concat(c.growth.map(function(x){return x.date})).sort()[0];
 if(ds&&d>ds){e.textContent='Date of birth cannot be after existing records (earliest '+MWL.fmt(ds)+'). Correct those entries first.';return}
 if(MWL.db.children.some(function(x){return x.id!==c.id&&x.nrc===r&&x.dob===d&&x.name.toLowerCase()===nm.toLowerCase()})){e.textContent='Another record already has this name, date of birth and NRC.';return}
 var chg=ch([['Name',c.name,nm],['Sex',c.sex==='F'?'Female':'Male',s==='F'?'Female':'Male'],['Date of birth',c.dob,d],['Guardian',c.guardian,g],['Phone',c.phone,p],['NRC',c.nrc,r]]);
 if(!chg.length){e.textContent='No changes made.';return}
 if(!c.origDetails)c.origDetails={name:c.name,sex:c.sex,dob:c.dob,guardian:c.guardian,phone:c.phone,nrc:c.nrc};
 var old=c.name;c.name=nm;c.sex=s;c.dob=d;c.guardian=g;c.phone=p;c.nrc=r;logC(c,'Child details ('+old+')','corrected',why,chg)}
function cImm(c,ix){
 var i=c.imm[ix],d=MWL.VACCINES[i.vaccine];
 modal('<h2>Correct immunisation</h2><p><b>'+esc(i.vaccine)+(i.dose==null?'':' · '+dl(i.dose))+'</b></p>'+(d?sel('cdo','Dose',d.map(function(x){return[x,dl(x)]}),i.dose):'')+fld('cdt','Date given','date',i.date,'min="'+c.dob+'" max="'+MWL.TODAY+'"')+fld('cb','Batch (optional)','text',i.batch||'')+'<label class="check"><input type="checkbox" id="cvoid"> This entry was made in error: remove it from the record</label>'+reasonBox()+btns('imm:'+ix))}
function sImm(c,ix){
 var i=c.imm[ix],e=$('#xerr'),why=val('crs'),d=MWL.VACCINES[i.vaccine],tg=i.vaccine+(i.dose==null?'':' '+dl(i.dose));
 if(why.length<5){e.textContent='Enter the reason for the correction (at least 5 characters).';return}
 if(!i.orig)i.orig=snap(i);
 if($('#cvoid').checked){i.void=true;i.voidReason=why;logC(c,'Immunisation '+tg,'removed',why,[{f:'Entry',from:tg+' on '+MWL.fmt(i.date),to:'Removed (entered in error)'}]);return}
 var nd=d?+val('cdo'):i.dose,dt=val('cdt'),b=val('cb');
 if(!dt||dt<c.dob||dt>MWL.TODAY){e.textContent='Date must be between the child’s birth and today.';return}
 if(d&&c.imm.some(function(x){return x!==i&&!x.void&&x.vaccine===i.vaccine&&x.dose===nd})){e.textContent=i.vaccine+' '+dl(nd).toLowerCase()+' is already recorded. Duplicate blocked.';return}
 var chg=ch([['Dose',i.dose==null?'':dl(i.dose),nd==null?'':dl(nd)],['Date given',i.date,dt],['Batch',i.batch||'',b]]);
 if(!chg.length){e.textContent='No changes made.';return}
 i.dose=nd;i.date=dt;i.batch=b;i.corrected=true;logC(c,'Immunisation '+tg,'corrected',why,chg)}
function cGr(c,ix){
 var g=c.growth[ix];
 modal('<h2>Correct growth measurement</h2>'+fld('cgd','Date','date',g.date,'min="'+c.dob+'" max="'+MWL.TODAY+'"')+fld('cgw','Weight (kg)','number',g.weight,'step="0.01"')+fld('cgl','Length/height (cm)','number',g.length,'step="0.1"')+sel('cgm','Measured',[['lying','Lying (length)'],['standing','Standing (height)']],g.method)+fld('cgu','MUAC (cm, optional)','number',g.muac,'step="0.1"')+reasonBox()+btns('gr:'+ix))}
function sGr(c,ix){
 var g=c.growth[ix],e=$('#xerr'),why=val('crs'),d=val('cgd'),w=+val('cgw'),l=val('cgl')===''?null:+val('cgl'),u=val('cgu')===''?null:+val('cgu'),m=val('cgm');
 if(why.length<5){e.textContent='Enter the reason for the correction (at least 5 characters).';return}
 if(!d||d<c.dob||d>MWL.TODAY){e.textContent='Choose a date between the child’s birth and today.';return}
 if(!(w>=0.5&&w<=30)){e.textContent='Enter a weight between 0.5 and 30 kg.';return}
 if(l!=null&&!(l>=30&&l<=125)){e.textContent='Length/height must be between 30 and 125 cm.';return}
 if(u!=null&&!(u>=5&&u<=25)){e.textContent='MUAC must be between 5 and 25 cm.';return}
 if(c.growth.some(function(x,k){return k!==ix&&x.date===d})){e.textContent='A measurement for this date already exists.';return}
 var chg=ch([['Date',g.date,d],['Weight (kg)',g.weight,w],['Length/height (cm)',g.length,l],['Measuring method',g.method,m],['MUAC (cm)',g.muac,u]]);
 if(!chg.length){e.textContent='No changes made.';return}
 if(!g.orig)g.orig=snap(g);
 var tg='Growth measurement of '+MWL.fmt(g.date);g.date=d;g.weight=w;g.length=l;g.method=m;g.muac=u;g.corrected=true;logC(c,tg,'corrected',why,chg)}

/* ===== Wiring ===== */
window.addEventListener('click',function(e){
 var t=e.target.closest('[data-tab]');
 if(t){var k=t.getAttribute('data-tab');mine=(k==='refs'||k==='corr')?k:''}
 else if(e.target.closest('[data-open],[data-verify],[data-back],[data-page],[data-ref]'))mine=''},true);
document.addEventListener('click',function(e){var t;
 if(e.target.closest('[data-xclose]'))closeM();
 else if(e.target.closest('[data-ref]'))showPage();
 else if((t=e.target.closest('[data-rview]')))detail(t.getAttribute('data-rview'));
 else if((t=e.target.closest('[data-rack]')))ack(t.getAttribute('data-rack'));
 else if((t=e.target.closest('[data-rout]')))out(t.getAttribute('data-rout'));
 else if(e.target.closest('[data-rsend]'))send();
 else if((t=e.target.closest('[data-rop]'))){closeM();openChild(t.getAttribute('data-rop'))}
 else if((t=e.target.closest('[data-ccor]'))){var p=t.getAttribute('data-ccor').split(':'),c=MWL.getChild(curId());if(c){if(p[0]==='det')cDet(c);else if(p[0]==='imm')cImm(c,+p[1]);else cGr(c,+p[1])}}
 else if((t=e.target.closest('[data-csave]'))){var q=t.getAttribute('data-csave').split(':'),c2=MWL.getChild(curId());if(c2){if(q[0]==='det')sDet(c2);else if(q[0]==='imm')sImm(c2,+q[1]);else sGr(c2,+q[1])}}});
document.addEventListener('change',function(e){if(e.target.id==='rto'){var w=$('#rotw');if(w)w.classList.toggle('hidden',e.target.value!=='Other (not listed)')}});
function navInject(){document.querySelectorAll('#sidenav,#mnav').forEach(function(nv){if(nv.querySelector('[data-ref]'))return;var l=nv.querySelector('[data-page="lookup"]');if(!l)return;l.insertAdjacentHTML('afterend','<button class="nav" data-ref="1">'+(nv.id==='sidenav'?'<span class="ico">⇄</span> ':'')+'Referrals</button>')})}
function patch(){
 var m=$('#main');if(!m||document.body.classList.contains('is-guardian'))return;
 var tabs=m.querySelector('.tabs'),fac=m.querySelector('.profile-actions [data-back]');
 if(tabs&&fac){
  if(!tabs.querySelector('[data-tab="refs"]'))tabs.insertAdjacentHTML('beforeend','<button class="tab" data-tab="refs">Referrals</button><button class="tab" data-tab="corr">Corrections</button>');
  if(mine){tabs.querySelectorAll('.tab').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-tab')===mine)});
   var e=m.querySelector('.empty');
   if(e&&!m.querySelector('#xwrap')&&/later step/.test(e.textContent)){var w=document.createElement('div');w.id='xwrap';e.replaceWith(w);var c=MWL.getChild(curId());if(c)w.innerHTML=mine==='refs'?refPanel(c):corrPanel(c)}}}
 var h1=m.querySelector('h1');
 if(h1&&h1.textContent==='Dashboard'&&m.querySelector('#scanCard')&&!m.querySelector('#refDash')){
  var f=MWL.FACILITY,S=sup(),L=R(),a=L.filter(function(r){return(S||r.to===f)&&r.status!=='Completed'}).length,b=S?0:L.filter(function(r){return r.from===f&&r.status!=='Completed'}).length,d=L.filter(function(r){return(S||r.from===f)&&r.status==='Completed'}).length;
  m.querySelector('#scanCard').insertAdjacentHTML('afterend','<div class="card" id="refDash"><div class="card-head"><h2>Referrals</h2></div><p><b>'+a+'</b> '+(S?'open':'incoming awaiting action')+(S?'':' · <b>'+b+'</b> outgoing awaiting outcome')+' · <b>'+d+'</b> counter-referral(s) '+(S?'recorded':'received')+'</p><button class="btn primary" data-ref="1">Open referrals</button></div>')}
 var pw=m.querySelector('#pwrap');
 if(pw&&!pw.querySelector('#pref')){var act=pw.querySelector('.tab.active'),meta=pw.querySelector('.profile-meta'),tb=pw.querySelector('.tabs');
  if(act&&act.getAttribute('data-ptab')==='overview'&&meta&&tb){var id=(/MWL-[A-Z0-9]+/.exec(meta.textContent)||[])[0],L2=R().filter(function(r){return r.childId===id});
   if(L2.length)tb.insertAdjacentHTML('afterend','<div id="pref"><h2 style="font-size:14px;margin:12px 0 4px">Referrals</h2>'+L2.map(function(r){return '<div class="flag"><div><b>'+esc(r.reason)+'</b><br><span class="muted">'+MWL.fmt(r.date)+' · '+esc(r.from)+' → '+esc(r.to)+'</span>'+(r.status==='Completed'?'<br>Outcome: '+esc(r.outcome)+(r.followup2?'. Follow-up: '+esc(r.followup2):''):'')+'</div><span class="status '+SC[r.status]+'">'+LB[r.status]+'</span></div>'}).join('')+'</div>')}}}
['#sidenav','#mnav'].forEach(function(s){new MutationObserver(navInject).observe($(s),{childList:true})});
new MutationObserver(patch).observe($('#main'),{childList:true,subtree:true});
navInject();
})();
