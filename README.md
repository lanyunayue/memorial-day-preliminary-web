# 时刻 Shike

时刻是一个本地优先的个人负荷与恢复助手。它记录任务、承诺、等待与生活事件，也帮助用户在负荷过高时做出明确、可撤回、不会偷换语义的降载选择。

当前 Web 候选版本：`v2.2.0-alpha4`

## 产品结构

主导航固定为：

1. 今天
2. 全部
3. 时刻精灵
4. 回顾
5. 我的

日历、导入、隐私、权限与数据安全保留为次级工作流。首页和时刻精灵均可一步进入“一键降载”。

## 核心能力

- 中文自然语言记录、批量拆分与逐条确认
- 提醒、纪念、习惯和备忘等既有记录类型
- 承诺、等待他人、长期目标和时间关系
- 本地每日简报、下一步行动与每周回顾
- 六种明确的 DeLoad 动作：取消、延期、降低标准、重新协商、今晚只留一项、保存并结束今天
- IndexedDB 主存储、兼容缓存、损坏隔离和恢复
- Shike Portable Export v1 导入导出、校验、预览、冲突处理与事务回滚
- 多标签协调、离线 Service Worker 与 PWA 安装清单
- 本地权限、隐私、备份、回收站和快照工具

## DeLoad 语义

DeLoad 不会把延期当成完成，不会把删除当成取消，不会把“今晚不做”当成取消，也不会把“结束今天”当成批量完成。每次动作均需用户确认；业务记录、Portable 侧记录和审计日志在同一笔 IndexedDB 事务中提交。

## 数据与隐私

- 业务数据默认保存在浏览器本地。
- 用户原始私人文本不会写入 DeLoad 操作侧记录。
- 产品验证模式需要明确同意，且不接入远程分析。
- 浏览器通知只在页面可运行且浏览器允许时工作；不承诺浏览器关闭后的后台提醒。
- Portable Export 的唯一语义来源位于平台控制仓库的 `contracts/data/portable-export-v1.schema.json`。

## 本地验证

```powershell
npm run lint
npm run format:check
npm run test:unit
npm run test:legacy
npm run test:e2e:ci
```

`test:e2e:ci` 会启动本机 Edge/Chromium，执行运行时、Chronos、Portable Export、DeLoad、产品验收、多标签和离线浏览器测试。普通 `test:all` 在没有浏览器连接时可能跳过 E2E，因此正式发布门禁必须单独执行 `test:e2e:ci`。

## 在线状态

- 官方网站：[时刻官方网站](https://shike-official.humble-anole-7628.chatgpt.site/)
- Web 正式入口候选：[GitHub Pages](https://lanyunayue.github.io/memorial-day-preliminary-web/)
- Android：内部测试，当前只有 Debug APK，不作为正式下载
- HarmonyOS：内部测试，当前 HAP 未正式签名，不作为正式下载

Web 在线入口只有在候选分支通过完整发布门禁并完成线上版本核验后，才视为当前发布版本。发布状态与产物信息以平台控制仓库的 `releases/release-manifest.json` 为准。

## 工程边界

- `E:\lifetime-web-v240a2-stabilization`：当前 Web 稳定化候选
- `E:\chronos-platform-control`：产品、数据、发布与审计契约
- `E:\lifetime-v240a2-cross-platform-parity`：Android 候选
- `E:\lifetime-v240a2-harmony-parity`：HarmonyOS 安全副本
- `E:\lifetime`：受保护原目录，本轮不得修改

内部工程代号为 PROJECT CHRONOS；对外产品名称始终为“时刻 / Shike”。
