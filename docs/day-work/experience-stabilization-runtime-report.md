# 时刻 v1.4.1 运行态验收报告

## 环境

- Microsoft Edge headless + CDP
- 本地地址：`http://127.0.0.1:8091/`
- 候选：v1.4.1 / `shike-v141-v53`
- 产品提交：`889a10faa12c19813bef841ca0d10a91f67aad31`

## 九视口结果

360x640、375x667、390x844、414x896、768x1024、1024x768、1366x768、1440x900、1920x1080 均满足：

- `scrollY=0`
- `documentElement.scrollTop=0`
- `visualViewport.offsetTop=0`
- 首页容器顶部留白 16px
- 首个有效内容 top 42px
- 主输入框 top 170.97px
- 横向溢出 0px
- `history.scrollRestoration='manual'`
- opening 已脱离显示
- IndexedDB ready

修复前 v1.3.0 在 375x667 的首个有效内容 top 为 126.33px、输入框 top 为 255.30px，并且输入框被自动聚焦；在 414x896 时分别达到 238.52px 和 367.48px。当前值固定为 42px 和 170.97px。

## 场景

- 旧滚动状态刷新：回到 0。
- 全部页滚动后切回首页：回到 0。
- 更新说明关闭：弹层不占布局，滚动回到 0。
- 开场关闭：display 为 none，滚动回到 0。
- PWA app 模式 375x667：`standalone=true`，顶部留白 16px，无横向溢出。
- 深浅主题和多语言静态回归通过；产品结构未增加新的主题依赖。

## 精灵与数据

作业登记、买牛奶取消、修改不写入、明日 15:00、月重复、模拟持久化失败均通过。确认后的记录同时出现在 IndexedDB、今日概览、全部页搜索和日历 dot。

## 截图与原始结果

- 修复前：`E:\lifetime-web-audit-artifacts\v130-before\`
- 修复后：`E:\lifetime-web-audit-artifacts\v141-local\`
- PWA：`E:\lifetime-web-audit-artifacts\v141-pwa\`
- 原始 JSON：各目录下 `experience-runtime-result.json`

未发现应用级 JavaScript 异常。字体或网络资源错误未被当作产品断言；本地页面核心资源均由本地服务器提供。

