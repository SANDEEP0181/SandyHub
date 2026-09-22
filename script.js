const tools=[
{icon:"✍️",cat:"AI & Creator",name:"AI Text Assistant",desc:"Draft, rewrite, summarize and improve text with guided prompts.",status:"Coming Soon"},
{icon:"{ }",cat:"Developer",name:"JSON Formatter",desc:"Format JSON into a clean, readable structure.",status:"Ready",action:"jsonFormatter"},
{icon:"✓",cat:"Developer",name:"JSON Validator",desc:"Check whether JSON is valid and show a useful error.",status:"Ready",action:"jsonValidator"},
{icon:"⇄",cat:"Developer",name:"Base64 Encoder / Decoder",desc:"Encode text to Base64 or decode Base64 back to text.",status:"Ready",action:"base64"},
{icon:"🔗",cat:"Developer",name:"URL Encoder / Decoder",desc:"Encode or decode URL components directly in your browser.",status:"Ready",action:"url"},
{icon:"🔐",cat:"Developer",name:"JWT Decoder",desc:"Inspect the readable header and payload of a JWT locally.",status:"Ready",action:"jwt"},
{icon:"#",cat:"Developer",name:"Hash Generator",desc:"Generate a SHA-256 hash locally in your browser.",status:"Ready",action:"hash"},
{icon:"🎨",cat:"Creator",name:"Color Converter",desc:"Convert HEX colors to RGB and HSL values.",status:"Ready",action:"color"},
{icon:"🖼️",cat:"Creator",name:"Image Metadata Viewer",desc:"Read image dimensions and basic file information locally.",status:"Ready",action:"image"},
{icon:"🔎",cat:"SEO",name:"Website Meta / SEO Analyzer",desc:"Paste HTML and inspect title, description, headings and canonical data.",status:"Ready",action:"seo"}
];

const grid=document.getElementById("tool-grid");
grid.innerHTML=tools.map((t,i)=>`<article class="card"><div class="icon">${t.icon}</div><small>${t.cat}</small><h3>${t.name}</h3><p>${t.desc}</p><button class="open" data-action="${t.action||""}" data-index="${i}">${t.status==="Ready"?"Open Tool":"Coming Soon"}</button></article>`).join("");
grid.addEventListener("click",e=>{const b=e.target.closest("button");if(b?.dataset.action)openTool(b.dataset.action)});

const names={jsonFormatter:"JSON Formatter",jsonValidator:"JSON Validator",base64:"Base64 Encoder / Decoder",url:"URL Encoder / Decoder",jwt:"JWT Decoder",hash:"SHA-256 Hash Generator",color:"Color Converter",image:"Image Metadata Viewer",seo:"Website Meta / SEO Analyzer"};

function openTool(action){
  closeTool();
  let controls="";
  if(action==="base64") controls='<select id="tool-mode"><option value="encode">Encode</option><option value="decode">Decode</option></select>';
  if(action==="url") controls='<select id="tool-mode"><option value="encode">Encode</option><option value="decode">Decode</option></select>';
  if(action==="image") controls='<input id="image-file" type="file" accept="image/*">';
  const placeholder=action==="seo"?"Paste HTML source code here...":action==="image"?"Choose an image file above...":"Enter or paste your text here...";
  document.body.insertAdjacentHTML("beforeend",`<div class="modal" id="tool-modal"><div class="modal-box"><button class="close" onclick="closeTool()" aria-label="Close">×</button><h2>${names[action]}</h2>${controls}<textarea id="tool-input" placeholder="${placeholder}"></textarea><div class="tool-actions"><button onclick="runTool('${action}')">Run</button><button class="secondary" onclick="clearTool()">Clear</button></div><pre id="tool-output">Your result will appear here.</pre></div></div>`);
  if(action==="image")document.getElementById("tool-input").style.display="none";
}
function closeTool(){document.getElementById("tool-modal")?.remove()}
function clearTool(){const i=document.getElementById("tool-input");if(i)i.value="";const o=document.getElementById("tool-output");if(o)o.textContent="Your result will appear here."}

function b64decode(s){return decodeURIComponent(escape(atob(s.trim())))}

async function runTool(a){
 const input=document.getElementById("tool-input")?.value||"",out=document.getElementById("tool-output");
 try{
  let r="";
  if(a==="jsonFormatter")r=JSON.stringify(JSON.parse(input),null,2);
  else if(a==="jsonValidator"){JSON.parse(input);r="✓ Valid JSON\nNo syntax errors found."}
  else if(a==="base64"){const mode=document.getElementById("tool-mode").value;r=mode==="encode"?btoa(unescape(encodeURIComponent(input))):b64decode(input)}
  else if(a==="url"){const mode=document.getElementById("tool-mode").value;r=mode==="encode"?encodeURIComponent(input):decodeURIComponent(input)}
  else if(a==="jwt"){
   const p=input.trim().split(".");if(p.length!==3)throw Error("JWT should contain exactly 3 parts.");
   const dec=s=>decodeURIComponent(escape(atob(s.replace(/-/g,"+").replace(/_/g,"/"))));
   r=JSON.stringify({header:JSON.parse(dec(p[0])),payload:JSON.parse(dec(p[1]))},null,2)
  }
  else if(a==="hash"){if(!input)throw Error("Enter text first.");const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(input));r=[...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,"0")).join("")}
  else if(a==="color"){
   const m=input.trim().match(/^#?([0-9a-f]{6})$/i);if(!m)throw Error("Enter a HEX color such as #2563eb");
   const h=m[1],n=parseInt(h,16),rr=n>>16&255,g=n>>8&255,b=n&255;
   const max=Math.max(rr,g,b)/255,min=Math.min(rr,g,b)/255,l=(max+min)/2;
   let s=0,hh=0;if(max!==min){const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);switch(max){case rr:hh=((g-b)/255/d+(g<b?6:0))*60;break;case g:hh=((b-rr)/255/d+2)*60;break;default:hh=((rr-g)/255/d+4)*60}}}
   r=`HEX: #${h.toUpperCase()}\nRGB: rgb(${rr}, ${g}, ${b})\nHSL: hsl(${Math.round(hh)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`
  }
  else if(a==="image"){
   const f=document.getElementById("image-file")?.files[0];if(!f)throw Error("Choose an image file first.");
   const url=URL.createObjectURL(f);const img=new Image();img.onload=()=>{out.textContent=`File: ${f.name}\nType: ${f.type||"Unknown"}\nSize: ${(f.size/1024).toFixed(1)} KB\nDimensions: ${img.naturalWidth} × ${img.naturalHeight} px`;URL.revokeObjectURL(url)};img.onerror=()=>{out.textContent="Could not read this image."};img.src=url;return;
  }
  else if(a==="seo"){
   if(!input.trim())throw Error("Paste HTML source first.");
   const d=new DOMParser().parseFromString(input,"text/html"),title=d.querySelector("title")?.textContent.trim()||"Missing";
   const desc=d.querySelector('meta[name="description"]')?.getAttribute("content")?.trim()||"Missing";
   const canon=d.querySelector('link[rel="canonical"]')?.getAttribute("href")||"Missing";
   const h1=d.querySelectorAll("h1").length,h2=d.querySelectorAll("h2").length;
   r=`Title: ${title}\nDescription: ${desc}\nCanonical: ${canon}\nH1 count: ${h1}\nH2 count: ${h2}`
  }
  out.textContent=r||"No input.";
 }catch(e){out.textContent="Error: "+e.message}
}

document.head.insertAdjacentHTML("beforeend",`<style>
.card small{color:#2563eb;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.6px}.card button{background:#fff;cursor:pointer}
.modal{position:fixed;inset:0;background:#0008;display:grid;place-items:center;padding:18px;z-index:100}.modal-box{width:min(700px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:20px;padding:24px;position:relative}.modal-box h2{margin-top:0}
.close{position:absolute;right:15px;top:12px;border:0;background:none;font-size:28px;cursor:pointer}.modal-box textarea{width:100%;min-height:190px;border:1px solid #d1d5db;border-radius:12px;padding:13px;font:inherit;resize:vertical}
.modal-box select,.modal-box input[type=file]{width:100%;margin:0 0 12px;padding:11px;border:1px solid #d1d5db;border-radius:10px;background:#fff}.tool-actions{display:flex;gap:9px;margin:12px 0}.tool-actions button{border:0;border-radius:10px;background:#111827;color:#fff;padding:10px 15px;font-weight:700;cursor:pointer}.tool-actions .secondary{background:#e5e7eb;color:#111827}.modal-box pre{white-space:pre-wrap;background:#f3f4f6;border-radius:12px;padding:15px;min-height:80px;overflow:auto}
</style>`);
