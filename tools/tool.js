const $=s=>document.querySelector(s);
const out=$('#output');
const input=$('#input');
const tool=document.body.dataset.tool;

function show(v){if(out)out.textContent=v}
function clearAll(){
  if(input)input.value='';
  const file=$('#file');
  if(file)file.value='';
  show('Your result will appear here.');
}
function utf8ToB64(s){
  const bytes=new TextEncoder().encode(s);
  let binary='';
  bytes.forEach(b=>binary+=String.fromCharCode(b));
  return btoa(binary);
}
function b64ToUtf8(s){
  const binary=atob(s.trim().replace(/\s+/g,''));
  const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
function base64UrlToUtf8(s){
  const padded=s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4);
  return b64ToUtf8(padded);
}
async function run(){
  const v=input?.value||'';
  try{
    let r='';
    if(tool==='json-formatter'){
      if(!v.trim())throw Error('Paste JSON first.');
      r=JSON.stringify(JSON.parse(v),null,2);
    }else if(tool==='json-validator'){
      if(!v.trim())throw Error('Paste JSON first.');
      JSON.parse(v); r='✓ Valid JSON\nNo syntax errors found.';
    }else if(tool==='base64'){
      if(!v.trim())throw Error('Enter text first.');
      r=$('#mode').value==='encode'?utf8ToB64(v):b64ToUtf8(v);
    }else if(tool==='url'){
      if(!v.trim())throw Error('Enter text first.');
      r=$('#mode').value==='encode'?encodeURIComponent(v):decodeURIComponent(v);
    }else if(tool==='jwt'){
      const p=v.trim().split('.');
      if(p.length!==3)throw Error('JWT should contain exactly 3 parts.');
      r=JSON.stringify({header:JSON.parse(base64UrlToUtf8(p[0])),payload:JSON.parse(base64UrlToUtf8(p[1]))},null,2);
    }else if(tool==='hash'){
      if(!v)throw Error('Enter text first.');
      const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));
      r=[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
    }else if(tool==='color'){
      const m=v.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
      if(!m)throw Error('Enter a HEX color such as #2563eb or #abc');
      const hex=m[1].length===3?m[1].split('').map(x=>x+x).join(''):m[1];
      const n=parseInt(hex,16),rr=n>>16&255,g=n>>8&255,b=n&255;
      const max=Math.max(rr,g,b)/255,min=Math.min(rr,g,b)/255,l=(max+min)/2;
      let s=0,h=0;
      if(max!==min){
        const d=max-min;
        s=l>.5?d/(2-max-min):d/(max+min);
        if(max===rr)h=((g-b)/255/d+(g<b?6:0))*60;
        else if(max===g)h=((b-rr)/255/d+2)*60;
        else h=((rr-g)/255/d+4)*60;
      }
      r='HEX: #'+hex.toUpperCase()+'\nRGB: rgb('+rr+', '+g+', '+b+')\nHSL: hsl('+Math.round(h)+', '+Math.round(s*100)+'%, '+Math.round(l*100)+'%)';
    }else if(tool==='image-to-url'){\n      const f=$('#file')?.files?.[0];\n      if(!f)throw Error('Select an image first.');\n      if(!f.type.startsWith('image/'))throw Error('Please select an image file.');\n      r=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Could not read this image.'));reader.readAsDataURL(f)});\n      const preview=$('#preview');\n      if(preview){preview.innerHTML='';const img=new Image();img.src=r;img.style.maxWidth='100%';img.style.maxHeight='320px';img.style.marginTop='14px';img.style.borderRadius='12px';preview.appendChild(img)}\n    }else if(tool==='seo'){
      if(!v.trim())throw Error('Paste HTML source first.');
      const d=new DOMParser().parseFromString(v,'text/html');
      const title=d.querySelector('title')?.textContent.trim()||'Missing';
      const desc=d.querySelector('meta[name="description"]')?.getAttribute('content')?.trim()||'Missing';
      const canonical=d.querySelector('link[rel="canonical"]')?.getAttribute('href')||'Missing';
      const viewport=d.querySelector('meta[name="viewport"]')?.getAttribute('content')||'Missing';
      const robots=d.querySelector('meta[name="robots"]')?.getAttribute('content')||'Missing';
      r='Title: '+title+'\nDescription: '+desc+'\nCanonical: '+canonical+'\nViewport: '+viewport+'\nRobots: '+robots+'\nH1 count: '+d.querySelectorAll('h1').length+'\nH2 count: '+d.querySelectorAll('h2').length+'\nOpen Graph title: '+(d.querySelector('meta[property="og:title"]')?.getAttribute('content')||'Missing');
    }else if(tool==='smart-text'){
      const mode=$('#mode').value;
      if(!v.trim())throw Error('Enter text first.');
      if(mode==='uppercase')r=v.toUpperCase();
      else if(mode==='lowercase')r=v.toLowerCase();
      else if(mode==='title')r=v.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
      else if(mode==='count')r='Characters: '+v.length+'\nWords: '+(v.trim().match(/\S+/g)||[]).length+'\nLines: '+v.split(/\r?\n/).length;
      else if(mode==='bullets')r=v.split(/\r?\n|[.!?]+/).map(x=>x.trim()).filter(Boolean).map(x=>'• '+x).join('\n');
      else r=v.trim().replace(/\s+/g,' ');
    }else throw Error('Tool not configured.');
    show(r||'No input.');
  }catch(e){show('Error: '+(e.message||'Unable to process input.'))}
}

if($('#run'))$('#run').onclick=run;
if($('#clear'))$('#clear').onclick=clearAll;

if(out){
  const copy=document.createElement('button');
  copy.type='button';
  copy.className='secondary copy-btn';
  copy.textContent='Copy Result';
  copy.onclick=async()=>{
    const text=out.textContent||'';
    if(!text||text==='Your result will appear here.')return;
    try{
      await navigator.clipboard.writeText(text);
      copy.textContent='Copied ✓';
      setTimeout(()=>copy.textContent='Copy Result',1200);
    }catch{copy.textContent='Copy unavailable';setTimeout(()=>copy.textContent='Copy Result',1200)}
  };
  out.insertAdjacentElement('afterend',copy);
}

const file=$('#file');
if(file)file.onchange=()=>{
  const f=file.files[0];
  if(!f)return;
  const u=URL.createObjectURL(f),img=new Image();
  img.onload=()=>{
    show('File: '+f.name+'\nType: '+(f.type||'Unknown')+'\nSize: '+(f.size/1024).toFixed(1)+' KB\nDimensions: '+img.naturalWidth+' × '+img.naturalHeight+' px');
    URL.revokeObjectURL(u);
  };
  img.onerror=()=>{show('Could not read this image.');URL.revokeObjectURL(u)};
  img.src=u;
};
