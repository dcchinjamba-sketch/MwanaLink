(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc;
var TYPES=['Immunisation','Growth monitoring','Nutrition follow-up','Routine child health visit','Clinical review','Referral follow-up'];
function curId(){var m=$('.profile-meta'),r=m&&/MWL-[A-Z0-9]+/.exec(m.textContent);return r?r[0]:null}
function toast(t){var r=$('#toastRoot');r.innerHTML='<div class="toast">'+esc(t)+'</div>';setTimeout(function(){r.innerHTML=''},2600)}
function st(a){return a.attended?['Attended','good']:a.date>=MWL.TODAY?['Upcoming','info']:['Missed','late']}
function panel(c){
 var due=MWL.dueList(c).sort(function(a,b){return a.due<b.due?-1:1})[0],sug=due?(due.due<MWL.TODAY?MWL.TODAY:due.due):MWL.addDays(MWL.TODAY,28);
 var rows=c.appts.map(function(a,i){return{a:a,i:i}}).sort(function(x,y){return x.a.date<y.a.date?-1:1}).map(function(x){var s=st(x.a);return '<tr><td>'+MWL.fmt(x.a.date)+'</td><td>'+esc(x.a.type)+'</td><td><span class="status '+s[1]+'">'+s[0]+'</span></td><td>'+esc(x.a.by)+'<div class="muted">'+esc(x.a.facility)+'</div></td><td>'+(x.a.attended?'':'<button class="btn outline small" data-aatt="'+x.i+'">Mark attended</button>')+'</td></tr>'}).join('')||'<tr><td colspan="5" class="muted">No appointments confirmed yet.</td></tr>';
 return '<h2 style="font-size:14px;margin:0 0 10px">Schedule an appointment</h2><div class="notice"><span class="status due">Suggested</span> '+MWL.fmt(sug)+(due?' · next due: '+esc(due.vaccine)+' '+(due.dose===0?'birth dose 0':'dose '+due.dose):' · routine review')+'. Adjust the date if needed, then confirm. Only confirmed appointments are shown to the guardian.</div><div class="iform"><div class="field"><label for="at">Type</label><select id="at">'+TYPES.map(function(t){return '<option>'+t+'</option>'}).join('')+'</select></div><div class="field"><label for="ad">Date</label><input id="ad" type="date" value="'+sug+'" min="'+MWL.TODAY+'"></div></div><div class="ierr" id="aerr" role="alert"></div><button class="btn primary" data-asave="1">Confirm appointment</button><h2 style="font-size:14px;margin:18px 0 8px">Appointments</h2><div class="table-wrap"><table><thead><tr><th>Date</th><th>Type</th><th>Status</th><th>Set by</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div><p>An appointment in the past that is not marked attended shows as Missed.</p>'}
function render(){var w=$('#awrap'),c=MWL.getChild(curId());if(w&&c)w.innerHTML=panel(c)}
function save(){var c=MWL.getChild(curId()),d=$('#ad').value,t=$('#at').value,e=$('#aerr');
 if(!d||d<MWL.TODAY||d<c.dob){e.textContent='Choose a date today or later.';return}
 if(c.appts.some(function(a){return a.date===d&&a.type===t})){e.textContent='This appointment already exists.';return}
 c.appts.push({type:t,date:d,status:'confirmed',attended:false,by:MWL.STAFF,facility:MWL.FACILITY});
 MWL.audit('Appointment confirmed',c.id,t+' on '+d);toast('Appointment confirmed.');render()}
document.addEventListener('click',function(e){
 if(e.target.closest('[data-asave]'))save();
 else{var b=e.target.closest('[data-aatt]');if(b){var c=MWL.getChild(curId()),a=c.appts[+b.getAttribute('data-aatt')];a.attended=true;MWL.audit('Appointment attended',c.id,a.type+' on '+a.date);toast('Marked as attended.');render()}}});
new MutationObserver(function(){var m=$('#main');if(!m||$('#awrap'))return;
 if(!m.querySelector('.tab.active[data-tab="appts"]'))return;var e=m.querySelector('.empty');if(!e)return;
 var w=document.createElement('div');w.id='awrap';e.replaceWith(w);render()}).observe($('#main'),{childList:true,subtree:true});
})();
