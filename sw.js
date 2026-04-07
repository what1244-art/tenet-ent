// 최소 서비스 워커 - PWA 설치 가능 + 캐시 미사용
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => self.clients.claim());
self.addEventListener("fetch", e => {});
