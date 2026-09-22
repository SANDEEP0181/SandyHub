const $=s=>document.querySelector(s);
const out=$('#output');
const input=$('#input');
const tool=document.body.dataset.tool;
function show(v){out.textContent=v}
function clearAll(){if(input)input.value='';show('Your result will appear here.')}
function b64d(s){return decodeURIComponent(escape(atob(s.trim())))}
async function run(){
  const v=input?.value||'';
  try{
    let r='';
    if(tool==='json-formatter')r=JSON.stringify(JSON.parse(v),null,2);
    else if(tool==='json-validator'){JSON.parse(v);r='✓ Valid JSON\nNo syntax errors found.'}
    else if(tool==='base64')r=$('#mode').value==='encode'?btoa(unescape(encodeURIComponent(v))):b64d(v);
    else if(tool==='url')r=$('#mode').value==='encode'?encodeURIComponent(v):decodeURIComponent(v);
    else if(tool==='jwt'){
      const p=v.trim().split('.');
      if(p.length!==3)throw Error('JWT should contain exactly 3 parts.');
      const d=s=>decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))));
      r=JSON.stringify({header:JSON.parse(d(p[0])),payload:JSON.parse(d(p[1]))},null,2);
    }
    else if(tool==='hash'){
      if(!v)throw Error('Enter text first.');
      const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));
      r=[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
    }
    else if(tool==='color'){
      const m=v.trim().match(/^#?([0-9a-f]{6})$/i);
      if(!m)throw Error('Enter a HEX color such as #2563eb');
      const n=parseInt(m[1],16),rr=n>>16&255,g=n>>8&255,b=n&255,max=Math.max(rr,g,b)/255,min=Math.min(rr,g,b)/255,l=(max+min)/2;
      let s=0,h=0;
      if(max!==min){
        const d=max-min;
        s=l>.5?d/(2-max-min):d/(max+min);
        if(max===rr)h=((g-b)/255/d+(g<b?6:0))*60;
        else if(max===g)h=((b-rr)/255/d+2)*60;
        else h=((rr-g)/255/d+4)*60;
      }
      r='HEX: #'+m[1].toUpperCase()+'\nRGB: rgb('+rr+', '+g+', '+b+')\nHSL: hsl('+Math.round(h)+', '+Math.round(s*100)+'%, '+Math.round(l*100)+'%)';
    }
    else if(tool==='seo'){
      if(!v.trim())throw Error('Paste HTML source first.');
      const d=new DOMParser().parseFromString(v,'text/html');
      r='Title: '+(d.querySelector('title')?.textContent.trim()||'Missing')+'\nDescription: '+(d.querySelector('meta[name="description"]')?.getAttribute('content')?.trim()||'Missing')+'\nCanonical: '+(d.querySelector('link[rel="canonical"]')?.getAttribute('href')||'Missing')+'\nH1 count: '+d.querySelectorAll('h1').length+'\nH2 count: '+d.querySelectorAll('h2').length;
    }
    else if(tool==='smart-text'){
      const mode=$('#mode').value;
      if(!v.trim())throw Error('Enter text first.');
      if(mode==='uppercase')r=v.toUpperCase();
      else if(mode==='lowercase')r=v.toLowerCase();
      else if(mode==='title')r=v.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
      else if(mode==='count')r='Characters: '+v.length+'\nWords: '+(v.trim().match(/\S+/g)||[]).length+'\nLines: '+v.split(/\r?\n/).length;
      else if(mode==='bullets')r=v.split(/\r?\n|[.!?]+/).map(x=>x.trim()).filter(Boolean).map(x=>'• '+x).join('\n');
      else r=v.trim().replace(/\s+/g,' ');
    }
    else throw Error('Tool not configured.');
    show(r||'No input.');
  }catch(e){show('Error: '+e.message)}
}
if($('#run'))$('#run').onclick=run;
if($('#clear'))$('#clear').onclick=clearAll;
const file=$('#file');
if(file)file.onchange=()=>{
  const f=file.files[0];
  if(!f)return;
  const u=URL.createObjectURL(f),img=new Image();
  img.onload=()=>{
    show('File: '+f.name+'\nType: '+(f.type||'Unknown')+'\nSize: '+(f.size/1024).toFixed(1)+' KB\nDimensions: '+img.naturalWidth+' × '+img.naturalHeight+' px');
    URL.revokeObjectURL(u);
  };
  img.onerror=()=>show('Could not read this image.');
  img.src=u;
};