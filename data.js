/* MwanaLink shared data. Demo only: stored in this device's browser storage. */
var MWL=(function(){
var KEY='mwl_data_v2',FACILITY='Demo Health Centre',STAFF='Demo Health Worker',TODAY=new Date().toISOString().slice(0,10);
var VACCINES={'BCG':[1],'OPV':[0,1,2,3,4],'Pentavalent':[1,2,3],'PCV':[1,2,3],'Rotavirus':[1,2,3],'IPV':[1],'MR (Measles-Rubella)':[1,2],'MAV (R21/Matrix-M)':[1,2,3,4],'Other (non-routine)':null};
/* Prototype schedule [vaccine, dose, age in days]. Verify against current Zambian EPI guidance. */
var SCHEDULE=[['BCG',1,0],['OPV',0,0],['OPV',1,42],['OPV',2,70],['OPV',3,98],['Pentavalent',1,42],['Pentavalent',2,70],['Pentavalent',3,98],['PCV',1,42],['PCV',2,70],['PCV',3,98],['Rotavirus',1,42],['Rotavirus',2,70],['Rotavirus',3,98],['IPV',1,98],['MR (Measles-Rubella)',1,274],['MAV (R21/Matrix-M)',1,183],['MAV (R21/Matrix-M)',2,213],['MAV (R21/Matrix-M)',3,244],['MR (Measles-Rubella)',2,548],['MAV (R21/Matrix-M)',4,548]];
function addDays(d,n){return new Date(new Date(d).getTime()+n*864e5).toISOString().slice(0,10)}
function monthsAgo(m){return new Date(Date.now()-m*30.4375*864e5).toISOString().slice(0,10)}
function ageMonths(dob,d){return (new Date(d||TODAY)-new Date(dob))/864e5/30.4375}
function ageText(dob){var m=Math.floor(ageMonths(dob));return m<24?m+' months':Math.floor(m/12)+' yrs '+(m%12)+' mo'}
function fmt(d){if(!d)return 'Not recorded';var x=new Date(d+'T00:00:00');return isNaN(x)?'Not recorded':x.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}
function token(){var a=crypto.getRandomValues(new Uint8Array(12)),s='';for(var i=0;i<a.length;i++)s+=('0'+a[i].toString(16)).slice(-2);return s}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function makeChild(id,name,sex,months,guardian,nrc,phone){var dob=monthsAgo(months);return{id:id,name:name,sex:sex,dob:dob,pob:'Lusaka',bw:3.3,guardian:guardian,nrc:nrc,phone:phone,rel:'Parent',token:token(),origin:FACILITY,lastFacility:FACILITY,registered:dob,imm:[],growth:[],appts:[],fictional:true}}
function seed(){
var a=makeChild('MWL-A1B2C3','Chanda Mulenga','F',4,'Grace Mulenga','123456/10/1','0970000001'),
b=makeChild('MWL-D4E5F6','Mwila Banda','M',6,'Joseph Banda','234567/10/1','0970000002'),
c=makeChild('MWL-G7H8J9','Tendai Phiri','M',3,'Ruth Phiri','345678/10/1','0970000003'),
d=makeChild('MWL-K2L3M4','Natasha Mulenga','F',2,'Grace Mulenga','123456/10/1','0970000001');
function imm(k,l){l.forEach(function(x){k.imm.push({vaccine:x[0],dose:x[1],date:addDays(k.dob,x[2]),by:STAFF,facility:FACILITY,batch:'',notes:''})})}
imm(a,[['BCG',1,0],['OPV',0,0],['OPV',1,42],['Pentavalent',1,42],['PCV',1,42],['Rotavirus',1,42],['OPV',2,70],['Pentavalent',2,70],['PCV',2,70],['Rotavirus',2,70]]);
imm(b,[['BCG',1,0],['OPV',0,0]]);
imm(c,[['BCG',1,0],['OPV',0,0],['OPV',1,42],['Pentavalent',1,42],['PCV',1,42],['Rotavirus',1,42]]);
imm(d,[['BCG',1,0],['OPV',0,0]]);
function gr(k,mo,w,len,muac){k.growth.push({date:addDays(k.dob,Math.round(mo*30.4375)),weight:w,length:len,muac:muac,method:'lying',by:STAFF,facility:FACILITY})}
gr(a,0,3.3,50,null);gr(a,2,5.0,58,null);gr(a,3.95,6.4,62,null);
gr(b,0,3.2,49,null);gr(b,3,5.1,60,null);gr(b,6,5.3,63,11.2);
gr(c,0,3.5,50,null);gr(c,2,5.4,58,null);gr(c,3,6.2,61,null);
gr(d,0,3.2,49,null);gr(d,1.9,3.9,55,null);
return{children:[a,b,c,d],audit:[]}}
var db=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}}
function load(){try{db=JSON.parse(localStorage.getItem(KEY))}catch(e){db=null}if(!db||!db.children){db=seed();save()}return db}
function audit(action,childId,detail){db.audit.unshift({time:new Date().toISOString(),by:STAFF,facility:FACILITY,action:action,childId:childId,detail:detail});save()}
function getChild(id){return db.children.filter(function(c){return c.id===id})[0]||null}
function dueList(c){var done={};c.imm.forEach(function(i){if(!i.void)done[i.vaccine+'|'+i.dose]=1});return SCHEDULE.filter(function(s){return !done[s[0]+'|'+s[1]]}).map(function(s){var due=addDays(c.dob,s[2]);return{vaccine:s[0],dose:s[1],due:due,overdue:due<TODAY}})}
load();
return{FACILITY:FACILITY,STAFF:STAFF,TODAY:TODAY,VACCINES:VACCINES,SCHEDULE:SCHEDULE,addDays:addDays,ageMonths:ageMonths,ageText:ageText,fmt:fmt,token:token,esc:esc,makeChild:makeChild,save:save,load:load,audit:audit,getChild:getChild,dueList:dueList,get db(){return db}};
})();
