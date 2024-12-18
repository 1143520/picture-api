// 配置你的图片 URL 列表
const IMAGES = [
  '01.jpg',
  '02.jpg',
  '03.jpg',
  '04.jpg',
  '05.jpg',
  '06.jpg',
  '07.jpg',
  '08.jpg',
  '09.png',
  '10.png',
  '11.png',
  '12.png',
  '13.png',
  '14.png',
  '15.png',
  '16.png',
  '17.png',
  '18.png',
  '19.jpeg'
].map(filename => `https://raw.githubusercontent.com/1143520/picture-api/main/public/${filename}`);

// 模式控制：1 = 单张随机图片，2 = 自动切换模式
const MODE = 2;

// 记录最近显示的5张图片的索引
const recentIndices = [];
const UNIQUE_COUNT = 5; // 保持不重复的图片数量

// 获取一个不在最近显示列表中的随机索引
function getUniqueRandomIndex() {
  let availableIndices = Array.from({ length: IMAGES.length }, (_, i) => i)
    .filter(i => !recentIndices.includes(i));
  
  // 如果所有图片都在最近列表中，清空列表重新开始
  if (availableIndices.length === 0) {
    recentIndices.length = 0;
    availableIndices = Array.from({ length: IMAGES.length }, (_, i) => i);
  }
  
  const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  recentIndices.push(randomIndex);
  
  // 保持最近列表长度为 UNIQUE_COUNT
  if (recentIndices.length > UNIQUE_COUNT) {
    recentIndices.shift();
  }
  
  return randomIndex;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const getImage = url.searchParams.get('getImage') === 'true';
    const timestamp = url.searchParams.get('t');

    // 允许跨域访问
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    try {
      // 获取不重复的随机图片索引
      const randomIndex = getUniqueRandomIndex();
      const imageUrl = IMAGES[randomIndex];

      // 如果是获取图片的请求，直接返回图片
      if (getImage) {
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        let contentType = response.headers.get('Content-Type');
        if (imageUrl.endsWith('.jpg') || imageUrl.endsWith('jpeg')) {
          contentType = 'image/jpeg';
        } else if (imageUrl.endsWith('.png')) {
          contentType = 'image/png';
        } else if (imageUrl.endsWith('jpg')) {
          contentType = 'image/jpeg';
        }

        return new Response(response.body, {
          headers: {
            ...headers,
            'Content-Type': contentType || 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000', // 缓存一年
            'Content-Disposition': 'inline',
          },
        });
      }

      // 根据模式返回不同的响应
      if (MODE === 1) {
        // 模式1：直接返回单张随机图片
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        let contentType = response.headers.get('Content-Type');
        if (imageUrl.endsWith('.jpg') || imageUrl.endsWith('jpeg')) {
          contentType = 'image/jpeg';
        } else if (imageUrl.endsWith('.png')) {
          contentType = 'image/png';
        } else if (imageUrl.endsWith('jpg')) {
          contentType = 'image/jpeg';
        }

        return new Response(response.body, {
          headers: {
            ...headers,
            'Content-Type': contentType || 'image/jpeg',
            'Cache-Control': 'no-cache',
            'Content-Disposition': 'inline',
          },
        });
      } else {
        // 模式2：返回自动切换的HTML页面
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>Random Picture</title>
            <link rel="icon" href="data:,">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              html, body {
                width: 100%;
                height: 100%;
                background: #000;
                overflow: hidden;
                position: fixed;
              }
              body {
                display: flex;
                justify-content: center;
                align-items: center;
              }
              .image-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                background: #000;
              }
              .image {
                position: absolute;
                max-width: 100vw;
                max-height: 100vh;
                width: auto;
                height: auto;
                opacity: 0;
                transition: all 1s ease-in-out;
                object-fit: contain;
                pointer-events: none;
                transform: translateZ(0) scale(0.98);
                -webkit-transform: translateZ(0) scale(0.98);
                will-change: opacity, transform;
              }
              .image.visible {
                opacity: 1;
                transform: translateZ(0) scale(1);
                -webkit-transform: translateZ(0) scale(1);
              }
              @media (orientation: portrait) {
                .image {
                  width: 100%;
                  height: auto;
                  max-height: 100vh;
                }
              }
              @media (orientation: landscape) {
                .image {
                  width: auto;
                  height: 100%;
                  max-width: 100vw;
                }
              }
            </style>
          </head>
          <body>
            <div class="image-container">
              <img class="image visible" src="${imageUrl}" alt="Random Picture">
            </div>
            <script>
              let isLoading = false;
              let nextImage = null;
              let intervalId = null;
              let imageCache = new Map(); // 添加图片缓存
              
              // 预加载下一张图片
              async function preloadNextImage() {
                try {
                  const baseUrl = window.location.href.split('?')[0];
                  const timestamp = new Date().getTime();
                  const url = baseUrl + '?getImage=true&t=' + timestamp;
                  
                  // 检查缓存
                  if (imageCache.has(url)) {
                    return imageCache.get(url).cloneNode();
                  }
                  
                  const img = new Image();
                  const loadPromise = new Promise((resolve, reject) => {
                    img.onload = () => {
                      img.className = 'image';
                      // 缓存图片
                      imageCache.set(url, img.cloneNode());
                      resolve(img);
                    };
                    img.onerror = reject;
                  });
                  
                  img.src = url;
                  return await loadPromise;
                } catch (error) {
                  console.error('Preload failed:', error);
                  return null;
                }
              }
              
              // 限制缓存大小
              function limitCacheSize() {
                const maxSize = 19; // 最多缓存19张图片
                if (imageCache.size > maxSize) {
                  const firstKey = imageCache.keys().next().value;
                  imageCache.delete(firstKey);
                }
              }
              
              async function loadNewImage() {
                if (isLoading) return;
                isLoading = true;
                
                try {
                  const container = document.querySelector('.image-container');
                  const oldImg = container.querySelector('.image');
                  
                  let newImg = nextImage;
                  nextImage = null;
                  
                  if (!newImg) {
                    newImg = await preloadNextImage();
                    if (!newImg) {
                      isLoading = false;
                      return;
                    }
                  }
                  
                  // 确保新图片已经完全加载
                  if (!newImg.complete) {
                    await new Promise(resolve => {
                      newImg.onload = resolve;
                    });
                  }
                  
                  // 添加新图片但保持不可见
                  container.appendChild(newImg);
                  
                  // 等待一帧以确保浏览器已经处理了图片
                  await new Promise(resolve => requestAnimationFrame(resolve));
                  
                  // 开始淡入淡出动画
                  setTimeout(() => {
                    newImg.classList.add('visible');
                    oldImg.classList.remove('visible');
                    
                    // 等待动画完成后移除旧图片
                    setTimeout(() => {
                      oldImg.remove();
                      // 开始预加载下一张图片
                      preloadNextImage().then(img => {
                        nextImage = img;
                        limitCacheSize(); // 检查并限制缓存大小
                      }).catch(console.error);
                    }, 1000);
                  }, 50);
                } catch (error) {
                  console.error('Failed to load image:', error);
                } finally {
                  isLoading = false;
                }
              }

              // 开始自动切换
              function startAutoChange() {
                if (!intervalId) {
                  // 立即开始预加载下一张图片
                  preloadNextImage().then(img => {
                    nextImage = img;
                  }).catch(console.error);
                  
                  intervalId = setInterval(loadNewImage, 5000);
                }
              }

              // 停止自动切换
              function stopAutoChange() {
                if (intervalId) {
                  clearInterval(intervalId);
                  intervalId = null;
                }
              }

              // 处理页面可见性变化
              function handleVisibilityChange() {
                if (document.hidden) {
                  stopAutoChange();
                } else {
                  startAutoChange();
                }
              }

              // 监听页面可见性变化
              document.addEventListener('visibilitychange', handleVisibilityChange);

              // 监听窗口焦点变化
              window.addEventListener('blur', stopAutoChange);
              window.addEventListener('focus', startAutoChange);

              // 初始启动自动切换
              if (!document.hidden) {
                startAutoChange();
              }

              // 禁用所有触摸事件
              document.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
              document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
              document.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
            </script>
          </body>
          </html>
        `, {
          headers: {
            ...headers,
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      }
    } catch (error) {
      console.error('Error details:', error);
      return new Response(JSON.stringify({ 
        error: error.message,
        url: error.url,
        stack: error.stack
      }, null, 2), {
        status: 500,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      });
    }
  },
}; 