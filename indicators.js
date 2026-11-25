(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc;
var CATS=['All','Registration','Immunisation','Nutrition','HIV','Referrals and appointments','Data and system'],S={pv:'',ds:'',fc:'',from:'',to:'',q:'',cat:'All'},LAST=[];
function isSU(){return document.body.classList.contains('is-superuser')}
function F(){return MWL.db.facilities||[]}
function uniq(a){return a.filter(function(x,i){return x&&a.indexOf(x)===i}).sort()}
function facs(){var f=F();if(S.fc)return f.filter(function(x){return x.name===S.fc});if(S.ds)return f.filter(function(x){return x.district===S.ds&&(!S.pv||x.province===S.pv)});if(S.pv)return f.filter(function(x){return x.province===S.pv});return null}
function label(){return S.fc?'Facility: '+S.fc:S.ds?'District: '+S.ds:S.pv?'Province: '+S.pv:'National (all facilities)'}
function inR(d){return(!S.from||d>=S.from)&&(!S.to||d<=S.to)}
function days(c){return(new Date(MWL.TODAY)-new Date(c.dob))/864e5}
function compute(){
 var T=MWL.TODAY,all=MWL.db.children,sf=facs(),names=sf&&sf.map(function(x){return x.name}),inS=function(n){return !names||names.indexOf(n)>-1},out=[],P=all.filter(function(c){return inS(c.origin)});
 var R='Registration',I='Immunisation',N='Nutrition',H='HIV',RA='Referrals and appointments',D='Data and system',A='Activity (period)';
 function add(c,n,v,d,t){out.push({c:c,n:n,v:String(v),d:d||'',t:t||'Status today'})}
 function pc(a,b){return b?(a/b*100).toFixed(1)+'%':'n/a'}
 function cov(c,n,a,b,x){add(c,n,pc(a,b),a+' of '+b+(x?' · '+x:''))}
 var done=function(c,v,d,by){return c.imm.some(function(i){return !i.void&&i.vaccine===v&&i.dose===d&&(!by||i.date<=by)})},am=function(c){return MWL.ageMonths(c.dob)};
 var im=[],gr=[],va=[],dw=[],ht=[],ap=[];
 all.forEach(function(c){
  c.imm.forEach(function(i){if(!i.void&&inS(i.facility)&&inR(i.date))im.push(i)});
  c.growth.forEach(function(g){if(inS(g.facility)&&inR(g.date))gr.push(g)});
  (c.vita||[]).forEach(function(x){if(inS(x.facility)&&inR(x.date))va.push(x)});
  (c.dewm||[]).forEach(function(x){if(inS(x.facility)&&inR(x.date))dw.push(x)});
  ((c.hei&&c.hei.tests)||[]).forEach(function(x){if(inS(x.facility)&&inR(x.date))ht.push(x)});
  c.appts.forEach(function(a){if(inS(a.facility)&&inR(a.date))ap.push(a)})});
 /* Registration */
 add(R,'Children registered',P.length,'Registered at facilities in scope');
 add(R,'Children registered in the period',P.filter(function(c){return inR(c.registered)}).length,'By registration date',A);
 add(R,'Girls',P.filter(function(c){return c.sex==='F'}).length,'');add(R,'Boys',P.filter(function(c){return c.sex==='M'}).length,'');
 add(R,'Children under 1 year',P.filter(function(c){return am(c)<12}).length,'');
 add(R,'Children aged 1 to under 2 years',P.filter(function(c){return am(c)>=12&&am(c)<24}).length,'');
 add(R,'Children aged 2 to under 5 years',P.filter(function(c){return am(c)>=24&&am(c)<60}).length,'');
 var bw=P.filter(function(c){return c.bw!=null});cov(R,'Low birth weight (under 2.5 kg)',bw.filter(function(c){return c.bw<2.5}).length,bw.length,'among children with birth weight recorded');
 /* Immunisation */
 add(I,'Doses given in the period',im.length,'All vaccines, counted at the facility that gave them',A);
 var vn=[];MWL.SCHEDULE.forEach(function(s){if(vn.indexOf(s[0])<0)vn.push(s[0])});
 vn.forEach(function(v){add(I,'Doses given: '+v,im.filter(function(i){return i.vaccine===v}).length,'',A)});
 add(I,'Doses given: non-routine vaccines',im.filter(function(i){return vn.indexOf(i.vaccine)<0}).length,'',A);
 MWL.SCHEDULE.forEach(function(s){var el=P.filter(function(c){return days(c)>=s[2]}),dn=el.filter(function(c){return done(c,s[0],s[1])}).length,age=s[2]===0?'birth':s[2]<100?Math.round(s[2]/7)+' weeks':Math.round(s[2]/30.4375)+' months';
  cov(I,'Coverage: '+s[0]+(s[1]===0?' birth dose':' dose '+s[1]),dn,el.length,'children aged '+age+' or older')});
 var p1=P.filter(function(c){return done(c,'Pentavalent',1)}).length,p3=P.filter(function(c){return done(c,'Pentavalent',3)}).length;
 add(I,'Pentavalent dropout rate (dose 1 to dose 3)',p1?((p1-p3)/p1*100).toFixed(1)+'%':'n/a','Dose 1: '+p1+' · Dose 3: '+p3);
 [[12,365,'under one'],[24,730,'under two']].forEach(function(x){var el=P.filter(function(c){return am(c)>=x[0]}),fu=el.filter(function(c){var by=MWL.addDays(c.dob,x[1]);return MWL.SCHEDULE.filter(function(s){return s[2]<=x[1]}).every(function(s){return done(c,s[0],s[1],by)})}).length;cov(I,'Fully immunised '+x[2],fu,el.length,'among children who have reached '+x[0]+' months; every scheduled dose due by then, given by the birthday')});
 var z=P.filter(function(c){return days(c)>=42});cov(I,'Zero-dose children',z.filter(function(c){return !c.imm.some(function(i){return !i.void})}).length,z.length,'aged 6 weeks or older with no dose recorded');
 var od=P.filter(function(c){return MWL.dueList(c).some(function(d){return d.overdue})});cov(I,'Children with overdue doses',od.length,P.length,'');
 add(I,'Total overdue doses',P.reduce(function(n,c){return n+MWL.dueList(c).filter(function(d){return d.overdue}).length},0),'');
 /* Nutrition */
 var G=window.MWLG,lat=P.map(function(c){var s=G.sorted(c),g=s[s.length-1];return g?{c:c,g:g,r:G.calc(c,g)}:null}).filter(Boolean);
 cov(N,'Children with a growth measurement',lat.length,P.length,'');
 cov(N,'Growth monitored in the last 90 days',P.filter(function(c){return c.growth.some(function(g){return g.date>=MWL.addDays(T,-90)})}).length,P.length,'');
 add(N,'Growth measurements recorded in the period',gr.length,'',A);
 [['waz','Underweight (weight-for-age below −2 SD)',-2],['waz','Severely underweight (below −3 SD)',-3],['haz','Stunted (height-for-age below −2 SD)',-2],['haz','Severely stunted (below −3 SD)',-3],['whz','Wasted (weight-for-height below −2 SD)',-2],['whz','Severely wasted (below −3 SD)',-3]].forEach(function(x){var den=lat.filter(function(y){return y.r[x[0]]!=null}),num=den.filter(function(y){return y.r[x[0]]<x[2]}).length;
  cov(N,x[1],num,den.length,den.length?'latest measurement':'WHO reference data not loaded for this indicator')});
 var eb=lat.filter(function(y){return y.r.baz!=null});cov(N,'Elevated BMI-for-age (above +2 SD)',eb.filter(function(y){return y.r.baz>2}).length,eb.length,eb.length?'latest measurement':'WHO reference data not loaded for this indicator');
 var mu=P.map(function(c){var s=G.sorted(c).filter(function(g){return g.muac!=null&&MWL.ageMonths(c.dob,g.date)>=5.9});return s.length?s[s.length-1]:null}).filter(Boolean);
 cov(N,'MUAC red zone (below 11.5 cm)',mu.filter(function(g){return g.muac<11.5}).length,mu.length,'latest MUAC, age 6 months or older');
 cov(N,'MUAC yellow zone (11.5 to below 12.5 cm)',mu.filter(function(g){return g.muac>=11.5&&g.muac<12.5}).length,mu.length,'');
 var v6=P.filter(function(c){return am(c)>=6&&am(c)<60});
 cov(N,'Vitamin A: ever received',v6.filter(function(c){return(c.vita||[]).length}).length,v6.length,'children aged 6 to 59 months');
 cov(N,'Vitamin A: received in the last 6 months',v6.filter(function(c){return(c.vita||[]).some(function(x){return x.date>=MWL.addDays(T,-183)})}).length,v6.length,'children aged 6 to 59 months');
 add(N,'Vitamin A doses given in the period',va.length,'',A);
 var d12=P.filter(function(c){return am(c)>=12&&am(c)<60});
 cov(N,'Deworming: ever received',d12.filter(function(c){return(c.dewm||[]).length}).length,d12.length,'children aged 12 to 59 months');
 cov(N,'Deworming: received in the last 6 months',d12.filter(function(c){return(c.dewm||[]).some(function(x){return x.date>=MWL.addDays(T,-183)})}).length,d12.length,'');
 add(N,'Deworming given: Mebendazole',dw.filter(function(x){return x.drug==='Mebendazole'}).length,'',A);add(N,'Deworming given: Albendazole',dw.filter(function(x){return x.drug==='Albendazole'}).length,'',A);
 /* HIV */
 var ce=P.filter(function(c){return c.hiv==='CE'}),cne=P.filter(function(c){return c.hiv==='CNE'}),wh=window.MWLH;
 add(H,'HIV-exposed children (CE)',ce.length,'Registered in scope');add(H,'Not HIV-exposed children (CNE)',cne.length,'');
 add(H,'HIV exposure status not recorded',P.length-ce.length-cne.length,'');
 cov(H,'Exposed share of children with a recorded status',ce.length,ce.length+cne.length,'');
 var op=ce.filter(function(c){return !(c.hei&&c.hei.final)});add(H,'Exposed children under follow-up',op.length,'CE with no final outcome yet');
 if(wh){cov(H,'Exposed children on prophylactic treatment',op.filter(wh.onProph).length,op.length,'among those under follow-up');
  cov(H,'Exposed children due or overdue for testing',op.filter(function(c){return wh.due(c).length}).length,op.length,'among those under follow-up');
  wh.TESTS.forEach(function(t){var el=ce.filter(function(c){return days(c)>=t[2]}),dn=el.filter(function(c){return c.hei&&c.hei.tests.some(function(x){return x.k===t[0]})}).length;cov(H,'HIV test done: '+t[1],dn,el.length,'exposed children old enough for this test')})}
 add(H,'Final outcome: Negative',ce.filter(function(c){return c.hei&&c.hei.final&&c.hei.final.outcome==='Negative'}).length,'');
 add(H,'Final outcome: Positive',ce.filter(function(c){return c.hei&&c.hei.final&&c.hei.final.outcome==='Positive'}).length,'');
 add(H,'HIV test results recorded in the period',ht.length,'',A);
 /* Referrals and appointments */
 var RR=MWL.db.referrals||[],sent=RR.filter(function(r){return inS(r.from)&&inR(r.date)}),rec=RR.filter(function(r){return inS(r.to)&&inR(r.date)});
 add(RA,'Referrals sent',sent.length,'',A);add(RA,'Referrals received',rec.length,'',A);
 cov(RA,'Referrals with a counter-referral recorded',sent.filter(function(r){return r.status==='Completed'}).length,sent.length,'of referrals sent');
 add(RA,'Urgent referrals sent',sent.filter(function(r){return r.urgency==='Urgent'}).length,'',A);add(RA,'Emergency referrals sent',sent.filter(function(r){return r.urgency==='Emergency'}).length,'',A);
 add(RA,'Referrals received, awaiting acknowledgement',rec.filter(function(r){return r.status==='Sent'}).length,'');
 add(RA,'Appointments confirmed in the period',ap.length,'By appointment date, set at facilities in scope',A);
 add(RA,'Appointments attended',ap.filter(function(a){return a.attended}).length,'',A);
 add(RA,'Appointments missed',ap.filter(function(a){return !a.attended&&a.date<T}).length,'Date passed, not marked attended',A);
 add(RA,'Upcoming appointments',ap.filter(function(a){return !a.attended&&a.date>=T}).length,'',A);
 /* Data and system */
 var au=MWL.db.audit.filter(function(a){return inS(a.facility)&&inR(a.time.slice(0,10))});
 add(D,'Corrections made to records',au.filter(function(a){return a.action==='Record corrected'||a.action==='Entry removed (entered in error)'}).length,'',A);
 add(D,'Records deleted',au.filter(function(a){return a.action==='Record deleted'}).length,'',A);
 add(D,'Child health reports generated',au.filter(function(a){return a.action==='Child report generated'}).length,'',A);
 add(D,'Facilities in scope',sf?sf.length:F().length,'');
 add(D,'Active health worker accounts',(MWL.db.users||[]).filter(function(u){return u.role==='staff'&&u.active&&inS(u.facility)}).length,'');
 return{rows:out,pop:P.length}}
function pick(){var c=compute(),q=S.q.toLowerCase(),L=c.rows.filter(function(r){return(S.cat==='All'||r.c===S.cat)&&(!q||(r.n+' '+r.d+' '+r.c).toLowerCase().indexOf(q)>-1)});LAST=L;return{L:L,all:c.rows.length,pop:c.pop}}
function body(){var p=pick();$('#indsum').innerHTML='Showing <b>'+p.L.length+'</b> of '+p.all+' indicators · '+esc(label())+' · Children registered in scope: <b>'+p.pop+'</b>';
 $('#indbody').innerHTML='<table><thead><tr><th>Indicator</th><th class="num">Value</th><th>Detail</th><th>Type</th></tr></thead><tbody>'+(p.L.map(function(r){return '<tr><td style="white-space:normal;min-width:200px"><b>'+esc(r.n)+'</b><div class="muted">'+esc(r.c)+'</div></td><td class="num"><b>'+esc(r.v)+'</b></td><td style="white-space:normal;min-width:160px">'+esc(r.d)+'</td><td><span class="status '+(r.t==='Status today'?'info':'good')+'">'+esc(r.t)+'</span></td></tr>'}).join('')||'<tr><td colspan="4" class="muted">No indicators match.</td></tr>')+'</tbody></table>'}
function sel(id,l,list,cur,all){return '<div class="field"><label for="'+id+'">'+l+'</label><select id="'+id+'"><option value="">'+all+'</option>'+list.map(function(x){return '<option'+(x===cur?' selected':'')+'>'+esc(x)+'</option>'}).join('')+'</select></div>'}
function page(){var f=F(),pv=uniq(f.map(function(x){return x.province})),ds=uniq(f.filter(function(x){return !S.pv||x.province===S.pv}).map(function(x){return x.district})),fs=f.filter(function(x){return(!S.pv||x.province===S.pv)&&(!S.ds||x.district===S.ds)}).map(function(x){return x.name}).sort();
 $('#main').innerHTML='<div class="welcome"><div><div class="eyebrow">Super user</div><h1>Indicators</h1><div class="sub">Search under-five indicators by province, district or health facility.</div></div></div><div class="card"><div class="card-head"><h2>Scope and period</h2><button class="btn outline small" data-icsv="1">Export CSV</button></div><div class="formgrid">'+sel('ipv','Province',pv,S.pv,'All provinces')+sel('ids','District',ds,S.ds,'All districts')+sel('ifc','Health facility',fs,S.fc,'All facilities')+'<div class="field"><label for="ifr">From (activity indicators)</label><input id="ifr" type="date" value="'+S.from+'" max="'+MWL.TODAY+'"></div><div class="field"><label for="ito">To</label><input id="ito" type="date" value="'+S.to+'" max="'+MWL.TODAY+'"></div></div><div class="field"><label for="iq">Search indicators</label><input id="iq" value="'+esc(S.q)+'" placeholder="for example vitamin A, stunted, prophylaxis, referrals" autocomplete="off"></div><div class="tabs">'+CATS.map(function(c){return '<button class="tab'+(c===S.cat?' active':'')+'" data-icat="'+esc(c)+'">'+esc(c)+'</button>'}).join('')+'</div><p id="indsum"></p><div class="table-wrap" id="indbody"></div><div class="notice"><b>Status today</b> indicators describe children registered at the facilities in scope as they are now. <b>Activity (period)</b> indicators count services delivered by the scope’s facilities within the dates chosen (all time if blank). Registered-at facility comes from the child’s originating facility; children registered by administrators belong to no facility and appear only in the national view. Vaccine schedule, test ages and MUAC cut-offs are prototype configuration. Stunting, wasting and BMI need WHO reference tables to be loaded.</div></div>';
 body();document.querySelectorAll('#sidenav .nav,#mnav .nav').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-sa')==='ind')});window.scrollTo(0,0)}
function csv(){var q=function(x){return '"'+String(x).replace(/"/g,'""')+'"'},R=[['MwanaLink under-five indicators'],['Scope',label()],['Period',S.from||'all','to',S.to||'today'],['Generated',MWL.TODAY],[],['Category','Indicator','Value','Detail','Type']].concat(LAST.map(function(r){return[r.c,r.n,r.v,r.d,r.t]}));
 var b=new Blob(['\ufeff'+R.map(function(r){return r.map(q).join(',')}).join('\r\n')],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='MwanaLink_indicators.csv';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},600);MWL.audit('Indicators exported','-',label()+' ('+LAST.length+' indicators)')}
document.addEventListener('click',function(e){var t;
 if(e.target.closest('[data-sa="ind"]')&&isSU())page();
 else if((t=e.target.closest('[data-icat]'))){S.cat=t.getAttribute('data-icat');page()}
 else if(e.target.closest('[data-icsv]'))csv()});
document.addEventListener('change',function(e){var i=e.target.id,v=e.target.value;
 if(i==='ipv'){S.pv=v;S.ds='';S.fc='';page()}else if(i==='ids'){S.ds=v;S.fc='';page()}else if(i==='ifc'){S.fc=v;page()}
 else if(i==='ifr'){S.from=v;body()}else if(i==='ito'){S.to=v;body()}});
document.addEventListener('input',function(e){if(e.target.id==='iq'){S.q=e.target.value;body()}});
})();
