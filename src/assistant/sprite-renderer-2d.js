(function(global){
  function apply(preferences){
    var root=document.getElementById('timeSprite');if(!root)return;
    if(root.style&&typeof root.style.setProperty==='function'){root.style.setProperty('--sprite-primary',preferences.primary);root.style.setProperty('--sprite-secondary',preferences.secondary);}
    if(typeof root.setAttribute==='function')['eyes','expression','ears','hat','glasses','scarf','badge','aura','animationIntensity'].forEach(function(key){root.setAttribute('data-sprite-'+key.replace(/[A-Z]/g,function(m){return'-'+m.toLowerCase();}),preferences[key]);});
    if(root.classList&&typeof root.classList.toggle==='function')root.classList.toggle('sprite-renderer-3d',preferences.renderer==='3d');
    var title=document.getElementById('timeSpriteTitle');if(title)title.textContent=preferences.name;
  }
  function stateChanged(event){
    if(event.phase!=='enter')return;
    var root=document.getElementById('timeSprite');if(!root)return;
    if(typeof root.setAttribute==='function')root.setAttribute('data-bear-state',event.state);
  }
  function init(){
    if(global.ShikeSpriteCustomization)global.ShikeSpriteCustomization.subscribe(apply);
    if(global.ShikeBearState)global.ShikeBearState.subscribe(stateChanged);
  }
  global.ShikeSpriteRenderer2D=Object.freeze({apply:apply,init:init});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(window);
