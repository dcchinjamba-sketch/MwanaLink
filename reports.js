(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc,month=MWL.TODAY.slice(0,7);
var st=document.createElement('style');
st.textContent='.rbar{display:flex;gap:10px;flex-wrap:wrap;align-items:end;margin-bottom:14px}.rbar .field{flex:0 1 210px;margin:0}.num{text-align:right;font-variant-numeric:tabular-nums}.tot td{font-weight:800;background:var(--soft)}.profile-actions{display:flex;gap:6px;flex-wrap:wrap}';
document.head.appendChild(st);
function toast(t){var r=$('#toastRoot');r.innerHTML='<div class="toast">'+esc(t)+'</div>';setTimeout(function(){r.innerHTML=''},2800)}
function dn(d){return d===0?'Birth dose 0':'Dose '+d}
function sh(d){return d===0?'D0':'D'+d}
/* Under-one doses = every scheduled dose due by 365 days. Prototype configuration: verify against current Zambian EPI guidance. */
var UNDER1=MWL.SCHEDULE.filter(function(s){return s[2]<=365});
function has(c,v,d,by){return c.imm.some(function(i){return !i.void&&i.vaccine===v&&i.dose===d&&(!by||i.date<=by)})}
function full1(c){var by=MWL.addDays(c.dob,365);return UNDER1.every(function(s){return has(c,s[0],s[1],by)})}
function overdue(c){return MWL.dueList(c).filter(function(d){return d.overdue})}
function mlabel(m){return new Date(m+'-01T00:00:00').toLocaleDateString('en-GB',{month:'long',year:'numeric'})}
function monthly(m){var names=[],o={};MWL.SCHEDULE.forEach(function(s){if(names.indexOf(s[0])<0)names.push(s[0])});names.push('Other (non-routine)');names.forEach(function(n){o[n]={t:0,d:{}}});
 MWL.db.children.forEach(function(c){c.imm.forEach(function(i){if(i.void||i.date.slice(0,7)!==m)return;var k=o[i.vaccine]?i.vaccine:'Other (non-routine)',key=i.dose==null?'–':sh(i.dose);o[k].t++;o[k].d[key]=(o[k].d[key]||0)+1})});
 return names.map(function(n){var b=Object.keys(o[n].d).sort().map(function(k){return k+': '+o[n].d[k]}).join(', ');return{n:n,t:o[n].t,b:b||'–'}})}
function summary(){var k=MWL.db.children,u1=k.filter(function(c){return MWL.ageMonths(c.dob)<12});
 return{n:k.length,u1:u1.length,u1ok:u1.filter(function(c){return !overdue(c).length}).length,full:k.filter(full1).length,missed:k.filter(function(c){return overdue(c).length>0}).sort(function(a,b){return overdue(b).length-overdue(a).length})}}
function stat(l,i,v,s){return '<div class="stat"><div class="stat-top">'+l+'<span class="stat-icon">'+i+'</span></div><strong>'+v+'</strong><small>'+s+'</small></div>'}
function panel(){
 var m=monthly(month),s=summary(),tot=m.reduce(function(a,x){return a+x.t},0);
 var vt=m.map(function(x){return '<tr><td><b>'+esc(x.n)+'</b></td><td class="num">'+x.t+'</td><td>'+esc(x.b)+'</td></tr>'}).join('')+'<tr class="tot"><td>Total doses given</td><td class="num">'+tot+'</td><td></td></tr>';
 var mt=s.missed.map(function(c){var od=overdue(c),txt=od.slice(0,3).map(function(d){return esc(d.vaccine)+' '+(d.dose===0?'dose 0':'dose '+d.dose)}).join(', ')+(od.length>3?' +'+(od.length-3)+' more':'');
  return '<tr><td><div class="child-name">'+esc(c.name)+'</div><div class="muted">'+esc(c.id)+' · '+MWL.ageText(c.dob)+'</div></td><td>'+esc(c.guardian)+'<div class="muted">'+esc(c.phone)+'</div></td><td>'+txt+'</td><td><span class="status late">'+od.length+' overdue</span></td><td><button class="btn secondary small" data-open="'+esc(c.id)+'">Open</button></td></tr>'}).join('')||'<tr><td colspan="5" class="muted">No children with overdue doses.</td></tr>';
 var opts=MWL.db.children.map(function(c){return '<option value="'+esc(c.id)+'">'+esc(c.name)+' · '+esc(c.id)+'</option>'}).join('');
 return '<div class="card"><div class="card-head"><h2>Monthly immunisation report</h2><button class="btn outline small" data-rcsv="1">Export CSV</button></div><div class="rbar"><div class="field"><label for="rm">Month</label><input id="rm" type="month" value="'+month+'" max="'+MWL.TODAY.slice(0,7)+'"></div></div>'+
 '<div class="grid stats">'+stat('Doses given in '+mlabel(month),'✓',tot,'All vaccines')+stat('Fully immunised under one','★',s.full,'of '+s.n+' registered children')+stat('Under-1 children up to date','☺',s.u1ok+' / '+s.u1,'No overdue doses')+stat('Missed children','!',s.missed.length,'With overdue doses')+'</div>'+
 '<div class="table-wrap"><table><thead><tr><th>Vaccine</th><th class="num">Doses given</th><th>By dose</th></tr></thead><tbody>'+vt+'</tbody></table></div>'+
 '<div class="notice">“Fully immunised under one” counts children who received every scheduled dose due by 12 months (BCG, OPV 0–3, Pentavalent, PCV, Rotavirus, IPV, MR 1 and MAV 1–3) on or before their first birthday. It and the missed-children list reflect records as of today. The schedule is prototype configuration and must be verified against current Zambian EPI guidance.</div></div>'+
 '<div class="card"><div class="card-head"><h2>Missed children (overdue doses)</h2></div><div class="table-wrap"><table><thead><tr><th>Child</th><th>Guardian</th><th>Overdue doses</th><th>Count</th><th></th></tr></thead><tbody>'+mt+'</tbody></table></div></div>'+
 '<div class="card"><div class="card-head"><h2>Child health report</h2></div><p>Immunisation status and growth patterns for one child. Download it, or print it to PDF.</p><div class="rbar"><div class="field" style="flex:1 1 280px"><label for="rsel">Child</label><select id="rsel">'+opts+'</select></div><button class="btn primary" data-rgo="dl">Download report</button><button class="btn outline" data-rgo="print">Print / PDF</button></div></div>'}
function render(){var w=$('#rwrap');if(w)w.innerHTML=panel()}
function dl(name,mime,text){var b=new Blob([text],{type:mime}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},600)}
function csv(){var q=function(x){return '"'+String(x).replace(/"/g,'""')+'"'},m=monthly(month),s=summary(),L=[['MwanaLink monthly immunisation report',mlabel(month),MWL.FACILITY],['Vaccine','Doses given','By dose']];
 m.forEach(function(x){L.push([x.n,x.t,x.b])});L.push(['Total',m.reduce(function(a,x){return a+x.t},0),''],[],['Children registered',s.n],['Fully immunised under one',s.full],['Under-1 children',s.u1],['Under-1 children up to date',s.u1ok],['Missed children (overdue doses)',s.missed.length]);
 dl('MwanaLink_report_'+month+'.csv','text/csv;charset=utf-8','\ufeff'+L.map(function(r){return r.map(q).join(',')}).join('\r\n'));MWL.audit('Report exported',MWL.FACILITY,'Monthly CSV '+month);toast('CSV downloaded.')}

/* ---------- Child health report ---------- */
var RCSS='*{box-sizing:border-box}:root{--green:#0b6b58;--navy:#173b52;--muted:#5d6f76;--line:#d9e3e1;--card:#fff;--soft:#f4f8f7;--red:#b33d3d;--amber:#a96508}body{font:13px/1.5 system-ui,Arial,sans-serif;color:#1c2d36;max-width:820px;margin:0 auto;padding:24px}h1{font-size:20px;margin:0}h2{font-size:14px;margin:22px 0 8px;color:var(--green);border-bottom:2px solid var(--green);padding-bottom:4px}table{width:100%;border-collapse:collapse;font-size:12px}th{text-align:left;background:var(--soft);color:var(--muted);font-size:10.5px;text-transform:uppercase;padding:6px}td{padding:6px;border-bottom:1px solid var(--line);vertical-align:top}.status{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10.5px;font-weight:700}.good{background:#e8f6ed;color:#237344}.due{background:#fff4df;color:var(--amber)}.late{background:#fff0ef;color:var(--red)}.kv{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.kv div{background:var(--soft);padding:8px;border-radius:6px}.kv small{display:block;color:var(--muted);font-size:10px}.alertbox{border:1px solid var(--red);background:#fff0ef;color:var(--red);padding:8px 10px;border-radius:6px;margin:6px 0}.alertbox.warn{border-color:var(--amber);background:#fff4df;color:var(--amber)}.gsvg{width:100%;height:auto}.gsvg text{fill:#5d6f76;font-size:10px}.note{color:var(--muted);font-size:11px}.np{margin:0 0 14px;padding:8px 14px;background:var(--green);color:#fff;border:0;border-radius:6px;font-size:13px;cursor:pointer}.head{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid var(--green);padding-bottom:10px}@media print{.np{display:none}body{padding:0}}';
function kv(a){return '<div class="kv">'+a.map(function(x){return '<div><small>'+x[0]+'</small><b>'+esc(x[1]||'Not recorded')+'</b></div>'}).join('')+'</div>'}
function rep(c){
 var G=window.MWLG,sch=MWL.SCHEDULE.slice().sort(function(a,b){return a[2]-b[2]}),done=c.imm.filter(function(i){return !i.void}),nOver=overdue(c).length,nDone=0;
 var rows=sch.map(function(s){var due=MWL.addDays(c.dob,s[2]),g=done.filter(function(i){return i.vaccine===s[0]&&i.dose===s[1]})[0],stt=g?['Completed','good']:due<MWL.TODAY?['Overdue','late']:['Upcoming','due'];if(g)nDone++;
  return '<tr><td>'+esc(s[0])+'</td><td>'+dn(s[1])+'</td><td>'+MWL.fmt(due)+'</td><td>'+(g?MWL.fmt(g.date):'–')+'</td><td>'+(g?esc(g.facility)+(g.batch?', batch '+esc(g.batch):''):'–')+'</td><td><span class="status '+stt[1]+'">'+stt[0]+'</span></td></tr>'}).join('');
 var extra=done.filter(function(i){return !sch.some(function(s){return s[0]===i.vaccine&&s[1]===i.dose})}).map(function(i){return '<tr><td>'+esc(i.vaccine)+'</td><td>'+(i.dose==null?'–':dn(i.dose))+'</td><td>–</td><td>'+MWL.fmt(i.date)+'</td><td>'+esc(i.facility)+(i.batch?', batch '+esc(i.batch):'')+'</td><td><span class="status good">Completed</span></td></tr>'}).join('');
 var gr=G.sorted(c).map(function(g){return{g:g,r:G.calc(c,g)}}),al=G.alerts(c);
 var gt=gr.map(function(x){return '<tr><td>'+MWL.fmt(x.g.date)+'</td><td>'+x.r.a.toFixed(1)+'</td><td>'+x.g.weight+' kg</td><td>'+(x.g.length?x.g.length+' → '+x.r.adj.toFixed(1)+' cm ('+x.g.method+')':'–')+'</td><td>'+(x.g.muac!=null?x.g.muac+' cm':'–')+'</td><td>'+G.zcell('waz',x.r.waz)+'</td><td>'+G.zcell('haz',x.r.haz)+'</td><td>'+G.zcell('whz',x.r.whz)+'</td><td>'+G.zcell('baz',x.r.baz)+'</td></tr>'}).join('');
 var ah=al.map(function(a){return '<div class="alertbox'+(a.sev?'':' warn')+'"><b>'+esc(a.t)+'</b><br>'+esc(a.a)+'</div>'}).join('')||'<p>No growth flags on the latest measurement.</p>';
 return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Child Health Report '+esc(c.id)+'</title><style>'+RCSS+'</style></head><body><button class="np" onclick="window.print()">Print / Save as PDF</button>'+
 '<div class="head"><div><h1>MwanaLink</h1><div class="note">Every child. One connected health record.</div></div><div style="text-align:right"><b>Child Health Report</b><div class="note">Generated '+new Date().toLocaleString('en-GB')+'<br>'+esc(MWL.FACILITY)+' · '+esc(MWL.STAFF)+'</div></div></div>'+
 '<h2>Child and guardian</h2>'+kv([['Name',c.name],['Child Health ID',c.id],['Sex',c.sex==='F'?'Female':'Male'],['Date of birth',MWL.fmt(c.dob)],['Age',MWL.ageText(c.dob)],['Birth weight',c.bw?c.bw+' kg':''],['Guardian',c.guardian],['Guardian phone',c.phone],['Originating facility',c.origin]])+
 '<h2>Immunisation status</h2><p><b>'+nDone+' of '+sch.length+'</b> scheduled doses completed · <b>'+nOver+'</b> overdue · Fully immunised under one: <b>'+(full1(c)?'Yes':'No')+'</b></p><table><thead><tr><th>Vaccine</th><th>Dose</th><th>Due date</th><th>Date given</th><th>Facility</th><th>Status</th></tr></thead><tbody>'+rows+extra+'</tbody></table><p class="note">Schedule is prototype configuration: verify against current Zambian EPI guidance.</p>'+
 '<h2>Growth patterns</h2>'+(gr.length?'<table><thead><tr><th>Date</th><th>Age (mo)</th><th>Weight</th><th>Length (raw → adjusted)</th><th>MUAC</th><th>WAZ</th><th>HAZ</th><th>WHZ</th><th>BAZ</th></tr></thead><tbody>'+gt+'</tbody></table><h2>Weight-for-age chart</h2>'+G.chart(c,gr):'<p>No measurements recorded.</p>')+
 '<h2>Growth flags for health worker review</h2>'+ah+
 '<p class="note">Automated flags are not a diagnosis and do not prescribe treatment. HAZ, WHZ and BAZ show n/a until WHO reference tables are loaded; WAZ uses a 0–6 month demonstration subset to be validated against WHO Anthro. Demonstration software: fictional data only, not approved for clinical use.</p></body></html>'}
function curId(){var m=$('.profile-meta'),r=m&&/MWL-[A-Z0-9]+/.exec(m.textContent);return r?r[0]:null}
function out(id,mode){var c=MWL.getChild(id);if(!c){toast('Choose a child first.');return}var h=rep(c);MWL.audit('Child report generated',c.id,mode==='print'?'Printed':'Downloaded');
 if(mode==='print'){var w=window.open('','_blank');if(!w){toast('Pop-up blocked. Use Download report instead.');return}w.document.open();w.document.write(h);w.document.close();setTimeout(function(){w.focus();w.print()},500)}
 else{dl('MwanaLink_child_report_'+c.id+'.html','text/html;charset=utf-8',h);toast('Report downloaded. Open it and use Print / Save as PDF for a PDF.')}}
document.addEventListener('click',function(e){var b;
 if(e.target.closest('[data-rcsv]'))csv();
 else if((b=e.target.closest('[data-rgo]')))out($('#rsel').value,b.getAttribute('data-rgo'));
 else if(e.target.closest('[data-rdl]'))out(curId(),'dl');
 else if(e.target.closest('[data-rprint]'))out(curId(),'print')});
document.addEventListener('change',function(e){if(e.target.id==='rm'&&e.target.value){month=e.target.value;render()}});
new MutationObserver(function(){var m=$('#main');if(!m)return;
 var pa=m.querySelector('.profile-actions');if(pa&&pa.querySelector('[data-back]')&&!pa.querySelector('[data-rdl]'))pa.insertAdjacentHTML('afterbegin','<button class="btn secondary small" data-rdl="1">Download report</button><button class="btn outline small" data-rprint="1">Print / PDF</button>');
 if($('#rwrap'))return;var ph=null;m.querySelectorAll('.card').forEach(function(c){var h=c.querySelector('h2');if(h&&h.textContent==='Reports'&&c.textContent.indexOf('later step')>-1)ph=c});
 if(!ph)return;var w=document.createElement('div');w.id='rwrap';ph.replaceWith(w);render()}).observe($('#main'),{childList:true,subtree:true});
})();
