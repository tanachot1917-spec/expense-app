// เปลี่ยนเลขเวอร์ชันทุกครั้งที่อัพเดทแอพ เพื่อให้เครื่องดึงไฟล์ใหม่
const VERSION = 'v9';
const CACHE = 'rr-' + VERSION;
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// ออนไลน์: ดึงของใหม่ก่อน (ถามเซิร์ฟเวอร์ทุกครั้ง ไม่ใช้แคช HTTP 10 นาทีของ GitHub Pages) แล้วเก็บไว้ ออฟไลน์: ใช้ที่เก็บไว้
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
