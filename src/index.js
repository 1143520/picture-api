// 从环境变量获取图片URL列表
function getImagesFromEnv(env) {
  try {
    // 将环境变量按换行符分割，并过滤掉空行
    return (env.IMAGES || '')
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
  } catch (error) {
    console.error('Failed to parse IMAGES environment variable:', error);
    return [];
  }
}

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
    // 从环境变量获取图片列表
    const IMAGES = getImagesFromEnv(env);
    
    // 如果没有配置图片，返回错误
    if (IMAGES.length === 0) {
      return new Response(JSON.stringify({
        error: 'No images configured'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

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
          'Cache-Control': 'public, max-age=864000', // 缓存24小时
          'ETag': `"${index}"`, // 添加 ETag 用于缓存验证
          'Vary': 'Origin, Accept', // 添加 Vary 头部
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