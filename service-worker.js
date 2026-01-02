const CACHE_NAME = 'city-penguin-v2';
const ASSETS = [
  'index.html',
  'style.css',
  'script.js',
  'manifest.json'
];

// 설치 단계에서 파일 캐싱
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 네트워크 요청을 캐시에서 먼저 찾음 (오프라인 실행 가능)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});