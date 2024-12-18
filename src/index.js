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

// 上一次显示的图片索引（避免重复）
let lastIndex = -1;

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
      // 避免重复的随机选择
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * IMAGES.length);
      } while (randomIndex === lastIndex);
      lastIndex = randomIndex;

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
            'Cache-Control': 'no-cache',
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
              }
              body {
                display: flex;
                justify-content: center;
                align-items: center;
              }
              .image-container {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              .image {
                position: absolute;
                max-width: 100%;
                max-height: 100%;
                width: auto;
                height: auto;
                opacity: 0;
                transition: opacity 1s ease-in-out;
                object-fit: scale-down;
                transform: translateZ(0);
                -webkit-transform: translateZ(0);
                will-change: opacity;
              }
              .visible {
                opacity: 1;
              }
              @media (orientation: portrait) {
                .image {
                  width: 100%;
                  height: auto;
                }
              }
              @media (orientation: landscape) {
                .image {
                  width: auto;
                  height: 100%;
                }
              }
            </style>
          </head>
          <body>
            <div class="image-container">
              <img class="image visible" src="${imageUrl}" alt="Random Picture" style="opacity: 1;">
            </div>
            <script>
              let nextImage = null;
              
              // 预加载下一张图片
              async function preloadNextImage() {
                const baseUrl = window.location.href.split('?')[0];
                const timestamp = new Date().getTime();
                const url = baseUrl + '?getImage=true&t=' + timestamp;
                
                const img = new Image();
                img.src = url;
                img.className = 'image';
                
                await new Promise((resolve, reject) => {
                  img.onload = resolve;
                  img.onerror = reject;
                });
                
                return img;
              }
              
              async function loadNewImage() {
                try {
                  const container = document.querySelector('.image-container');
                  const oldImg = container.querySelector('.image');
                  
                  // 如果有预加载的图片就使用它，否则等待加载新图片
                  const newImg = nextImage || await preloadNextImage();
                  nextImage = null;
                  
                  // 开始预加载下一张图片
                  preloadNextImage().then(img => {
                    nextImage = img;
                  }).catch(console.error);
                  
                  container.appendChild(newImg);
                  requestAnimationFrame(() => {
                    newImg.classList.add('visible');
                    oldImg.classList.remove('visible');
                    setTimeout(() => oldImg.remove(), 1000);
                  });
                } catch (error) {
                  console.error('Failed to load image:', error);
                }
              }

              // 预加载下一张图片
              preloadNextImage().then(img => {
                nextImage = img;
              }).catch(console.error);

              // 开始自动切换
              setInterval(loadNewImage, 5000);

              // 禁用双击缩放
              document.addEventListener('dblclick', (e) => {
                e.preventDefault();
              });
            </script>
          </body>
          </html>
        `, {
          headers: {
            ...headers,
            'Content-Type': 'text/html',
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