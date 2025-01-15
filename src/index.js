// 直接配置图片URL列表
const IMAGES_LIST = [
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/05562425_09875100.png',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/19005694_28971800.jpg',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/82222314_21074700.jpg',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/98637249_45775600.jpg',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/17803376_86810000.jpg',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/95731313_19188700.png',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/87100744_47665500.jpg',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/80202909_84836000.jpg',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/89899093_97901200.jpg',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/53249802_01879700.png',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/26348784_29434800.jpg',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/82768294_58041000.jpg',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/59432563_31095500.png',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/51311478_92923900.png',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/89863621_85440500.png',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/62710053_37591700.png',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/65430156_75759800.png',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/03735455_60251600.png',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/15486861_39066400.png',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/96565314_59681200.png',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/41375373_44666000.png',
  'https://cdn.h5wan.4399sj.com/public/images/report/20241221/11695433_69333900.png'
];

// 模式控制：1 = 顺序循环，2 = 不重复随机图片
const MODE = 2;

// 记录最近显示的图片的索引
const recentIndices = [];
const UNIQUE_COUNT = 8; // 调整为更合适的数量（约1/4的总图片数）

// 模式1的当前索引
let currentIndex = 0;

// 获取下一个顺序索引（模式1）
function getNextSequentialIndex() {
  const index = currentIndex;
  currentIndex = (currentIndex + 1) % IMAGES_LIST.length;
  return index;
}

// 获取一个不在最近显示列表中的随机索引（模式2）
function getUniqueRandomIndex() {
  let availableIndices = Array.from({ length: IMAGES_LIST.length }, (_, i) => i)
    .filter(i => !recentIndices.includes(i));
  
  // 如果所有图片都在最近列表中，清空列表重新开始
  if (availableIndices.length === 0) {
    recentIndices.length = 0;
    availableIndices = Array.from({ length: IMAGES_LIST.length }, (_, i) => i);
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
  async fetch(request) {
    // 允许跨域访问
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Link': '</favicon.ico>; rel="icon"; size="0"'
    };

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    try {
      // 根据模式选择图片索引
      const index = MODE === 1 ? getNextSequentialIndex() : getUniqueRandomIndex();
      const imageUrl = IMAGES_LIST[index];

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
          'Cache-Control': 'public, max-age=8640000', // 缓存24小时
          'ETag': `"${index}"`, // 添加 ETag 用于缓存验证
          'Vary': 'Origin, Accept', // 添加 Vary 头部
          'Content-Disposition': 'inline',
          'Content-Security-Policy': "img-src 'self' https: data:;",
          'X-Content-Type-Options': 'nosniff',
          'Viewport-Fit': 'cover'
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
