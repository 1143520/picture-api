// 配置你的图片 URL 列表
const IMAGES = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg',
  // 添加更多图片 URL
];

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
      // 随机选择一个图片 URL
      const randomIndex = Math.floor(Math.random() * IMAGES.length);
      const imageUrl = IMAGES[randomIndex];

      // 获取图片内容
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }

      // 获取原始图片的 Content-Type
      const contentType = response.headers.get('Content-Type');
      
      // 创建新的响应，包含图片内容和适当的头部
      return new Response(response.body, {
        headers: {
          ...headers,
          'Content-Type': contentType || 'image/jpeg',
          'Cache-Control': 'no-cache',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch image' }), {
        status: 500,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      });
    }
  },
}; 