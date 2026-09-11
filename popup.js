const D={enabled:false,host:"",port:3128,scheme:"http",username:"",password:""};
const $=id=>document.getElementById(id);
function msg(x,c=""){$("message").textContent=x;$("message").className=c}
async function load(){const c={...D,...await chrome.storage.local.get(D)};for(const k of Object.keys(D))$(k).value=c[k]||"";$("enabled").checked=!!c.enabled}
async function save(){const c={enabled:$("enabled").checked,host:$("host").value.trim(),port:Number($("port").value),scheme:$("scheme").value,username:$("username").value.trim(),password:$("password").value};if(!c.host)throw Error("Enter VPS host/IP.");await chrome.storage.local.set(c);return c}
$("save").onclick=async()=>{try{await save();msg("Settings saved.","success")}catch(e){msg(e.message,"error")}};
$("test").onclick=async()=>{try{$("test").disabled=true;msg("Testing Google AI Studio...");await save();const r=await fetch("https://aistudio.google.com/",{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);msg("Connection successful.","success")}catch(e){msg("Connection failed: "+e.message,"error")}finally{$("test").disabled=false}};
load().catch(e=>msg(e.message,"error"));