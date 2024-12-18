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

// 模式控制：1 = 顺序循环，2 = 不重复随机图片
const MODE = 2;

// 记录最近显示的5张图片的索引
const recentIndices = [];
const UNIQUE_COUNT = 5; // 保持不重复的图片数量

// 模式1的当前索引
let currentIndex = 0;

// 获取下一个顺序索引（模式1）
function getNextSequentialIndex() {
  const index = currentIndex;
  currentIndex = (currentIndex + 1) % IMAGES.length;
  return index;
}

// 获取一个不在最近显示列表中的随机索引（模式2）
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
      // 根据模式选择图片索引
      const index = MODE === 1 ? getNextSequentialIndex() : getUniqueRandomIndex();
      const imageUrl = IMAGES[index];

      // 获取图片内容
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      // 设置正确的Content-Type
      let contentType = response.headers.get('Content-Type');
      if (imageUrl.endsWith('.jpg') || imageUrl.endsWith('jpeg')) {
        contentType = 'image/jpeg';
      } else if (imageUrl.endsWith('.png')) {
        contentType = 'image/png';
      } else if (imageUrl.endsWith('jpg')) {
        contentType = 'image/jpeg';
      }

      // 返回图片，并设置缓存控制
      return new Response(response.body, {
        headers: {
          ...headers,
          'Content-Type': contentType || 'image/jpeg',
          'Cache-Control': 'no-cache, no-store, must-revalidate', // 禁用缓存以确保每次请求都是新的
          'Content-Disposition': 'inline',
        },
      });
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