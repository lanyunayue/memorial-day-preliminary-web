# v1.5.0 最终发布审计

审计日期：2026-07-11

## Git 状态

- 工作区：`E:\lifetime-web-v150-bear-workbench`
- 分支：`rematch-v150-bear-workbench`
- 产品 commit：`f91ef43a22799fdeee20fe0a6f0d52471c3e3043`
- 发布前 `origin/main`：`afa00169eefc4b8276f4d1ae1746890b164976c9`
- merge base：`afa00169eefc4b8276f4d1ae1746890b164976c9`
- 远端状态：可快进，无远端分叉。
- `E:\lifetime-web`：未用于开发或发布。
- `E:\lifetime`：未修改。

## 变更范围

- 产品界面：`index.html`、`assets/styles/app.css`。
- 版本与缓存：`src/config/version.js`、`src/config/release-notes.js`、`sw.js`。
- Agent 接入：`src/agent/agent-core.js`、`src/agent/ui.js`。
- 精灵模块：状态机、2.5D、可选 WebGL、偏好、声音。
- 检索模块：分类、provider、归一化、排序、总结、缓存、搜索降级、浏览器 AI。
- 关注中心：移除模拟源，增加真实公开来源和自定义 RSS。
- 测试：更新当前版本闸门并新增 v1.5 静态、网络、12 视口 CDP 测试。
- 文档：交接审计、provider 审计、候选报告和本报告。

## 数据与兼容性

- NLP parser：未修改；`parseReminderText` 与 parser-adapter 哈希均与 v1.4.1 基线一致。
- record schema：未修改；record normalizer 与 storage migrations 哈希一致。
- 用户记录：无迁移、无批量重写、无上传。
- 新偏好：独立 localStorage key，可删除并回到默认，不影响记录。
- Service Worker：`shike-v150-v54`，所有新运行时脚本均在 precache。
- 提醒：本地页面提醒与 `.ics` 双重方案保留，未宣称可靠后台推送。

## 测试闸门

| 闸门 | 结果 |
| --- | --- |
| 全量静态/VM 回归 | 58/58 |
| v1.5 专项 | 76/76 |
| Watch Center | 39/39 |
| Edge 体验流 | 33/33 |
| 12 指定视口 bounding-box | 12/12 |
| WebGL 非空像素 | 通过 |
| 真实联网 provider | GitHub 5、Open-Meteo 1、Watch 5 |
| 存储迁移（新 profile） | 10/10 |
| Agent runtime | 12/12 |
| 离线启动 | 3/3 |
| `git diff --check` | 产品 commit 后仅文档行尾格式已清理 |
| 敏感信息扫描 | 无密钥、token、密码、CORS 代理 |

## 已知降级

- Wikipedia/Wikidata 可能因当前网络超时；UI 显示失败并保留其他来源/网页搜索。
- GitHub 未认证搜索配额较低；缓存成功结果，不缓存空失败。
- RSS 由源站 CORS 决定，不使用代理绕过。
- 中文 Prompt API 当前通常不可用，规则总结是默认和稳定路径。
- Open-Meteo 免费端仅适合当前非商业版本，商业化前必须重新处理授权。

## 发布判断

**PASS。** 没有安全阻断、数据丢失风险、远端不可快进冲突或付费依赖阻断。允许按既有授权发布 v1.5.0。

发布步骤：

1. 在 `afa00169eefc4b8276f4d1ae1746890b164976c9` 创建 tag `shike-web-stable-before-v150-bear-workbench`。
2. 推送回滚 tag。
3. 推送候选分支用于审计。
4. 从候选 HEAD 快进更新 `origin/main`，不使用脏的本地 main。
5. 等待 GitHub Pages workflow 成功。
6. 以正式根地址验证版本、cache、桌面工作台、手机抽屉、公开检索、关注中心与离线启动。

## 回滚

若线上出现阻断问题，从干净 release worktree 创建正常的回滚提交：

```powershell
git switch -c rollback-v150 origin/main
git revert --no-commit afa00169eefc4b8276f4d1ae1746890b164976c9..HEAD
git commit -m "revert v1.5.0 bear workbench"
git push origin HEAD:main
```

该操作保留完整历史并生成可审计的快进回滚提交；执行前仍需再次核对远端 main，禁止 force push。
