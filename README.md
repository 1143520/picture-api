# Random Picture API

这是一个基于 Cloudflare Workers 的随机图片 API。每次访问时会根据设定的模式返回图片。

## 部署步骤

1. 安装 Wrangler CLI:
```bash
npm install -g wrangler
```

2. 登录到你的 Cloudflare 账户:
```bash
wrangler login
```

3. 部署 Worker:
```bash
wrangler deploy
```

## 配置图片

在 `src/index.js` 中的 `IMAGES` 数组中配置你的图片 URL 列表。确保这些图片 URL 是可以公开访问的。

## 工作模式

API 支持两种工作模式，可以在 `src/index.js` 中通过 `MODE` 变量设置：

- 模式 1 (MODE = 1): 顺序循环模式
  - 按照图片数组的顺序依次返回图片
  - 到达末尾后自动从头开始
  - 适合需要按固定顺序展示图片的场景

- 模式 2 (MODE = 2): 不重复随机模式
  - 随机返回图片，但避免短期内重复
  - 维护最近显示过的图片列表（默认记住最近8张）
  - 确保在所有图片都展示过一轮前不会重复
  - 适合需要随机但又不想频繁重复的场景

## 使用方法

### 基本访问
直接访问你的 Worker URL 即可获取一张图片：
```
https://your-worker.your-subdomain.workers.dev
```

### 作为背景图片使用（带平滑切换效果）

1. 添加 CSS 样式：
```css
.hope-ui-dark {
    position: relative;
    background-color: #000; /* 设置一个背景色，防止切换时出现空白 */
}

.hope-ui-dark::before,
.hope-ui-dark::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    background-attachment: fixed;
    background-position-x: center;
    transition: opacity 1s ease-in-out;
    z-index: -1;
}

.hope-ui-dark::before {
    background-image: var(--bg-image-1);
    opacity: var(--bg-opacity-1, 1);
}

.hope-ui-dark::after {
    background-image: var(--bg-image-2);
    opacity: var(--bg-opacity-2, 0);
}
```

2. 添加 JavaScript 代码：
```javascript
let currentBg = 1;

function updateBackgroundImage() {
    const timestamp = new Date().getTime();
    const newImageUrl = `url("https://imgapi.aliya.us.kg?t=${timestamp}")`;
    
    if (currentBg === 1) {
        // 更新第二层背景
        document.documentElement.style.setProperty('--bg-image-2', newImageUrl);
        // 淡入第二层，淡出第一层
        document.documentElement.style.setProperty('--bg-opacity-2', '1');
        document.documentElement.style.setProperty('--bg-opacity-1', '0');
        currentBg = 2;
    } else {
        // 更新第一层背景
        document.documentElement.style.setProperty('--bg-image-1', newImageUrl);
        // 淡入第一层，淡出第二层
        document.documentElement.style.setProperty('--bg-opacity-1', '1');
        document.documentElement.style.setProperty('--bg-opacity-2', '0');
        currentBg = 1;
    }
}

// 初始化背景
updateBackgroundImage();

// 每5秒切换一次背景
setInterval(updateBackgroundImage, 5000);

// 如果需要在主题切换时也更新背景
document.addEventListener('themeChange', updateBackgroundImage);
```

### 缓存说明

API 默认启用了24小时的缓存（max-age=86400），如果需要强制刷新图片，可以：
1. 在URL后添加时间戳参数（如示例代码中所示）
2. 手动使用 Ctrl+F5 强制刷新