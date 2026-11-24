(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc;
function has(c,v,d,by){return c.imm.some(function(i){return !i.void&&i.vaccine===v&&i.dose===d&&i.date<=by})}
function full2(c){var by=MWL.addDays(c.dob,730);return MWL.SCHEDULE.filter(function(s){return s[2]<=730}).every(function(s){return has(c,s[0],s[1],by)})}
function stats(k){var ce=k.filter(function(c){return c.hiv==='CE'}),op=ce.filter(function(c){return !(c.hei&&c.hei.final)}),fo=function(o){return ce.filter(function(c){return c.hei&&c.hei.final&&c.hei.final.outcome===o}).length};
 return{open:op,pr:op.filter(window.MWLH.onProph).length,neg:fo('Negative'),pos:fo('Positive'),due:op.map(function(c){return{c:c,d:window.MWLH.due(c)}}).filter(function(x){return x.d.length})}}
function tile(l,i,v,s){return '<div class="stat"><div class="stat-top">'+l+'<span class="stat-icon">'+i+'</span></div><strong>'+v+'</strong><small>'+s+'</small></div>'}
var rk={overdue:0,due:1,upcoming:2};
function heiCard(k){var s=stats(k),sc=function(x){return Math.min.apply(null,x.d.map(function(t){return rk[t.state]}))};s.due.sort(function(a,b){return sc(a)-sc(b)});
 var rows=s.due.map(function(x){var c=x.c;return '<tr><td><div class="child-name">'+esc(c.name)+'</div><div class="muted">'+esc(c.id)+' · '+MWL.ageText(c.dob)+'</div></td><td>'+esc(c.guardian)+'<div class="muted">'+esc(c.phone)+'</div></td><td style="white-space:normal;min-width:230px">'+x.d.map(function(t){return '<span class="status '+(t.state==='overdue'?'late':t.state==='due'?'due':'info')+'">'+esc(t.label)+' · '+(t.state==='upcoming'?'due '+MWL.fmt(t.date):t.state==='due'?'due now':'overdue')+'</span>'}).join(' ')+'</td><td><span class="status '+(window.MWLH.onProph(c)?'good':'due')+'">'+(window.MWLH.onProph(c)?'On prophylaxis':'Not on prophylaxis')+'</span></td><td><button class="btn secondary small" data-open="'+esc(c.id)+'">Open</button></td></tr>'}).join('')||'<tr><td colspan="5" class="muted">No exposed children are due for testing.</td></tr>';
 var scope=document.body.classList.contains('is-staff')?'children registered at '+esc(MWL.FACILITY):'all facilities';
 return '<div class="card" id="heiCard"><div class="card-head"><h2>HIV-exposed children (CE)</h2></div><div class="grid stats">'+tile('Exposed, under follow-up','☺',s.open.length,'CE, no final outcome')+tile('On prophylactic treatment','✓',s.pr,'of '+s.open.length+' under follow-up')+tile('Due or overdue for testing','!',s.due.length,'Need a test')+tile('Final outcome negative','★',s.neg,s.pos?s.pos+' positive':'Cleared')+'</div><h2 style="font-size:14px;margin:6px 0 8px">Exposed children due for testing</h2><div class="table-wrap"><table><thead><tr><th>Child</th><th>Guardian</th><th>Tests due</th><th>Prophylaxis</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="notice">Covers '+scope+', as of today. Test ages are prototype configuration. Children with a final outcome are no longer listed as due.</div></div>'}
function patch(){var w=$('#rwrap');if(!w||!window.MWLH)return;
 var cards=Array.prototype.filter.call(w.children,function(x){return x.classList.contains('card')}),k=MWL.db.children,f=w.querySelector('.stats');
 if(f&&!f.dataset.r2){f.dataset.r2='1';var t=f.querySelectorAll('.stat');
  if(t[1])t[1].insertAdjacentHTML('afterend',tile('Fully immunised under two','★',k.filter(full2).length,'of '+k.length+' registered children'));
  var nt=cards[0]&&cards[0].querySelector('.notice');
  if(nt)nt.insertAdjacentHTML('afterend','<div class="notice">“Fully immunised under two” uses the same rule: every scheduled dose due by 24 months (this adds MR 2 and MAV 4) given on or before the second birthday.</div>')}
 if(cards[1]&&!w.querySelector('#heiCard'))cards[1].insertAdjacentHTML('afterend',heiCard(k))}
new MutationObserver(patch).observe($('#main'),{childList:true,subtree:true});
/* CSV export: add the under-two row and the HIV-exposed summary. */
function csvFix(t){var k=MWL.db.children,q=function(x){return '"'+String(x).replace(/"/g,'""')+'"'},s=stats(k);
 t=t.replace(/("Fully immunised under one","[^"]*")(\r\n)/,'$1$2'+q('Fully immunised under two')+','+q(k.filter(full2).length)+'$2');
 return t+'\r\n\r\n'+[['HIV-exposed infants under follow-up (CE)',s.open.length],['On prophylactic treatment',s.pr],['Due or overdue for testing',s.due.length],['Final outcome negative',s.neg],['Final outcome positive',s.pos]].map(function(r){return r.map(q).join(',')}).join('\r\n')}
var PB=window.Blob;window.Blob=function(p,o){if(o&&/csv/.test(o.type||'')&&typeof p[0]==='string'&&p[0].indexOf('Fully immunised under one')>-1&&window.MWLH)p=[csvFix(p[0])];return new PB(p,o)};window.Blob.prototype=PB.prototype;
})();
