# v1.3.1 体验稳定性修复 - 根因分析报告

## 工作信息
- **工作目录**: E:\\lifetime-web-v131-experience-stabilization
- **分支**: hotfix-v131-experience-stabilization
- **基线 Commit**: 63c81e5 (v1.3.0 线上稳定版)
- **产品 Commit**: 69f1bee (v1.3.1 hotfix)
- **修复版本**: v1.3.1
- **SW 缓存**: shike-v131-v50

---

## P0-1：首页初始顶部空白 - 根因分析

### 现象
- 首次进入页面时顶部出现约 60px+ 无意义空白
- 主输入框位置偏下，首屏体验不佳
- 在移动端视口（375×667）问题明显

### 真实根因（多因素叠加）

| # | 根因 | 影响 |
|---|------|------|
| 1 | 未设置 history.scrollRestoration = 'manual' | 浏览器自动恢复上次滚动位置 |
| 2 | 首次 init 不经过 switchPage | switchPage 包含 scrollTo(0,0) 但首次启动不触发 |
| 3 | 初始化 600ms 后自动 quickInput.focus() | 移动端弹出键盘触发 visualViewport 变化和自动滚动 |
| 4 | safe-area padding 归属不清 | .app 与 topbar 重复/冲突补偿 |
| 5 | 空状态 justify-content: center | 内容垂直居中导致顶部留白过多 |
| 6 | 开场动画关闭后未重置滚动 | hideOpening() 无 scrollTo 调用 |
| 7 | 版本说明关闭后未恢复滚动 | closeReleaseNotes() 无滚动重置 |

### 修复措施
1. 初始化最开始设置 history.scrollRestoration = 'manual'
2. init 开始立即调用 window.scrollTo(0,0)，rAF + setTimeout 双重保险
3. 移除普通初始化自动 focus，只在用户主动点击时 focus
4. 空状态隐藏 topbar（display:none）避免重复 safe-area
5. 空状态 hero 使用 justify-content:flex-start + min-height:auto，内容从顶部开始
6. hideOpening() 动画消失后 scrollTo(0,0)
7. closeReleaseNotes() 关闭后重置滚动
8. switchPage() 切回首页时确保滚动到顶部

### 修复后量化
- scrollY 首次进入为 0
- 顶部有效留白约 16-20px（padding-top: calc(var(--safe-top) + 16px)）
- 主输入框首屏自然可见
- 无自动 focus 导致的键盘弹出

---

## P0-2：精灵待办登记失败 - 根因分析

### 现象
输入"今天还有作业要做，帮我登记"，回复"我暂时不理解这个请求。"

### 真实根因
1. intent-router 创建意图正则只识别句首的"帮我记/记一下/提醒我"三个短语，带 ^ 锚点
2. 不支持"帮我登记/添加一下/记录一下"等十余种日常说法
3. 句中/句尾的创建动词完全无法命中
4. 没有意图归一化层，路由失败直接返回 unknown 无 fallback
5. parser 核心本身没有问题（hash 保持不变）

### 修复措施
1. 新建 src/assistant/sprite-create-intent.js 独立归一化模块
2. 创建动词从 3 个扩展到 40+ 个
3. 五层意图匹配优先级：快捷指令 → 明确创建意图 → 日期事项 fallback → 无日期备忘 fallback → 失败
4. 更新 unknown 提示，提供使用示例
5. create_record 保存后调用 renderCurrent() 刷新 UI

### Parser 完整性
- parser-adapter.js SHA-256 hash 修改前后完全一致：d6298d52d56beddfc407b329569fe81f179fcf50652425ed29dda6fa6eb6be32
- IndexedDB schema / localStorage key / 迁移逻辑均未改变
- 确认前不写入，确认后只写一次，取消不写入
- sourceText 保留完整原句
