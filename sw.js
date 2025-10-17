// Service Worker for PWA - 支持离线使用
const CACHE_NAME = 'shipping-calculator-v1.0.0';
const STATIC_CACHE_NAME = 'shipping-calculator-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'shipping-calculator-dynamic-v1.0.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 需要缓存的动态资源
const DYNAMIC_ASSETS = [
  // 可以添加API端点等动态资源
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // 缓存动态资源
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching dynamic assets');
        return cache.addAll(DYNAMIC_ASSETS);
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      // 立即激活新的Service Worker
      return self.skipWaiting();
    })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 立即控制所有客户端
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker: Activation complete');
    })
  );
});

// 拦截请求 - 实现离线优先策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 只处理GET请求
  if (request.method !== 'GET') {
    return;
  }

  // 跳过chrome-extension等非HTTP请求
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    handleRequest(request)
  );
});

// 处理请求的核心逻辑
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // 策略1: 静态资源 - 缓存优先
    if (isStaticAsset(url)) {
      return await cacheFirst(request, STATIC_CACHE_NAME);
    }
    
    // 策略2: 动态资源 - 网络优先
    if (isDynamicAsset(url)) {
      return await networkFirst(request, DYNAMIC_CACHE_NAME);
    }
    
    // 策略3: 其他请求 - 网络优先
    return await networkFirst(request, DYNAMIC_CACHE_NAME);
    
  } catch (error) {
    console.error('Service Worker: Request failed:', error);
    
    // 如果所有策略都失败，返回离线页面
    if (request.destination === 'document') {
      return await caches.match('/index.html');
    }
    
    // 对于其他资源，返回错误响应
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// 缓存优先策略
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('Service Worker: Serving from cache:', request.url);
    return cachedResponse;
  }
  
  // 如果缓存中没有，尝试网络请求
  try {
    const networkResponse = await fetch(request);
    
    // 缓存成功的响应
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Network request failed:', error);
    throw error;
  }
}

// 网络优先策略
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    // 先尝试网络请求
    const networkResponse = await fetch(request);
    
    // 缓存成功的响应
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache:', request.url);
    
    // 网络失败，尝试从缓存获取
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// 判断是否为静态资源
function isStaticAsset(url) {
  const staticPatterns = [
    /\.(html|css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/,
    /manifest\.json$/,
    /^\/$/
  ];
  
  return staticPatterns.some(pattern => pattern.test(url.pathname));
}

// 判断是否为动态资源
function isDynamicAsset(url) {
  const dynamicPatterns = [
    /\/api\//,
    /\.json$/,
    /data/
  ];
  
  return dynamicPatterns.some(pattern => pattern.test(url.pathname));
}

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 执行后台同步
async function doBackgroundSync() {
  try {
    console.log('Service Worker: Performing background sync');
    
    // 这里可以添加后台同步逻辑
    // 比如同步用户数据、更新缓存等
    
    // 更新应用数据
    await updateAppData();
    
    console.log('Service Worker: Background sync completed');
  } catch (error) {
    console.error('Service Worker: Background sync failed:', error);
  }
}

// 更新应用数据
async function updateAppData() {
  try {
    // 这里可以添加数据更新逻辑
    // 比如从服务器获取最新的价格数据
    
    console.log('Service Worker: Updating app data');
    
    // 示例：更新价格数据
    // const response = await fetch('/api/shipping-data');
    // if (response.ok) {
    //   const data = await response.json();
    //   // 更新缓存中的数据
    // }
    
  } catch (error) {
    console.error('Service Worker: Failed to update app data:', error);
  }
}

// 推送通知
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : '运费计算器有新更新！',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: '打开应用',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('运费计算器', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 消息处理
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// 错误处理
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error occurred:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled promise rejection:', event.reason);
});

console.log('Service Worker: Script loaded');