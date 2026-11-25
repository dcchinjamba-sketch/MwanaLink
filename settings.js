(function(){
var $=function(s){return document.querySelector(s)},esc=MWL.esc,KEY='mwl_theme';
var st=document.createElement('style');
st.textContent='#themeBtn,#outBtn{display:none!important}#setBtn{white-space:nowrap}.sseg{display:flex;gap:6px;margin:6px 0 14px}.sseg .btn{flex:1;justify-content:center}.swho{padding:10px 12px;background:var(--soft);border-radius:10px;margin-bottom:14px;font-size:13px}.sbar{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}';
document.head.appendChild(st);
function getT(){try{return localStorage.getItem(KEY)||'system'}catch(e){return 'system'}}
function setT(t){try{localStorage.setItem(KEY,t)}catch(e){}
 if(typeof window.apply==='function')window.apply(t);
 else{var r=document.documentElement;if(t==='system')r.removeAttribute('data-theme');else r.setAttribute('data-theme',t)}}
var tr=$('.top-right');
if(tr&&!$('#setBtn'))tr.insertAdjacentHTML('beforeend','<button class="themebtn" id="setBtn" type="button" aria-haspopup="dialog">⚙ Settings</button>');
function seg(){var c=getT();return[['system','System'],['light','Light'],['dark','Dark']].map(function(x){return '<button type="button" class="btn '+(x[0]===c?'primary':'outline')+'" data-stheme="'+x[0]+'">'+x[1]+'</button>'}).join('')}
function open(){close();var u=$('#uchip'),d=document.createElement('div');d.className='mback';d.id='setMod';
 d.innerHTML='<div class="mbox" role="dialog" aria-modal="true" aria-label="Settings"><h2>Settings</h2>'+(u?'<div class="swho">'+u.innerHTML+'</div>':'')+'<div class="eyebrow">Theme</div><div class="sseg" id="sseg">'+seg()+'</div>'+($('#outBtn')?'<div class="eyebrow">Account</div><div class="sbar"><button type="button" class="btn danger" data-sout="1">Sign out</button></div>':'')+'<div class="sbar" style="margin-top:16px"><button type="button" class="btn outline" data-sclose="1">Close</button></div></div>';
 document.body.appendChild(d)}
function close(){var m=$('#setMod');if(m)m.remove()}
document.addEventListener('click',function(e){var t;
 if(e.target.closest('#setBtn'))open();
 else if((t=e.target.closest('[data-stheme]'))){setT(t.getAttribute('data-stheme'));var s=$('#sseg');if(s)s.innerHTML=seg()}
 else if(e.target.closest('[data-sout]')){close();var o=$('#outBtn');if(o)o.click()}
 else if(e.target.closest('[data-sclose]'))close();
 else if(e.target.id==='setMod')close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
})();
