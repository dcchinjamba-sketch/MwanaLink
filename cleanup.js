(function(){
var $=function(s){return document.querySelector(s)};
var DASH='[\\u2013-]';
var R=[
 [/\s?The schedule is prototype configuration and must be verified against current Zambian EPI guidance\./g,''],
 [/Prototype schedule: /g,'Schedule: '],
 [/\s?Verify against current Zambian guidance\./g,''],
 [/\s?Verify against current Zambian HIV-exposed infant guidelines\./g,''],
 [/\s?Test ages are prototype configuration\./g,''],
 [/Vaccine schedule, test ages and MUAC cut-offs are prototype configuration\.\s?/g,''],
 [new RegExp('HAZ, WHZ and BAZ show n/a until official WHO reference tables are imported\\. WAZ uses a 0'+DASH+'6 month demo subset: validate against WHO Anthro before any clinical use\\.','g'),'Weight-for-age reference data covers 0\u20136 months; HAZ, WHZ and BAZ appear once WHO reference tables are imported.'],
 [new RegExp('WAZ uses a 0'+DASH+'6 month demonstration subset to be validated against WHO Anthro\\.','g'),'Weight-for-age reference data covers 0\u20136 months.'],
 [/<p class="note">Schedule is prototype configuration[^<]*<\/p>/g,''],
 [/<p class="note">Vitamin A and deworming schedules are prototype configuration[^<]*<\/p>/g,'']
];
var RM=[/^Schedule is prototype configuration and must be verified against current Zambian EPI guidance\.$/,/^Recommended test ages are prototype configuration\. Verify against current Zambian HIV-exposed infant guidelines\.$/];
var HIT=/prototype|erify against|validate against|demonstration subset|demo subset/;
function clean(h){if(typeof h!=='string'||!HIT.test(h))return h;R.forEach(function(x){h=h.replace(x[0],x[1])});return h}
/* Generated reports (download and print). This file is loaded early so it runs last on the report text. */
var OB=window.Blob;window.Blob=function(p,o){if(o&&/html/.test(o.type||'')&&p&&typeof p[0]==='string')p=[clean(p[0])];return new OB(p,o)};window.Blob.prototype=OB.prototype;
var OO=window.open;window.open=function(){var w=OO.apply(window,arguments);try{if(w){var d=w.document,dw=d.write;d.write=function(h){return dw.call(d,clean(h))}}}catch(e){}return w};
/* Screens */
function walk(){var m=$('#main');if(!m)return;var w=document.createTreeWalker(m,NodeFilter.SHOW_TEXT),n,L=[];
 while((n=w.nextNode()))if(HIT.test(n.nodeValue))L.push(n);
 L.forEach(function(n){var t=n.nodeValue,o=t,s=t.trim();
  if(RM.some(function(r){return r.test(s)})){var p=n.parentNode;if(p&&p!==m&&p.textContent.trim()===s){p.remove();return}}
  R.forEach(function(x){t=t.replace(x[0],x[1])});if(t!==o)n.nodeValue=t})}
new MutationObserver(walk).observe($('#main'),{childList:true,subtree:true});walk();
})();
