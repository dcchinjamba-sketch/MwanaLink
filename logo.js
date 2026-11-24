(function(){
var $=function(s){return document.querySelector(s)},F={full:'logo-full.png',mark:'logo-mark.png',fav:'favicon.png'};
window.MWL_LOGO={full:F.full,mark:F.mark,fav:F.fav};
/* Convert the images to embedded data so downloaded and printed reports carry the logo. */
Object.keys(F).forEach(function(k){fetch(F[k]).then(function(r){return r.blob()}).then(function(b){var f=new FileReader();f.onload=function(){MWL_LOGO[k]=f.result};f.readAsDataURL(b)}).catch(function(){})});
var st=document.createElement('style');
st.textContent='.brand .logo{width:auto;height:44px;padding:3px 7px;background:#fff;border-radius:10px;display:flex;align-items:center;border:1px solid var(--line)}.brand .logo img{height:100%;width:auto;display:block}#authOv .lgfull{display:block;width:100%;max-width:270px;margin:0 auto 4px}';
document.head.appendChild(st);
var ic=document.createElement('link');ic.rel='icon';ic.type='image/png';ic.href=F.fav;document.head.appendChild(ic);
var lg=$('.brand .logo');if(lg)lg.innerHTML='<img src="'+F.mark+'" alt="MwanaLink logo">';
new MutationObserver(function(){var b=$('#authOv .brand');if(b&&!$('#authOv .lgfull'))b.outerHTML='<img class="lgfull" src="'+F.full+'" alt="MwanaLink Smart Underfive">'}).observe(document.body,{childList:true});
/* Put the logo in the header of every generated child report (download and print). */
function fix(h){if(typeof h!=='string'||h.indexOf('<h1>MwanaLink</h1>')<0||String(MWL_LOGO.full).indexOf('data:')!==0)return h;
 return h.replace(/<h1>MwanaLink<\/h1><div class="note">[^<]*<\/div>/,'<img src="'+MWL_LOGO.full+'" alt="MwanaLink" style="height:76px;display:block"><div class="note">Every child. One connected health record.</div>')}
var OB=window.Blob;window.Blob=function(p,o){if(o&&/html/.test(o.type||'')&&p&&typeof p[0]==='string')p=[fix(p[0])];return new OB(p,o)};window.Blob.prototype=OB.prototype;
var oo=window.open;window.open=function(){var w=oo.apply(window,arguments);try{if(w){var d=w.document,dw=d.write.bind(d);d.write=function(h){return dw(fix(h))}}}catch(e){}return w};
})();
