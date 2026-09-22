(function(){
  function init(){
    if(!window.SandyAI)return;
    var main=document.querySelector('.tool-page,.wrap'); if(!main)return;
    if(document.getElementById('sandy-ai-run'))return;
    var out=document.querySelector('#out,#o');
    if(!out)return;
    var btn=document.createElement('button');
    btn.id='sandy-ai-run'; btn.type='button'; btn.textContent='Generate with SandyHub AI';
    btn.style.margin='8px 8px 8px 0';
    var status=document.createElement('p'); status.id='sandy-ai-status';
    var anchor=out.parentNode; anchor.insertBefore(btn,out);
    anchor.insertBefore(status,out);
    btn.onclick=async function(){
      var fields=[].slice.call(main.querySelectorAll('input,textarea')).filter(function(x){return x!==out;});
      var lines=fields.map(function(x){var v=(x.value||'').trim();return v?v:'';}).filter(Boolean);
      if(!lines.length){status.textContent='Add some details first.';return;}
      var title=(document.querySelector('h1')||{}).textContent||'SandyHub AI Tool';
      var prompt='You are an expert assistant using the SandyHub tool: '+title+'.\\n\\nUser inputs:\\n'+lines.join('\\n')+'\\n\\nProvide a useful, accurate, well-structured result. Do not invent missing facts.';
      btn.disabled=true; status.textContent='Generating with SandyHub AI…';
      try{out.value=await SandyAI.generate([{role:'user',content:prompt}]);status.textContent='AI response ready.';}
      catch(e){status.textContent='AI is temporarily unavailable: '+(e.message||'request failed')+'. Your local prompt generator still works.';}
      finally{btn.disabled=false;}
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
