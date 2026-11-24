(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc,mineH=false;
/* Prototype test ages in days. Edit this list to match current Zambian guidance for HIV-exposed infants. */
var TESTS=[['6w','6 weeks',42],['6m','6 months',183],['9m','9 months',274],['18m','18 months (final test)',548]];
function toast(t){var r=$('#toastRoot');if(r){r.innerHTML='<div class="toast">'+esc(t)+'</div>';setTimeout(function(){r.innerHTML=''},3200)}}
function val(id){var e=$('#'+id);return e?e.value.trim():''}
function cid(){var m=$('.profile-meta'),r=m&&/MWL-[A-Z0-9]+/.exec(m.textContent);return r?r[0]:null}
function ageD(c){return(new Date(MWL.TODAY)-new Date(c.dob))/864e5}
function H(c){return c.hei||(c.hei={proph:null,tests:[],final:null})}
function onProph(c){return !!(c.hei&&c.hei.proph&&c.hei.proph.on)}
function dueTests(c){var a=ageD(c),T=(c.hei&&c.hei.tests)||[];
 return TESTS.filter(function(t){return !T.some(function(x){return x.k===t[0]})}).map(function(t){var d=t[2]-a;return{k:t[0],label:t[1],date:MWL.addDays(c.dob,t[2]),state:d>30?'later':d>0?'upcoming':d>-30?'due':'overdue'}}).filter(function(x){return x.state!=='later'})}
window.MWLH={TESTS:TESTS,due:dueTests,onProph:onProph};
function fl(id,l,t,v,x){return '<div class="field"><label for="'+id+'">'+l+'</label><input id="'+id+'" type="'+t+'" value="'+esc(v||'')+'" '+(x||'')+' autocomplete="off"></div>'}
function panel(c){
 var h=c.hei||{},p=h.proph||{},F=h.final,T=h.tests||[],ds={};dueTests(c).forEach(function(x){ds[x.k]=x});
 var o='<div class="notice">Recommended test ages are prototype configuration. Verify against current Zambian HIV-exposed infant guidelines.</div>';
 o+='<h2 style="font-size:14px;margin:0 0 8px">Prophylactic treatment</h2><div class="flag" style="border:0;padding:0 0 8px"><span>'+(p.on?'On prophylaxis'+(p.drug?': '+esc(p.drug):'')+(p.start?' since '+MWL.fmt(p.start):''):'Not on prophylaxis')+'</span><span class="status '+(p.on?'good':'due')+'">'+(p.on?'On treatment':'Not on treatment')+'</span></div><label class="check"><input type="checkbox" id="hpon"'+(p.on?' checked':'')+'> On prophylactic treatment</label><div class="iform">'+fl('hpdrug','Drug (for example nevirapine)','text',p.drug,'maxlength="60"')+fl('hpst','Start date','date',p.start,'min="'+c.dob+'" max="'+MWL.TODAY+'"')+'</div><div class="ierr" id="herr1" role="alert"></div><button class="btn primary" data-hsp="1">Save prophylaxis</button>';
 var rows=TESTS.map(function(t){var r=T.filter(function(x){return x.k===t[0]})[0],d=ds[t[0]],st=r?'<span class="status good">Recorded</span>':d?'<span class="status '+(d.state==='overdue'?'late':d.state==='due'?'due':'info')+'">'+(d.state==='upcoming'?'Upcoming':d.state==='due'?'Due now':'Overdue')+'</span>':'<span class="muted">Not yet due</span>';
  return '<tr><td><b>'+t[1]+'</b></td><td>'+MWL.fmt(MWL.addDays(c.dob,t[2]))+'</td><td>'+st+'</td><td style="white-space:normal;min-width:140px">'+(r?esc(r.result):'–')+'</td><td>'+(r?MWL.fmt(r.date):'–')+'</td><td>'+(r?esc(r.by):'–')+'</td></tr>'}).join('');
 o+='<h2 style="font-size:14px;margin:18px 0 8px">Test outcomes</h2><div class="table-wrap"><table><thead><tr><th>Test age</th><th>Due date</th><th>Status</th><th>Result</th><th>Date tested</th><th>By</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="iform" style="margin-top:12px"><div class="field"><label for="htk">Test age</label><select id="htk">'+TESTS.map(function(t){return '<option value="'+t[0]+'">'+t[1]+'</option>'}).join('')+'</select></div>'+fl('htd','Date tested','date',MWL.TODAY,'min="'+c.dob+'" max="'+MWL.TODAY+'"')+fl('htr','Result (text)','text','','maxlength="80" placeholder="for example PCR negative"')+'</div><div class="ierr" id="herr2" role="alert"></div><button class="btn primary" data-hst="1">Save test result</button>';
 o+='<h2 style="font-size:14px;margin:18px 0 8px">Final outcome</h2>';
 if(F)o+='<div class="notice"><b>Final outcome: '+esc(F.outcome.toUpperCase())+'</b> · '+MWL.fmt(F.date)+' · '+esc(F.by)+(F.note?'<br>'+esc(F.note):'')+'</div><button class="btn outline small" data-hre="1">Reopen (correction)</button>';
 else o+='<div class="iform"><div class="field"><label for="hfo">Final outcome</label><select id="hfo"><option>Negative</option><option>Positive</option></select></div>'+fl('hfn','Note (optional)','text','','maxlength="120"')+'</div><div class="ierr" id="herr3" role="alert"></div><button class="btn primary" data-hfin="1">Establish final outcome</button><p class="muted" style="font-size:12px">A negative final outcome changes the child’s status from CE to NEGATIVE.</p>';
 return o}
function fin(c){var F=c.hei.final,neg=F.outcome==='Negative';return '<div id="hivBanner" data-f="1" class="hivb '+(neg?'cne':'ce')+'" role="status"><span class="hivtag">'+(neg?'NEGATIVE':'POSITIVE')+'</span><div><b>HIV-EXPOSED INFANT: FINAL OUTCOME '+F.outcome.toUpperCase()+'</b><br><small>Established '+MWL.fmt(F.date)+' · '+esc(F.by)+'</small></div></div>'}
function refresh(){var b=$('.tabs [data-tab="hei"]');if(b)b.click()}
function saveP(){var c=MWL.getChild(cid()),e=$('#herr1'),on=$('#hpon').checked,drug=val('hpdrug'),st=val('hpst'),h=H(c),old=h.proph||{};
 if(on){if(drug.length<2){e.textContent='Enter the prophylaxis drug.';return}if(!st||st<c.dob||st>MWL.TODAY){e.textContent='Enter a start date between birth and today.';return}}
 h.proph={on:on,drug:drug||old.drug||'',start:st||old.start||'',stop:(!on&&old.on)?MWL.TODAY:(old.stop||'')};
 c.lastFacility=MWL.FACILITY;MWL.audit('HIV prophylaxis updated',c.id,on?'On '+drug+' since '+st:'Not on prophylaxis');toast('Saved.');refresh()}
function saveT(){var c=MWL.getChild(cid()),e=$('#herr2'),k=val('htk'),d=val('htd'),r=val('htr'),t=TESTS.filter(function(x){return x[0]===k})[0],h=H(c);
 if(!d||d<c.dob||d>MWL.TODAY){e.textContent='Date must be between birth and today.';return}
 if(r.length<2){e.textContent='Type the test result.';return}
 if((new Date(d)-new Date(c.dob))/864e5<t[2]-14&&!confirm('This test is recommended at '+t[1]+', but the child was younger on the test date. Record anyway?'))return;
 var old=h.tests.filter(function(x){return x.k===k})[0];
 if(old&&!confirm('A result is already recorded for '+t[1]+' ("'+old.result+'"). Replace it? The change is logged.'))return;
 h.tests=h.tests.filter(function(x){return x.k!==k});h.tests.push({k:k,label:t[1],date:d,result:r,by:MWL.STAFF,facility:MWL.FACILITY});
 c.lastFacility=MWL.FACILITY;MWL.audit('HIV test result recorded',c.id,t[1]+': '+r+(old?' (replaced: '+old.result+')':''));toast('Saved.');refresh()}
function saveF(){var c=MWL.getChild(cid()),o=val('hfo'),n=val('hfn');
 if(!confirm('Set the final outcome to '+o.toUpperCase()+'?'+(o==='Negative'?' The status will change from CE to NEGATIVE.':'')))return;
 H(c).final={outcome:o,note:n,date:MWL.TODAY,by:MWL.STAFF,facility:MWL.FACILITY};c.lastFacility=MWL.FACILITY;
 MWL.audit('HIV final outcome established',c.id,o+(n?'. '+n:''));toast('Final outcome recorded.');refresh()}
function reopen(){var c=MWL.getChild(cid()),why=prompt('Reason for reopening the final outcome (required):');if(why===null)return;why=why.trim();
 if(why.length<5){toast('A reason of at least 5 characters is required.');return}
 var f=c.hei.final;c.hei.final=null;MWL.audit('HIV final outcome reopened',c.id,'Was '+f.outcome+'. Reason: '+why);toast('Final outcome reopened.');refresh()}
window.addEventListener('click',function(e){var tb=e.target.closest('[data-tab]');
 if(tb)mineH=tb.getAttribute('data-tab')==='hei';else if(e.target.closest('[data-open],[data-verify],[data-back],[data-page]'))mineH=false},true);
document.addEventListener('click',function(e){
 if(e.target.closest('[data-hsp]'))saveP();else if(e.target.closest('[data-hst]'))saveT();else if(e.target.closest('[data-hfin]'))saveF();else if(e.target.closest('[data-hre]'))reopen()});
var RC={Emergency:'late',Urgent:'due',Routine:'info'},RL={Sent:'Referral sent',Received:'Received by facility',Completed:'Completed'};
function patch(){var m=$('#main');if(!m)return;
 if(m.querySelector('.profile-actions [data-back]')){var id=cid(),c=id&&MWL.getChild(id);
  if(c){var b=m.querySelector('#hivBanner');if(b&&!b.dataset.f&&c.hei&&c.hei.final)b.outerHTML=fin(c);
   var tabs=m.querySelector('.tabs');
   if(tabs&&c.hiv==='CE'&&!tabs.querySelector('[data-tab="hei"]'))tabs.insertAdjacentHTML('beforeend','<button class="tab" data-tab="hei">HIV exposure</button>');
   if(mineH&&tabs&&c.hiv==='CE'){tabs.querySelectorAll('.tab').forEach(function(x){x.classList.toggle('active',x.getAttribute('data-tab')==='hei')});
    var e=m.querySelector('.empty');if(e&&!m.querySelector('#hweb')&&/later step/.test(e.textContent)){var w=document.createElement('div');w.id='hweb';e.replaceWith(w);w.innerHTML=panel(c)}}}}
 var pw=m.querySelector('#pwrap');
 if(pw&&!pw.querySelector('#parefs')){var act=pw.querySelector('.tab.active'),meta=pw.querySelector('.profile-meta'),tb=pw.querySelector('.tabs');
  if(act&&act.getAttribute('data-ptab')==='appts'&&meta&&tb){var pid=(/MWL-[A-Z0-9]+/.exec(meta.textContent)||[])[0],L=(MWL.db.referrals||[]).filter(function(r){return r.childId===pid}).sort(function(a,b){return a.date<b.date?1:-1});
   if(L.length)tb.insertAdjacentHTML('afterend','<div id="parefs"><h2 style="font-size:14px;margin:12px 0 4px">Referrals</h2>'+L.map(function(r){return '<div class="flag"><div><b>Referred to '+esc(r.to)+'</b> · '+MWL.fmt(r.date)+'<br><span class="muted">Reason: '+esc(r.reason)+' · from '+esc(r.from)+'</span><br>'+(r.status==='Completed'?'Outcome: '+esc(r.outcome)+(r.followup2?'. Follow-up: '+esc(r.followup2):''):'Please attend '+esc(r.to)+' as advised by your health worker.')+'</div><div style="text-align:right"><span class="status '+(RC[r.urgency]||'info')+'">'+esc(r.urgency)+'</span><br><span class="muted">'+(RL[r.status]||'')+'</span></div></div>'}).join('')+'</div>')}}}
new MutationObserver(patch).observe($('#main'),{childList:true,subtree:true});
/* Child health report: show NEGATIVE/POSITIVE outcome and the follow-up section. Runs after services.js (loaded later). */
function enr(h){if(typeof h!=='string'||h.indexOf('<h2>Growth patterns</h2>')<0)return h;var m=/MWL-[A-Z0-9]{6}/.exec(h),c=m&&MWL.getChild(m[0]);if(!c||c.hiv!=='CE')return h;
 var F=c.hei&&c.hei.final,p=c.hei&&c.hei.proph,T=(c.hei&&c.hei.tests)||[];
 h=h.replace(/(<b>HIV exposure status:<\/b> )CE \(HIV exposed\)/,'$1'+(F?F.outcome.toUpperCase()+' (HIV-exposed infant, final outcome '+F.outcome.toLowerCase()+')':'CE (HIV exposed)'));
 var rows=TESTS.map(function(t){var r=T.filter(function(x){return x.k===t[0]})[0];return '<tr><td>'+t[1]+'</td><td>'+(r?MWL.fmt(r.date):'–')+'</td><td>'+(r?esc(r.result):'Not recorded')+'</td></tr>'}).join('');
 return h.replace('<h2>Growth patterns</h2>','<h2>HIV-exposed infant follow-up</h2><p>Prophylaxis: <b>'+(p&&p.on?'On treatment'+(p.drug?' ('+esc(p.drug)+')':''):'Not on treatment')+'</b> · Final outcome: <b>'+(F?esc(F.outcome)+'</b> ('+MWL.fmt(F.date)+')':'not yet established</b>')+'</p><table><thead><tr><th>Test age</th><th>Date tested</th><th>Result</th></tr></thead><tbody>'+rows+'</tbody></table><h2>Growth patterns</h2>')}
var PB=window.Blob;window.Blob=function(p,o){if(o&&/html/.test(o.type||'')&&p&&typeof p[0]==='string')p=[enr(p[0])];return new PB(p,o)};window.Blob.prototype=PB.prototype;
var PO=window.open;window.open=function(){var w=PO.apply(window,arguments);try{if(w){var d=w.document,dw=d.write;d.write=function(h){return dw.call(d,enr(h))}}}catch(e){}return w};
})();
