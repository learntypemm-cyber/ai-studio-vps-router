const D={enabled:false,host:"",port:3128,scheme:"http",username:"",password:""};
async function cfg(){return {...D,...await chrome.storage.local.get(D)}}
function pac(c){const p=Number(c.port)||3128;const s=c.scheme==="socks5"?"SOCKS5":"PROXY";return "function FindProxyForURL(url,host){var h=host.toLowerCase();if(h===\"aistudio.google.com\"||h===\"generativelanguage.googleapis.com\"||h===\"googleapis.com\"||dnsDomainIs(h,\".googleapis.com\")||h===\"google.dev\"||dnsDomainIs(h,\".google.dev\"))return \""+s+" "+c.host+":"+p+"\";return \"DIRECT\";}"}
async function apply(){const c=await cfg();if(!c.enabled||!c.host||!c.port){await chrome.proxy.settings.clear({scope:"regular"});return}await chrome.proxy.settings.set({scope:"regular",value:{mode:"pac_script",pacScript:{data:pac(c)}}})}
chrome.runtime.onInstalled.addListener(()=>apply().catch(console.error));
chrome.runtime.onStartup.addListener(()=>apply().catch(console.error));
chrome.storage.onChanged.addListener(()=>apply().catch(console.error));
chrome.webRequest.onAuthRequired.addListener(async()=>{const c=await cfg();return c.enabled&&c.username&&c.password?{authCredentials:{username:c.username,password:c.password}}:{}},{urls:["<all_urls>"]},["blocking"]);
apply().catch(console.error);