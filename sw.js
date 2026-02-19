// STEP Academy 2026 - Service Worker
const CACHE_NAME = 'step-academy-v1.0.0';
const RUNTIME_CACHE = 'step-runtime-v1';

// قائمة الملفات للتخزين المؤقت
const CACHE_URLS = [
  '/',
  '/index.html',
  '/captcha.html',
  '/test.html',
  '/results.html',
  '/courses.html',
  '/payment.html',
  '/dashboard.html',
  '/referral.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/test.js',
  '/js/results.js',
  '/js/courses.js',
  '/js/payment.js',
  '/js/dashboard.js',
  '/js/storage.js',
  '/js/chatbot.js',
  '/data/questions.json',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;900&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] تثبيت Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] تخزين الملفات...');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] تفعيل Service Worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] حذف Cache قديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتيجية Fetch: Cache First مع Network Fallback
self.addEventListener('fetch', (event) => {
  // تخطي الطلبات غير GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('[SW] من الـ Cache:', event.request.url);
          return cachedResponse;
        }

        return caches.open(RUNTIME_CACHE).then(cache => {
          return fetch(event.request).then(response => {
            // تخزين الاستجابة الناجحة
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        });
      })
      .catch(() => {
        // صفحة Offline بديلة
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'STEP Academy 2026';
  const options = {
    body: data.body || 'لديك إشعار جديد!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'فتح', icon: '/icons/icon-72x72.png' },
      { action: 'close', title: 'إغلاق', icon: '/icons/icon-72x72.png' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// معالجة نقر الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

// Background Sync للطلبات الفاشلة
self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync:', event.tag);
  
  if (event.tag === 'sync-test-results') {
    event.waitUntil(syncTestResults());
  }
});

async function syncTestResults() {
  // مزامنة نتائج الاختبار عند الاتصال بالإنترنت
  console.log('[SW] مزامنة نتائج الاختبار...');
  // يمكن إضافة منطق المزامنة هنا
}
