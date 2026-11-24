/* IPV dose 2 added. Prototype configuration (assumed at 9 months): verify against current Zambian EPI guidance. */
(function(){
var V=MWL.VACCINES,S=MWL.SCHEDULE;
if(V.IPV.indexOf(2)<0)V.IPV.push(2);
if(!S.some(function(s){return s[0]==='IPV'&&s[1]===2}))S.push(['IPV',2,274]);
})();
