(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc,mine='',minP='',hivSel='',bannerFor='';
var st=document.createElement('style');
st.textContent='.hivb{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:12px 14px;border-radius:10px;margin-bottom:14px;border:2px solid}.hivb.ce{background:var(--redbg);border-color:var(--red);color:var(--red)}.hivb.cne{background:var(--goodbg);border-color:var(--good);color:var(--good)}.hivb.na{background:var(--amberbg);border-color:var(--amber);color:var(--amber)}.hivtag{font:900 24px system-ui;letter-spacing:1px;padding:4px 12px;border-radius:8px;background:var(--card)}.hivb b{font-size:15px}.hivb small{font-size:11px;opacity:.9}.xl2{font-size:11px;font-weight:750;color:var(--muted);margin-top:8px}';
document.head.appendChild(st);
function toast(t){var r=$('#toastRoot');if(r){r.innerHTML='<div class="toast">'+esc(t)+'</div>';setTimeout(function(){r.innerHTML=''},3200)}}
function val(id){var e=$('#'+id);return e?e.value.trim():''}
function curId(){var m=$('.profile-meta'),r=m&&/MWL-[A-Z0-9]+/.exec(m.textContent);return r?r[0]:null}
function allKids(){return MWL.all?MWL.all():MWL.db.children}
/* Prototype schedules (configuration): verify against current Zambian guidance. */
var K={vita:{key:'vita',title:'Vitamin A supplementation',rule:'Prototype schedule: first dose at 6 months, then every 6 months until age 5. Verify against current Zambian guidance.',start:6,gap:183,end:60},
dewm:{key:'dewm',title:'Deworming',rule:'Prototype schedule: from 12 months, then every 6 months until age 5. Verify against current Zambian guidance.',start:12,gap:183,end:60}};
function srt(L){return L.slice().sort(function(a,b){return a.date<b.date?1:-1})}
function nd(c,L,C){var a=MWL.ageMonths(c.dob);if(a>=C.end)return{s:'info',t:'Course complete (child is over 5 years)'};
 var s=srt(L).reverse(),d=s.length?MWL.addDays(s[s.length-1].date,C.gap):MWL.addDays(c.dob,Math.round(C.start*30.4375)),days=Math.round((new Date(d)-new Date(MWL.TODAY))/864e5);
 return days<0?{s:'late',t:'Overdue since '+MWL.fmt(d)}:days<=30?{s:'due',t:'Due '+MWL.fmt(d)}:{s:'good',t:'Next due '+MWL.fmt(d)}}
function rows(c,k){return srt(c[K[k].key]||[]).map(function(x){return '<tr><td>'+MWL.fmt(x.date)+'</td><td>'+MWL.ageMonths(c.dob,x.date).toFixed(1)+'</td><td>'+esc(k==='vita'?x.dose:x.drug)+'</td><td>'+esc(x.by)+'<div class="muted">'+esc(x.facility)+'</div></td></tr>'}).join('')||'<tr><td colspan="4" class="muted">None recorded.</td></tr>'}
function panel(c,k,ro){var C=K[k],L=c[C.key]||[],n=nd(c,L,C),T=MWL.TODAY;
 var h='<div class="flag" style="border:0;padding-top:0"><div><b>'+C.title+'</b><br><span class="muted">'+esc(C.rule)+'</span></div><span class="status '+n.s+'">'+esc(n.t)+'</span></div>';
 if(!ro){h+='<h2 style="font-size:14px;margin:8px 0 10px">Record '+(k==='vita'?'vitamin A':'deworming')+'</h2><div class="iform"><div class="field"><label for="'+(k==='vita'?'xvd':'xwd')+'">Date given</label><input id="'+(k==='vita'?'xvd':'xwd')+'" type="date" value="'+T+'" min="'+c.dob+'" max="'+T+'"></div>';
  if(k==='vita'){var def=MWL.ageMonths(c.dob)<12?'100,000 IU':'200,000 IU';h+='<div class="field"><label for="xvdo">Dose</label><select id="xvdo">'+[['100,000 IU','100,000 IU (usual for 6–11 months)'],['200,000 IU','200,000 IU (usual for 12–59 months)']].map(function(o){return '<option value="'+o[0]+'"'+(o[0]===def?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></div></div>'}
  else h+='</div><div class="xl2">Drug administered (tick one)</div><label class="check"><input type="checkbox" id="xwm"> Mebendazole</label><label class="check"><input type="checkbox" id="xwa"> Albendazole</label>';
  h+='<div class="ierr" id="xperr" role="alert"></div><button class="btn primary" data-xsave="'+k+'">Save as given</button>'}
 return h+'<h2 style="font-size:14px;margin:18px 0 8px">History</h2><div class="table-wrap"><table><thead><tr><th>Date</th><th>Age (mo)</th><th>'+(k==='vita'?'Dose':'Drug')+'</th><th>Given by</th></tr></thead><tbody>'+rows(c,k)+'</tbody></table></div>'}
function refresh(){var b=mine&&$('.tabs [data-tab="'+mine+'"]');if(b)b.click()}
function save(k){var c=MWL.getChild(curId()),e=$('#xperr'),C=K[k],L=(c[C.key]=c[C.key]||[]),d=val(k==='vita'?'xvd':'xwd');
 if(!d||d<c.dob||d>MWL.TODAY){e.textContent='Date must be between the child’s birth and today.';return}
 if(L.some(function(x){return x.date===d})){e.textContent='An entry already exists for this date.';return}
 var rec={date:d,by:MWL.STAFF,facility:MWL.FACILITY},desc,a=MWL.ageMonths(c.dob,d);
 if(k==='vita'){rec.dose=val('xvdo');desc=rec.dose;if(a<6&&!confirm('Routine vitamin A starts at 6 months. Record this dose anyway?'))return}
 else{var m=$('#xwm').checked,b=$('#xwa').checked;if(m===b){e.textContent='Tick the drug given: Mebendazole or Albendazole.';return}rec.drug=m?'Mebendazole':'Albendazole';desc=rec.drug;if(a<12&&!confirm('Routine deworming starts at 12 months. Record this dose anyway?'))return}
 L.push(rec);c.lastFacility=MWL.FACILITY;MWL.audit(k==='vita'?'Vitamin A recorded':'Deworming recorded',c.id,desc+' on '+d);toast('Saved.');refresh()}

/* HIV exposure status: CE (exposed) / CNE (not exposed) */
var DEMO={'MWL-A1B2C3':'CNE','MWL-D4E5F6':'CE','MWL-G7H8J9':'CNE','MWL-K2L3M4':'CNE'};
(function(){var ch=false;allKids().forEach(function(c){if(!c.hiv&&c.fictional&&DEMO[c.id]){c.hiv=DEMO[c.id];c.hivDate=c.registered;c.hivBy='Demo data';ch=true}});if(ch)MWL.save()})();
function banner(c){var h=c.hiv;
 if(h==='CE'||h==='CNE'){var ce=h==='CE';return '<div id="hivBanner" class="hivb '+(ce?'ce':'cne')+'" role="status"><span class="hivtag">'+h+'</span><div><b>'+(ce?'HIV EXPOSED (CE)':'NOT HIV EXPOSED (CNE)')+'</b><br><small>Recorded '+MWL.fmt(c.hivDate||c.registered)+(c.hivBy?' · '+esc(c.hivBy):'')+'</small></div><button class="btn outline small" data-hchg="1" style="margin-left:auto">Change status</button></div>'}
 return '<div id="hivBanner" class="hivb na" role="alert"><span class="hivtag">?</span><div><b>HIV EXPOSURE STATUS NOT RECORDED</b><br><small>Record CE or CNE for this child.</small></div><div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap"><button class="btn secondary small" data-hset="CE">Set CE</button><button class="btn secondary small" data-hset="CNE">Set CNE</button></div></div>'}
function setHiv(c,v,why){var old=c.hiv;c.hiv=v;c.hivDate=MWL.TODAY;c.hivBy=MWL.STAFF;c.lastFacility=MWL.FACILITY;
 MWL.audit(old?'HIV exposure status changed':'HIV exposure status recorded',c.id,(old?old+' → ':'')+v+(why?'. Reason: '+why:''));
 var b=$('#hivBanner');if(b)b.outerHTML=banner(c);toast('Status recorded: '+v)}

/* Child health report: add status, vitamin A and deworming */
function sec(c){return ['vita','dewm'].map(function(k){var C=K[k],n=nd(c,c[C.key]||[],C);return '<h2>'+C.title+'</h2><p>'+esc(n.t)+'</p><table><thead><tr><th>Date</th><th>Age (mo)</th><th>'+(k==='vita'?'Dose':'Drug')+'</th><th>Given by</th></tr></thead><tbody>'+rows(c,k).replace(/class="muted"/g,'')+'</tbody></table>'}).join('')+'<p class="note">Vitamin A and deworming schedules are prototype configuration to be verified against current Zambian guidance.</p>'}
function enrich(h){if(typeof h!=='string'||h.indexOf('<h2>Growth patterns</h2>')<0)return h;var m=/MWL-[A-Z0-9]{6}/.exec(h),c=m&&MWL.getChild(m[0]);if(!c)return h;
 var t=c.hiv==='CE'?'CE (HIV exposed)':c.hiv==='CNE'?'CNE (not HIV exposed)':'Not recorded';
 return h.replace('<h2>Child and guardian</h2>','<h2>Child and guardian</h2><p><b>HIV exposure status:</b> '+t+'</p>').replace('<h2>Growth patterns</h2>',sec(c)+'<h2>Growth patterns</h2>')}
var PB=window.Blob;window.Blob=function(p,o){if(o&&/html/.test(o.type||'')&&p&&typeof p[0]==='string')p=[enrich(p[0])];return new PB(p,o)};window.Blob.prototype=PB.prototype;
var PO=window.open;window.open=function(){var w=PO.apply(window,arguments);try{if(w){var d=w.document,dw=d.write;d.write=function(h){return dw.call(d,enrich(h))}}}catch(e){}return w};

/* Events */
window.addEventListener('click',function(e){
 var tb=e.target.closest('[data-tab]'),pt=e.target.closest('[data-ptab]');
 if(tb){var k=tb.getAttribute('data-tab');mine=(k==='vita'||k==='dewm')?k:''}
 else if(e.target.closest('[data-open],[data-verify],[data-back],[data-page]')){mine='';if(!e.target.closest('[data-open],[data-verify]'))bannerFor=''}
 if(pt){var kp=pt.getAttribute('data-ptab');minP=(kp==='vita'||kp==='dewm')?kp:''}
 else if(e.target.closest('[data-popen],[data-pback],[data-pout]'))minP='';
 if(e.target.closest('[data-act="register"]')&&$('#hce')){
  hivSel=$('#hce').checked?'CE':$('#hcne').checked?'CNE':'';
  if(!hivSel){e.stopPropagation();e.preventDefault();var er=$('#hiverr');er.textContent='Select the HIV exposure status: CE or CNE.';er.scrollIntoView({block:'center'});return}
  var ids=allKids().map(function(c){return c.id}),v=hivSel;
  setTimeout(function(){allKids().forEach(function(c){if(ids.indexOf(c.id)<0){c.hiv=v;c.hivDate=MWL.TODAY;c.hivBy=MWL.STAFF;MWL.audit('HIV exposure status recorded',c.id,v+' at registration');hivSel=''}})},0)}},true);
document.addEventListener('click',function(e){var t;
 if((t=e.target.closest('[data-xsave]')))save(t.getAttribute('data-xsave'));
 else if((t=e.target.closest('[data-hset]'))){var c=MWL.getChild(curId());if(c)setHiv(c,t.getAttribute('data-hset'),'')}
 else if(e.target.closest('[data-hchg]')){var c2=MWL.getChild(curId());if(!c2)return;var nv=c2.hiv==='CE'?'CNE':'CE';
  if(!confirm('Change HIV exposure status from '+c2.hiv+' to '+nv+'?'))return;var why=prompt('Reason for the change (required):');if(why===null)return;why=why.trim();
  if(why.length<5){toast('A reason of at least 5 characters is required.');return}setHiv(c2,nv,why)}});
document.addEventListener('change',function(e){var id=e.target.id;
 if(id==='hce'&&e.target.checked)$('#hcne').checked=false;else if(id==='hcne'&&e.target.checked)$('#hce').checked=false;
 else if(id==='xwm'&&e.target.checked)$('#xwa').checked=false;else if(id==='xwa'&&e.target.checked)$('#xwm').checked=false;
 else if(id==='xvd'){var c=MWL.getChild(curId()),o=$('#xvdo');if(c&&o&&e.target.value)o.value=MWL.ageMonths(c.dob,e.target.value)<12?'100,000 IU':'200,000 IU'}
 if(id==='hce'||id==='hcne')hivSel=$('#hce').checked?'CE':$('#hcne').checked?'CNE':''});

/* Page patches */
function patch(){var m=$('#main');if(!m)return;
 var cm=m.querySelector('#comm');
 if(cm&&!m.querySelector('#hce'))cm.closest('.field').insertAdjacentHTML('afterend','<div class="full"><div class="xl2">HIV exposure status (required)</div><label class="check"><input type="checkbox" id="hce"'+(hivSel==='CE'?' checked':'')+'> HIV exposed (CE)</label><label class="check"><input type="checkbox" id="hcne"'+(hivSel==='CNE'?' checked':'')+'> Not HIV exposed (CNE)</label><div class="ierr" id="hiverr" role="alert"></div></div>');
 if(m.querySelector('.profile-actions [data-back]')){
  var id=curId(),c=id&&MWL.getChild(id),ph=m.querySelector('.profile-head'),card=ph&&ph.parentElement;
  if(c&&card&&!m.querySelector('#hivBanner')){card.insertAdjacentHTML('afterbegin',banner(c));if(bannerFor!==id){bannerFor=id;window.scrollTo(0,0)}}
  var tabs=m.querySelector('.tabs');
  if(tabs&&!tabs.querySelector('[data-tab="vita"]')){var g=tabs.querySelector('[data-tab="growth"]');if(g)g.insertAdjacentHTML('afterend','<button class="tab" data-tab="vita">Vitamin A</button><button class="tab" data-tab="dewm">Deworming</button>')}
  if(mine&&tabs&&c){tabs.querySelectorAll('.tab').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-tab')===mine)});
   var e=m.querySelector('.empty');if(e&&!m.querySelector('#xvwrap')&&/later step/.test(e.textContent)){var w=document.createElement('div');w.id='xvwrap';e.replaceWith(w);w.innerHTML=panel(c,mine,false)}}}
 var pw=m.querySelector('#pwrap'),pt=pw&&pw.querySelector('.tabs');
 if(pt&&!pt.dataset.xp){pt.dataset.xp='1';var pg=pt.querySelector('[data-ptab="growth"]');if(pg)pg.insertAdjacentHTML('afterend','<button class="tab" data-ptab="vita">Vitamin A</button><button class="tab" data-ptab="dewm">Deworming</button>');
  if(minP){pt.querySelectorAll('.tab').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-ptab')===minP)});var pc=MWL.getChild(curId());
   if(pc){var n=pt.nextSibling;while(n){var nx=n.nextSibling;if(!(n.nodeType===1&&n.matches('p.muted')&&!nx))n.remove();n=nx}pt.insertAdjacentHTML('afterend',panel(pc,minP,true))}}}}
new MutationObserver(patch).observe($('#main'),{childList:true,subtree:true});
})();
