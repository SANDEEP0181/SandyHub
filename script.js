const tools=[
{icon:"✍️",cat:"AI & Creator",name:"AI Text Assistant",desc:"Draft, rewrite, summarize and improve text with guided prompts.",status:"Coming soon"},
{icon:"{ }",cat:"Developer",name:"JSON Formatter",desc:"Format JSON into a clean, readable structure.",status:"Ready",action:"jsonFormatter"},
{icon:"✓",cat:"Developer",name:"JSON Validator",desc:"Check whether JSON is valid and locate common syntax errors.",status:"Ready",action:"jsonValidator"},
{icon:"⇄",cat:"Developer",name:"Base64 Encoder / Decoder",desc:"Convert text to Base64 or decode Base64 back to text.",status:"Ready",action:"base64"},
{icon:"🔗",cat:"Developer",name:"URL Encoder / Decoder",desc:"Safely encode or decode URL components in your browser.",status:"Ready",action:"url"},
{icon:"🔐",cat:"Developer",name:"JWT Decoder",desc:"Inspect the readable header and payload of a JWT locally.",status:"Ready",action:"jwt"},
{icon:"#",cat:"Developer",name:"Hash Generator",desc:"Generate SHA-256 hashes locally in your browser.",status:"Ready",action:"hash"},
{icon:"🎨",cat:"Creator",name:"Color Converter",desc:"Convert HEX, RGB and HSL color values.",status:"Ready",action:"color"},
{icon:"🖼️",cat:"Creator",name:"Image Metadata Viewer",desc:"Inspect basic image dimensions and metadata without uploading.",status:"Ready",action:"image"},
{icon:"🔎",cat:"SEO",name:"Website Meta / SEO Analyzer",desc:"Analyze title, description, headings and canonical information for a page.",status:"Ready",action:"seo"}
];
const grid=document.getElementById("tool-grid");
grid.innerHTML=tools.map((t,i)=>`<article class="card"><div class="icon">${t.icon}</div><small>${t.cat}</small><h3>${t.name}</h3><p>${t.desc}</p><button class="open" data-action="${t.action||""}" data-index="${i}">${t.status==="Ready"?"Open Tool":"Coming Soon"}</button></article>`).join("");
grid.addEventListener("click",e=>{const b=e.target.closest("button");if(!b||!b.dataset.action)return;openTool(b.dataset.action)});
function openTool(action){
const names={jsonFormatter:"JSON Formatter",jsonValidator:"JSON Validator",base64:"Base64 Encoder / Decoder",url:"URL Encoder / Decoder",jwt:"JWT Decoder",hash:"SHA-256 Hash Generator",color:"Color Converter",image:"Image Metadata Viewer",seo:"SEO Analyzer"};
const html=`<div class="modal" id="tool-modal"><div class="modal-box"><button class="close" onclick="closeTool()">×</button><h2>${names[action]}</h2><textarea id="tool-input" placeholder="Enter or paste your text here..."></textarea><div class="tool-actions"><button onclick="runTool('${action}')">Run</button><button class="secondary" onclick="clearTool()">Clear</button></div><pre id="tool-output">Your result will appear here.</pre></div></div>`;
document.body.insertAdjacentHTML("beforeend",html)
}
function closeTool(){document.getElementById("tool-modal")?.remove()}
function clearTool(){document.getElementById("tool-input").value="";document.getElementById("tool-output").textContent="Your result will appear here."}
async function runTool(a){
const input=document.getElementById("tool-input").value, out=document.getElementById("tool-output");
try{
let r="";
if(a==="jsonFormatter")r=JSON.stringify(JSON.parse(input),null,2);
else if(a==="jsonValidator"){JSON.parse(input);r="✓ Valid JSON";}
else if(a==="base64")r=input.trim() ? btoa(unescape(encodeURIComponent(input))) : ""; 
else if(a==="url")r=decodeURIComponent(input)!==input?decodeURIComponent(input):encodeURIComponent(input);
else if(a==="jwt"){const p=input.split(".");if(p.length!==3)throw Error("JWT should contain 3 parts.");r=JSON.stringify({header:JSON.parse(atob(p[0].replace(/-/g,"+").replace(/_/g,"/"))),payload:JSON.parse(atob(p[1].replace(/-/g,"+").replace(/_/g,"/")))},null,2)}
else if(a==="hash"){const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(input));r=[...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,"0")).join("")}
else if(a==="color"){const m=input.trim().match(/^#?([0-9a-f]{6})$/i);if(!m)throw Error("Enter a HEX color such as #2563eb");const h=m[1],n=parseInt(h,16),rr=n>>16&255,g=n>>8&255,b=n&255;r=`HEX: #${h.toUpperCase()}\nRGB: rgb(${rr}, ${g}, ${b})`}
else if(a==="image"){r="Paste an image URL is not required. Use the file picker in the next image-tool update; this Phase-1 card is ready for expansion."}
else if(a==="seo"){r="SEO Analyzer is prepared as a Phase-1 shell. A full URL fetch requires a server/proxy because browsers block many cross-origin page reads."}
out.textContent=r||"No input.";
}catch(e){out.textContent="Error: "+e.message}
}
document.head.insertAdjacentHTML("beforeend",`<style>.card small{color:#2563eb;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.6px}.card button{background:#fff;cursor:pointer}.modal{position:fixed;inset:0;background:#0008;display:grid;place-items:center;padding:18px;z-index:100}.modal-box{width:min(700px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:20px;padding:24px;position:relative}.modal-box h2{margin-top:0}.close{position:absolute;right:15px;top:12px;border:0;background:none;font-size:28px;cursor:pointer}.modal-box textarea{width:100%;min-height:190px;border:1px solid #d1d5db;border-radius:12px;padding:13px;font:inherit;resize:vertical}.tool-actions{display:flex;gap:9px;margin:12px 0}.tool-actions button{border:0;border-radius:10px;background:#111827;color:#fff;padding:10px 15px;font-weight:700;cursor:pointer}.tool-actions .secondary{background:#e5e7eb;color:#111827}.modal-box pre{white-space:pre-wrap;background:#f3f4f6;border-radius:12px;padding:15px;min-height:80px;overflow:auto}</style>`);
