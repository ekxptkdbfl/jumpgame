const CACHE_NAME = 'penguin-game-v2026-01-19';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './hawk.png',
  './icon-192.png',
  './icon-512.png',
  './bgm.mp3',
  './jump.mp3',
  './hawk.mp3'
];

// 설치 단계: 정적 파일 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('캐시 생성 중...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 활성화 단계: 이전 버전의 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('오래된 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 페치 단계: 캐시 우선, 없으면 네트워크, 그래도 없으면 오프라인 페이지(선택적)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 캐시에 있으면 반환, 없으면 네트워크 요청
      return response || fetch(event.request);
    })
  );
});