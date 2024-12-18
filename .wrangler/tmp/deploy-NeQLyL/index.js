var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var IMAGES = [
  "01.jpg",
  "02.jpg",
  "03.jpg",
  "04.jpg",
  "05.jpg",
  "06.jpg",
  "07.jpg",
  "08.jpg",
  "09.jpg",
  "10.jpg",
  "11.jpg",
  "12.jpg",
  "13.jpg",
  "14.jpg",
  "15.jpg",
  "16.jpg",
  "17.png",
  "18.png",
  "19.png",
  "20.png",
  "21.png",
  "22.png",
  "23.png",
  "24.png",
  "25.png",
  "26.png",
  "27.png",
  "28.png",
  "29.png",
  "30.jpeg"
].map((filename) => `https://raw.githubusercontent.com/1143520/picture-api/main/public/${filename}`);
var MODE = 2;
var recentIndices = [];
var UNIQUE_COUNT = 8;
var currentIndex = 0;
function getNextSequentialIndex() {
  const index = currentIndex;
  currentIndex = (currentIndex + 1) % IMAGES.length;
  return index;
}
__name(getNextSequentialIndex, "getNextSequentialIndex");
function getUniqueRandomIndex() {
  let availableIndices = Array.from({ length: IMAGES.length }, (_, i) => i).filter((i) => !recentIndices.includes(i));
  if (availableIndices.length === 0) {
    recentIndices.length = 0;
    availableIndices = Array.from({ length: IMAGES.length }, (_, i) => i);
  }
  const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  recentIndices.push(randomIndex);
  if (recentIndices.length > UNIQUE_COUNT) {
    recentIndices.shift();
  }
  return randomIndex;
}
__name(getUniqueRandomIndex, "getUniqueRandomIndex");
var src_default = {
  async fetch(request, env, ctx) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Accept, Accept-Encoding"
      // 添加 Vary 头，告诉浏览器这是动态内容
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }
    try {
      const index = MODE === 1 ? getNextSequentialIndex() : getUniqueRandomIndex();
      const imageUrl = IMAGES[index];
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      let contentType = response.headers.get("Content-Type");
      if (imageUrl.endsWith(".jpg") || imageUrl.endsWith("jpeg")) {
        contentType = "image/jpeg";
      } else if (imageUrl.endsWith(".png")) {
        contentType = "image/png";
      } else if (imageUrl.endsWith("jpg")) {
        contentType = "image/jpeg";
      }
      const randomId = Math.random().toString(36).substring(7);
      return new Response(response.body, {
        headers: {
          ...headers,
          "Content-Type": contentType || "image/jpeg",
          "Cache-Control": "no-store, must-revalidate",
          // 禁用缓存
          "Pragma": "no-cache",
          "Expires": "0",
          "Content-Disposition": "inline",
          "Last-Modified": (/* @__PURE__ */ new Date()).toUTCString(),
          // 添加动态时间戳
          "ETag": `"${randomId}"`
          // 使用随机标识符
        }
      });
    } catch (error) {
      console.error("Error details:", error);
      return new Response(JSON.stringify({
        error: error.message,
        url: error.url,
        stack: error.stack
      }, null, 2), {
        status: 500,
        headers: {
          ...headers,
          "Content-Type": "application/json"
        }
      });
    }
  }
};
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
