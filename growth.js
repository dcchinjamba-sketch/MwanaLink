(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc,KR='mwl_ref_v1',REF={};
try{REF=JSON.parse(localStorage.getItem(KR)||'{}')}catch(e){}
var st=document.createElement('style');
st.textContent='.gsvg{width:100%;height:auto;display:block}.gsvg text{fill:var(--muted);font-size:10px}.gcard{border:1px solid var(--line);border-radius:10px;padding:12px;margin-top:14px;background:var(--soft)}.alertbox{border:1px solid var(--red);background:var(--redbg);color:var(--red);padding:10px 12px;border-radius:10px;margin:6px 0;font-size:12px;line-height:1.5}.alertbox.warn{border-color:var(--amber);background:var(--amberbg);color:var(--amber)}details summary{cursor:pointer;font-size:12px;font-weight:750;color:var(--green);margin-top:14px}.gtxt{width:100%;min-height:80px;padding:10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink);font-size:12px}';
document.head.appendChild(st);

/* WHO weight-for-age LMS, months 0-6 only. Demo subset typed from memory: validate against WHO Anthro.
   Import official WHO tables below for other ages and for HAZ, WHZ and BAZ. */
var DEMO={wazM:[[0,.3487,3.3464,.14602],[1,.2297,4.4709,.13395],[2,.197,5.5675,.12385],[3,.1738,6.3762,.11727],[4,.1553,7.0023,.11316],[5,.1395,7.5105,.1108],[6,.1257,7.934,.10958]],
wazF:[[0,.3809,3.2322,.14171],[1,.1714,4.1873,.13724],[2,.0962,5.1282,.13],[3,.0402,5.8458,.12619],[4,-.005,6.4237,.12402],[5,-.043,6.8985,.12274],[6,-.0756,7.297,.12204]]};
function tbl(i,s){return REF[i+s]||DEMO[i+s]||null}
function lms(i,s,x){var t=tbl(i,s);if(!t||x<t[0][0]-.25||x>t[t.length-1][0]+.25)return null;x=Math.min(Math.max(x,t[0][0]),t[t.length-1][0]);var k=0;while(k<t.length-2&&x>t[k+1][0])k++;var a=t[k],b=t[k+1],f=b[0]===a[0]?0:(x-a[0])/(b[0]-a[0]);return[1,2,3].map(function(j){return a[j]+(b[j]-a[j])*f})}
function sdv(p,k){return p[0]?p[1]*Math.pow(1+p[0]*p[2]*k,1/p[0]):p[1]*Math.exp(p[2]*k)}
function zsc(X,p,mod){var L=p[0],M=p[1],S=p[2],z=L?(Math.pow(X/M,L)-1)/(L*S):Math.log(X/M)/S;
 if(mod&&Math.abs(z)>3){z=z>3?3+(X-sdv(p,3))/(sdv(p,3)-sdv(p,2)):-3+(X-sdv(p,-3))/(sdv(p,-2)-sdv(p,-3))}return z}
var CL={waz:[['Severely underweight',-3],['Underweight',-2]],haz:[['Severely stunted',-3],['Stunted',-2]],whz:[['Severely wasted',-3],['Wasted',-2]],baz:[['Severe thinness',-3],['Thinness',-2]]};
var NM={waz:'Weight-for-age',haz:'Height-for-age',whz:'Weight-for-height',baz:'BMI-for-age'};
function cls(i,z){if(z==null)return null;for(var k=0;k<CL[i].length;k++)if(z<CL[i][k][1])return{n:CL[i][k][0],sev:CL[i][k][1]===-3};
 if(i!=='waz'&&z>2)return{n:i==='baz'?'Elevated BMI-for-age':'Elevated weight-for-height',sev:false,hi:true};return{n:'Within reference range',ok:true}}
function calc(c,g){var a=MWL.ageMonths(c.dob,g.date),adj=g.length?g.length+(a<24&&g.method==='standing'?.7:a>=24&&g.method==='lying'?-.7:0):null,r={a:a,adj:adj},p;
 p=lms('waz',c.sex,a);r.waz=p?zsc(g.weight,p,true):null;
 p=adj&&lms('haz',c.sex,a);r.haz=p?zsc(adj,p,false):null;
 p=adj&&lms('whz',c.sex,adj);r.whz=p?zsc(g.weight,p,false):null;
 p=adj&&lms('baz',c.sex,a);r.baz=p?zsc(g.weight/Math.pow(adj/100,2),p,true):null;return r}
/* MUAC: configurable. Verify thresholds and age eligibility against Zambia IMAM guidance. */
var MUAC={minAge:5.9,red:11.5,yellow:12.5};
function muacC(m,a){if(m==null)return null;if(a<MUAC.minAge)return{n:'Not assessed (under 6 months)',ok:true};if(m<MUAC.red)return{n:'Red zone: possible severe acute malnutrition',sev:true};if(m<MUAC.yellow)return{n:'Yellow zone: possible moderate acute malnutrition'};return{n:'Green zone: normal',ok:true}}
function advice(i,k){var s=k.sev;
 if(i==='waz')return s?'Prominent alert: nutritional assessment and timely clinical review recommended.':'Nutritional assessment and appropriate follow-up recommended.';
 if(i==='haz')return 'Assess for chronic growth concerns; counselling as appropriate.';
 if(i==='whz')return k.hi?'Further clinical and dietary assessment recommended.':s?'Urgent assessment alert: timely clinical assessment under approved IMAM guidance.':'Flag for timely clinical assessment under approved IMAM guidance.';
 return k.hi?'Further clinical and dietary assessment recommended.':'Nutritional assessment recommended.'}
function sorted(c){return c.growth.slice().sort(function(a,b){return a.date<b.date?-1:1})}
function alerts(c){var rows=sorted(c),g=rows[rows.length-1],out=[];if(!g)return out;var r=calc(c,g);
 ['waz','haz','whz','baz'].forEach(function(i){var k=cls(i,r[i]);if(k&&!k.ok)out.push({sev:k.sev,t:NM[i]+' z-score '+r[i].toFixed(2)+': '+k.n,a:advice(i,k)})});
 var m=muacC(g.muac,r.a);if(m&&!m.ok)out.push({sev:m.sev,t:'MUAC '+g.muac+' cm: '+m.n,a:m.sev?'Urgent assessment under approved IMAM guidance.':'Assessment under approved IMAM guidance recommended.'});return out}
function zcell(i,z){if(z==null)return '<span class="muted">n/a</span>';var k=cls(i,z);return z.toFixed(2)+(k.ok?'':'<br><span class="status '+(k.sev?'late':'due')+'">'+k.n+'</span>')}

function chart(c,rows){
 var t=tbl('waz',c.sex);if(!t)return '<div class="empty">Weight-for-age reference data is not loaded.</div>';
 var xmax=t[t.length-1][0],Z=[-3,-2,0,2,3],W=640,H=290,L=36,R=48,T=14,B=30,x0=L,x1=W-R,
 lo=Math.floor(sdv(lms('waz',c.sex,0),-3)),hi=Math.ceil(sdv(lms('waz',c.sex,xmax),3)),
 X=function(m){return x0+m/xmax*(x1-x0)},Y=function(v){return H-B-(v-lo)/(hi-lo)*(H-B-T)};
 var s='<svg class="gsvg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Weight-for-age growth chart with WHO reference lines">';
 for(var v=lo;v<=hi;v++)s+='<line x1="'+x0+'" x2="'+x1+'" y1="'+Y(v)+'" y2="'+Y(v)+'" style="stroke:var(--line)"/><text x="4" y="'+(Y(v)+3)+'">'+v+'</text>';
 for(var m=0;m<=xmax;m++)s+='<text x="'+(X(m)-4)+'" y="'+(H-12)+'">'+m+'</text>';
 s+='<text x="'+(x0)+'" y="'+(H-1)+'">Age (months)</text><text x="4" y="10">kg</text>';
 Z.forEach(function(z){var pts=[];for(var m=0;m<=xmax+.001;m+=.25)pts.push(X(m).toFixed(1)+','+Y(sdv(lms('waz',c.sex,m),z)).toFixed(1));
  var col=Math.abs(z)===3?'var(--red)':Math.abs(z)===2?'var(--amber)':'var(--green)';
  s+='<polyline fill="none" style="stroke:'+col+';stroke-width:'+(z===0?2:1.2)+'" stroke-dasharray="'+(z===0?'':'4 3')+'" points="'+pts.join(' ')+'"/><text x="'+(x1+4)+'" y="'+(Y(sdv(lms('waz',c.sex,xmax),z))+3)+'">'+(z>0?'+':z<0?'−':'')+Math.abs(z)+' SD</text>'});
 var pp=rows.filter(function(r){return r.r.a>=-.25&&r.r.a<=xmax+.25});
 s+='<polyline fill="none" style="stroke:var(--navy);stroke-width:2" points="'+pp.map(function(r){return X(Math.min(Math.max(r.r.a,0),xmax)).toFixed(1)+','+Y(Math.min(Math.max(r.g.weight,lo),hi)).toFixed(1)}).join(' ')+'"/>';
 pp.forEach(function(r){var out=r.r.waz!=null&&Math.abs(r.r.waz)>2,px=X(Math.min(Math.max(r.r.a,0),xmax)),py=Y(Math.min(Math.max(r.g.weight,lo),hi));
  s+='<circle cx="'+px+'" cy="'+py+'" r="'+(out?6:4)+'" style="fill:'+(out?'var(--red)':'var(--navy)')+';stroke:var(--card);stroke-width:1.5"/><text x="'+(px+7)+'" y="'+(py-7)+'">'+r.g.weight+(out?' !':'')+'</text>'});
 return s+'</svg><p>Lines show WHO reference −3, −2, 0, +2 and +3 SD. Red markers with “!” are outside ±2 SD. The classification appears in the table.</p>'}

function panel(c){
 var rows=sorted(c).map(function(g){return{g:g,r:calc(c,g)}}),al=alerts(c);
 var ah=al.map(function(a){return '<div class="alertbox'+(a.sev?'':' warn')+'" role="alert"><b>'+esc(a.t)+'</b>'+(a.sev?' · urgent assessment suggested':'')+'<br>'+esc(a.a)+'</div>'}).join('');
 if(al.length)ah+='<p>These are automated flags, not a diagnosis. A health worker must review, confirm and decide any action under approved guidance. MwanaLink does not prescribe treatment.</p>';
 var tr=rows.map(function(x){var g=x.g,r=x.r,m=muacC(g.muac,r.a);return '<tr><td>'+MWL.fmt(g.date)+'</td><td>'+r.a.toFixed(1)+'</td><td>'+g.weight+' kg</td><td>'+(g.length?g.length+' → '+r.adj.toFixed(1)+' cm<div class="muted">'+g.method+'</div>':'–')+'</td><td>'+(g.muac!=null?g.muac+' cm'+(m?'<br><span class="status '+(m.ok?'good':m.sev?'late':'due')+'">'+m.n+'</span>':''):'–')+'</td><td>'+zcell('waz',r.waz)+'</td><td>'+zcell('haz',r.haz)+'</td><td>'+zcell('whz',r.whz)+'</td><td>'+zcell('baz',r.baz)+'</td></tr>'}).join('')||'<tr><td colspan="9" class="muted">No measurements recorded.</td></tr>';
 return ah+'<h2 style="font-size:14px;margin:12px 0 10px">Record a measurement</h2><div class="iform"><div class="field"><label for="gd">Date</label><input id="gd" type="date" value="'+MWL.TODAY+'" min="'+c.dob+'" max="'+MWL.TODAY+'"></div><div class="field"><label for="gw">Weight (kg)</label><input id="gw" type="number" step="0.01"></div><div class="field"><label for="gl">Length/height (cm)</label><input id="gl" type="number" step="0.1"></div><div class="field"><label for="gm">Measured</label><select id="gm"><option value="lying">Lying (length)</option><option value="standing">Standing (height)</option></select></div><div class="field"><label for="gu">MUAC (cm, optional)</label><input id="gu" type="number" step="0.1"></div></div><div class="ierr" id="gerr" role="alert"></div><button class="btn primary" data-gsave="1">Save measurement</button>'+
 '<div class="gcard"><h2 style="font-size:14px;margin:0 0 8px">Weight-for-age chart</h2>'+chart(c,rows)+'</div>'+
 '<h2 style="font-size:14px;margin:18px 0 8px">Measurement history and z-scores</h2><div class="table-wrap"><table><thead><tr><th>Date</th><th>Age (mo)</th><th>Weight</th><th>Length (raw → adjusted)</th><th>MUAC</th><th>WAZ</th><th>HAZ</th><th>WHZ</th><th>BAZ</th></tr></thead><tbody>'+tr+'</tbody></table></div>'+
 '<div class="notice">Length/height is adjusted by 0.7 cm when the measuring method does not match the child’s age (standing under 24 months, or lying at 24 months and over). Raw and adjusted values are both kept. HAZ, WHZ and BAZ show n/a until official WHO reference tables are imported. WAZ uses a 0–6 month demo subset: validate against WHO Anthro before any clinical use.</div>'+
 '<details><summary>WHO reference data (import)</summary><p>Paste official WHO LMS rows, one per line: <code>indicator,sex,x,L,M,S</code>. Indicator is waz, haz, whz or baz. Sex is M or F. x is age in months (for whz, length in cm).</p><textarea class="gtxt" id="gref" placeholder="haz,F,0,1,49.1477,0.0379"></textarea><div class="ierr" id="gimp"></div><button class="btn secondary small" data-gimport="1">Import rows</button> <button class="btn outline small" data-gclear="1">Clear imported</button></details>'}
function curId(){var m=$('.profile-meta'),r=m&&/MWL-[A-Z0-9]+/.exec(m.textContent);return r?r[0]:null}
function toast(t){var r=$('#toastRoot');r.innerHTML='<div class="toast">'+esc(t)+'</div>';setTimeout(function(){r.innerHTML=''},2600)}
function render(){var w=$('#gwrap'),c=MWL.getChild(curId());if(w&&c)w.innerHTML=panel(c)}
function save(){var c=MWL.getChild(curId()),e=$('#gerr'),n=function(i){var v=$('#'+i).value;return v===''?null:+v},w=n('gw'),l=n('gl'),u=n('gu'),d=$('#gd').value;
 if(!d||d<c.dob||d>MWL.TODAY){e.textContent='Choose a date between the child’s birth and today.';return}
 if(!(w>=0.5&&w<=30)){e.textContent='Enter a weight between 0.5 and 30 kg.';return}
 if(l!=null&&!(l>=30&&l<=125)){e.textContent='Length/height must be between 30 and 125 cm.';return}
 if(u!=null&&!(u>=5&&u<=25)){e.textContent='MUAC must be between 5 and 25 cm.';return}
 if(c.growth.some(function(g){return g.date===d})){e.textContent='A measurement for this date already exists.';return}
 c.growth.push({date:d,weight:w,length:l,muac:u,method:$('#gm').value,by:MWL.STAFF,facility:MWL.FACILITY});
 c.lastFacility=MWL.FACILITY;MWL.audit('Growth measurement recorded',c.id,w+' kg on '+d);toast('Measurement saved. Review any flags.');render()}
function imp(clear){var e=$('#gimp');
 if(clear){REF={};try{localStorage.removeItem(KR)}catch(x){}render();toast('Imported reference data cleared.');return}
 var n=0;$('#gref').value.split('\n').forEach(function(l){var p=l.split(',').map(function(x){return x.trim()});
  if(p.length===6&&CL[p[0]]&&(p[1]==='M'||p[1]==='F')&&p.slice(2).every(function(x){return x!==''&&!isNaN(x)})){(REF[p[0]+p[1]]=REF[p[0]+p[1]]||[]).push(p.slice(2).map(Number));n++}});
 Object.keys(REF).forEach(function(k){REF[k].sort(function(a,b){return a[0]-b[0]})});
 if(!n){e.textContent='No valid rows found.';return}
 try{localStorage.setItem(KR,JSON.stringify(REF))}catch(x){}render();toast(n+' reference rows imported.')}
document.addEventListener('click',function(e){
 if(e.target.closest('[data-gsave]'))save();
 else if(e.target.closest('[data-gimport]'))imp(false);
 else if(e.target.closest('[data-gclear]'))imp(true)});
new MutationObserver(function(){var m=$('#main');if(!m||$('#gwrap'))return;
 if(!m.querySelector('.tab.active[data-tab="growth"]'))return;var e=m.querySelector('.empty');if(!e)return;
 var w=document.createElement('div');w.id='gwrap';e.replaceWith(w);render()}).observe($('#main'),{childList:true,subtree:true});
window.MWLG={calc:calc,alerts:alerts,sorted:sorted,chart:chart,zcell:zcell};
})();
