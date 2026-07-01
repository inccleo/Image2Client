# Image2Client

> A professional client for OpenAI Image API — like Postman meets an image workbench.

专为 GPT Image / OpenAI Image API 打造的专业客户端。支持任何兼容 OpenAI Image API 的中转站，所有数据保存在浏览器本地。

## Features

- **Text to Image** — 通过 Prompt 生成图片，支持多种尺寸、质量和格式
- **Image Edit** — 上传原图 + Mask + 参考图进行局部编辑
- **Prompt Templates** — 收藏常用 Prompt，分类管理，一键应用
- **History** — 所有生成记录保存在本地 IndexedDB，支持搜索和重新生成
- **Privacy First** — 纯前端 SPA，API Key 和图片数据仅存浏览器本地，不上传任何第三方服务器
- **Compatible** — 支持任何兼容 OpenAI Image API 的 Base URL（中转站）

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- LocalStorage (config) + IndexedDB (data)
- Zero backend required

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Deploy

纯静态文件，可部署至：

- Vercel
- Netlify
- GitHub Pages
- Any static hosting

## License

MIT
