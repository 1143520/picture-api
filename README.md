# Random Picture API

这是一个基于 Cloudflare Workers 的随机图片 API。每次访问时会随机返回一张配置好的图片。

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

## 使用方法

直接访问你的 Worker URL 即可获取一张随机图片。 