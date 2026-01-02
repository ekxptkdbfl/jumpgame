const CACHE_NAME = 'penguin-game-v2024-01-03'; // 날짜나 버전을 매번 바꿔주세요.

// 설치 단계: 새로운 서비스 워커가 들어오면 바로 활성화 준비
self.addEventListener('install', (event) => {
  self.skipWaiting(); // 기다리지 않고 바로 활성화
});

// 활성화 단계: 이전 버전의 캐시를 모두 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Old cache deleted:', cacheName);
            return caches.delete(cacheName); // 현재 버전이 아니면 삭제
          }
        })
      );
    })
  );
  return self.clients.claim(); // 즉시 제어권 획득
});
