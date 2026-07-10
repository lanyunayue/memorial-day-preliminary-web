# 时刻 v1.4.1 体验稳定性部署报告

## 部署信息

- 部署时间：2026-07-11 01:24（Asia/Shanghai）
- 正式地址：https://lanyunayue.github.io/memorial-day-preliminary-web/
- 版本：v1.4.1
- 缓存：`shike-v141-v53`
- 基线：v1.4.0 `7fc40e6396c8a2a72ff78ecc22be00a16da0e6cb`
- 产品提交：`889a10faa12c19813bef841ca0d10a91f67aad31`
- 候选报告提交：`8e9fae0769d472a0e0627800f616fe642ff3da86`
- 回滚标签：`shike-web-stable-before-v141-experience-completion` -> `7fc40e6`
- 推送：普通 fast-forward，无 force push

## 线上身份与资源

- 根页面 HTTP 200
- `src/config/version.js`：v1.4.1，HTTP 200
- `sw.js`：`shike-v141-v53`，HTTP 200，不含非法字面量 `\n`
- manifest、CSS、三个数据模块、精灵适配层、Agent UI/工具、关注中心两个模块均 HTTP 200

## 线上 Edge CDP

| 闸门 | 结果 |
| --- | --- |
| 九视口首页 + 精灵 + 关注页 + 失败回滚 | 33/33 通过 |
| 标准产品运行态 | 11/11 通过 |
| 离线重启 | 3/3 通过 |
| JSON 备份 / ICS / 批量整理 / 天气函数 | 10/10 通过 |

线上 360、375、390、414、768、1024、1366、1440、1920 视口均为 `scrollY=0`、顶部留白 16px、首个有效内容 top 42px、横向溢出 0。正式线上截图位于 `E:\lifetime-web-audit-artifacts\v141-online\`。

## 核心验收

- “今天还有作业要做，帮我登记”展示事项、今天、全天、提醒；确认前 0 条，双击确认后仅 1 条。
- 确认后 IndexedDB、今日概览、全部页搜索和日历 dot 同步。
- “帮我记一下买牛奶”显示无日期备忘，取消不写入。
- “明天下午三点交报告”显示明天 15:00。
- 月重复保持 `monthly`。
- 修改不写入并把焦点交回输入框。
- 模拟持久化失败不留下记录，不显示成功。
- 关注中心是 `#app` 的主页面并可见。
- JSON backup schema 2、checksum、ICS event、批量两条草稿和天气函数均在线构造成功。

## 不变量与真实性

- parser 函数与 adapter hash 前后一致。
- IndexedDB schema 未修改。
- 仓库没有独立 `test-shike-nlp-parser.js`，未声称 102/102。
- `E:\lifetime` 未修改。
- 本地脏 `E:\lifetime-web\main` 未清理、未覆盖。
- `gh-pages` 未手动修改。

## 结果

未回滚。v1.4.1 发布成功，两个最高优先级体验问题和 v1.4.0 发布完整性问题均已通过线上验收。后续 Omega 阶段不得复用当前脏 main 工作区，应从最新 `origin/main` 创建新的独立 worktree。

