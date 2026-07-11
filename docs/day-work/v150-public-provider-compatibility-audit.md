# v1.5.0 公开来源兼容性审计

审计日期：2026-07-11
项目形态：GitHub Pages 纯前端、无自建后端、无用户 API Key

## 结论

v1.5.0 只接入浏览器可直接访问的公开接口，不写入密钥，不使用 CORS 代理，不抓取搜索结果 HTML 或付费墙。所有结果显示来源链接；请求失败、配额耗尽或资料不足时，界面显示真实失败状态和网页搜索入口。

## 来源矩阵

| 来源 | 浏览器 CORS | 密钥 | 配额/约束 | 署名 | v1.5 策略 |
| --- | --- | --- | --- | --- | --- |
| Wikipedia Action API | 官方支持匿名请求 `origin=*` | 无 | 应合理调用并缓存 | 显示“中文维基百科”和原文链接 | 通用知识；7 秒超时，失败不阻断其他来源 |
| Wikidata Action API | 官方支持匿名请求 `origin=*` | 无 | 应合理调用并缓存 | 显示 Wikidata 和实体链接 | 实体/通用知识补充 |
| GitHub REST Search | 官方说明 REST API 对任意 Origin 支持 CORS | 无（仅公共数据） | 实测搜索限额头为 10；主限额官方为未认证 60/小时 | 显示 GitHub 和仓库链接 | 仅技术/开源问题；自然语言先提取核心关键词；不缓存空失败 |
| Stack Exchange API | 实测 `200` 且 `Access-Control-Allow-Origin: *` | 无 | 官方要求遵守 `backoff`，相同请求不要高于每分钟一次 | 显示 Stack Overflow 和问题链接 | 仅技术问题；缓存 15 分钟 |
| Open-Meteo | 实测 `200` 且 CORS `*` | 免费非商业端无需密钥 | 免费端仅非商业；官方限制 10,000/日、5,000/小时、600/分钟 | 来源卡明确 `Open-Meteo（CC BY 4.0）` 并链接官网 | 仅天气问题；当前无广告/订阅版本可用，商业化前必须更换授权、购买方案或替换来源 |
| 自定义 RSS/Atom | 取决于源站 | 无 | 仅直接 CORS；不绕过源站策略 | 显示订阅源名称和原文 | 校验 http/https；HTTPS 页面拒绝 HTTP 混合内容；CORS 失败明确提示 |

## 实测结果

从 `https://lanyunayue.github.io` Origin 发起请求：

- GitHub：HTTP 200，`Access-Control-Allow-Origin: *`，搜索剩余额度可读。
- Stack Exchange：HTTP 200，`Access-Control-Allow-Origin: *`。
- Open-Meteo：HTTP 200，`Access-Control-Allow-Origin: *`。
- Wikipedia/Wikidata：官方 CORS 规则确认可用；当前审计网络曾出现连接超时，因此保留独立超时和多来源降级。
- Edge CDP 真实运行：GitHub 返回 5 条，Open-Meteo 返回 1 条，关注中心返回 5 条 GitHub 真实内容。

## 浏览器内置 AI

使用当前 Prompt API 形态：`LanguageModel.availability(options)`、`LanguageModel.create(options)` 和 `session.prompt()`。默认关闭，仅在用户主动开启且语言/硬件/model 均可用时处理已检索的公开摘要；用户记录不会进入 prompt。

Chrome 官方当前列出的本地模型文本语言包含英语、日语等，但不包含中文。v1.5 按当前界面语言传入 `expectedInputs/expectedOutputs`；中文环境通常显示不可用并继续使用规则提取式总结，不承诺所有浏览器支持。

## 官方依据

- MediaWiki CORS：<https://www.mediawiki.org/wiki/Manual:CORS>
- GitHub CORS：<https://docs.github.com/en/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests>
- GitHub rate limits：<https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api>
- Stack Exchange throttles：<https://api.stackexchange.com/docs/throttle>
- Open-Meteo licence：<https://open-meteo.com/en/license>
- Open-Meteo terms：<https://open-meteo.com/en/terms>
- Chrome Prompt API：<https://developer.chrome.com/docs/ai/prompt-api>

## 商业化闸门

当前版本可作为免费、无广告、无订阅的比赛/个人产品运行。若进入商业发行、广告或订阅阶段，Open-Meteo 免费端不能直接沿用；发布负责人必须在商业上线前完成来源授权复核。其他公开 API 的配额和条款也必须在流量增长前重新评估。
