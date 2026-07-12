# DEPENDENCY MAP

## Alpha2 Dependencies

- GitHub origin 可访问，用于刷新 main。
- Node.js runtime，用于现有脚本。
- Microsoft Edge 或 Playwright Chromium，用于真实浏览器证据。
- CDP endpoint，用于 runtime browser 测试。
- 本地静态服务器，用于页面访问。

## Product Dependencies

- `index.html` 负责主页面结构。
- `src/legacy-app.js` 仍是主业务承载。
- `src/storage/*` 负责 legacy/local-first/IndexedDB。
- `src/parser/parser-adapter.js` 和 `src/assistant/sprite-create-intent.js` 负责输入理解。
- `sw.js` 负责 PWA 缓存和 network-first。

## External Dependencies

当前 Active Release 不依赖真实云服务、账号系统、支付系统或 Push 后台。
