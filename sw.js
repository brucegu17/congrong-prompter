const CACHE='congrong-public-v5-1';
const ROOT=new URL('./',self.location.href).href;
const ASSETS=['index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png','icon.svg','recording.js','recording.css'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const entries=await Promise.all(ASSETS.map(async name=>{const url=new URL(name,ROOT).href,response=await fetch(url,{cache:'reload',credentials:'same-origin'});if(!response.ok||new URL(response.url).origin!==self.location.origin)throw new Error('Asset unavailable');if(name==='index.html'&&!(await response.clone().text()).includes('name="congrong-app" content="offline-v1"'))throw new Error('App shell unavailable');return [url,response];}));
 const cache=await caches.open(CACHE);await Promise.all(entries.map(([url,response])=>cache.put(url,response)));await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
// Cache only this app shell. Manuscripts and recordings stay in local device storage.
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(new URL(ROOT).pathname))return;const relative=url.pathname.slice(new URL(ROOT).pathname.length);const name=relative===''?'index.html':relative;if(!ASSETS.includes(name))return;event.respondWith((async()=>{const cache=await caches.open(CACHE),cached=await cache.match(new URL(name,ROOT).href);return cached||fetch(event.request);})());});
self.addEventListener('message',event=>{if(event.data?.type!=='VERIFY_CACHE')return;event.waitUntil((async()=>{const cache=await caches.open(CACHE),found=await Promise.all(ASSETS.map(name=>cache.match(new URL(name,ROOT).href)));event.ports[0]?.postMessage({ready:found.every(Boolean)});})());});
