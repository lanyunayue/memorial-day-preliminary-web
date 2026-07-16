# v2.1.0-alpha2 Self-Critique and Investment Readiness Review

时间：2026-07-12

结论：CONDITIONAL PASS

本结论只适用于 `program-v210a2-investment-hardening` 作为“CI/质量门禁加固分支”的合并候选，不适用于产品发布或部署。真实浏览器 E2E 尚未完成，`fetch origin --prune` 两次失败，不能给无条件 PASS。

## 1. 当前 Git 状态

- worktree：`E:\lifetime-web-v210a2-investment-hardening`
- 分支：`program-v210a2-investment-hardening`
- HEAD：`952b87ad85eb6133ca407c371cfd1fcdf7bca3be`
- 本地缓存 origin/main：`693c63bee49f02064fabc8f75835dc9b2105d830`
- `git status --short`：干净。
- `git status --ignored --short`：无输出。
- `fetch origin --prune`：两次失败，错误为 GitHub 连接 reset。
- 是否基于最新 main：不能完全确认；只能确认基于本地缓存的 `origin/main`。
- 禁止目录触碰：未修改 `E:\lifetime-web`，未修改 `E:\lifetime-web-v210a1-core-truth`，未修改 `E:\lifetime`。

## 2. 当前 Diff

范围：`origin/main...HEAD`

- 文件：13 个。
- 统计：459 insertions，38 deletions。
- 新增：`docs/day-work/v210a2-investment-hardening-report.md`。
- 产品 HTML 改动：只给确认弹窗两个按钮补静态 `aria-label`。
- 测试/CI 改动：`test:a11y`、`test:e2e`、`format:check`、CI workflow、`test:all`。
- 格式改动：7 个 `src` 长行拆分；`release-notes.js` 对象值经脚本比对未变。
- 版本与缓存：未改 `APP_VERSION`，未改 `CACHE_NAME`。
- 混入不相关产品改动：未发现功能、布局、主题、业务逻辑新增；但 `src` 格式化触及生产 JS，虽为换行，仍要求浏览器回归。

## 3. 测试证据

- `git diff --check`：通过。
- `npm run lint`：通过。
- `npm run format:check`：通过。
- `npm run test:unit`：9 passed，0 failed。
- `npm run test:legacy`：66/66 passed。
- Parser：`test-shike-sprite-create-intent.js` 102/102 passed。
- `npm run test:a11y`：6/6 passed，静态无障碍检查。
- `npm run test:security`：通过，parser hash `d6298d52d56beddf`。
- `node scripts/test-shike-test-integrity.js`：710 passed，0 failed。
- `npm run test:e2e`：明确 SKIPPED；未执行真实浏览器。
- Playwright：未安装或未执行。
- `SHIKE_CDP_URL`：本次阶段 0 未使用。

## 4. 30 项评分

| # | 维度 | 分数 | 证据 | 缺陷 | 最高风险 | 到 90 分还缺什么 | 合并门槛 | 部署门槛 |
|---|---|---:|---|---|---|---|---|---|
| 1 | 产品价值 | 68 | 产品已覆盖记录、日历、备份、提醒、PWA 等基础场景 | 本分支未新增产品价值，只加固门禁 | 价值叙事大于真实用户证据 | 留存数据、首日转化、用户访谈 | 是 | 否 |
| 2 | 核心工作流完整性 | 70 | Legacy 与 parser 回归覆盖创建、确认、保存等路径 | 缺真实浏览器端到端操作证据 | 静态/脚本测试漏掉真实交互失败 | 7 视口浏览器流转证据 | 是 | 否 |
| 3 | 首页信息架构 | 66 | 既有回归覆盖首页初始布局 | 未做真实首次体验观察 | 用户仍可能不清楚“为什么用它” | 新用户 30 秒创建记录实测 | 是 | 否 |
| 4 | Composer 输入体验 | 72 | Parser 102/102，确认 UI 测试存在 | 无移动键盘真实验证 | 输入框被键盘遮挡或重复提交 | 移动浏览器录屏/截图证据 | 是 | 否 |
| 5 | 日历和未来七天 | 64 | 日历、ICS、today overview 有静态和单元覆盖 | 真实点击与视口验证不足 | 日期点击或 dot 更新失真 | 浏览器操作日历全流程 | 是 | 否 |
| 6 | 提醒可靠性 | 45 | reminder engine/scheduler 有脚本回归 | 无后台可靠提醒，无 Web Push | 用户误以为关闭浏览器也会提醒 | 明确权限 UX、missed reminder、push 策略 | 是 | 否 |
| 7 | 数据安全 | 66 | data integrity、quarantine、security 测试通过 | 端到端恢复演练不足 | 损坏数据恢复路径只被局部验证 | 真实浏览器 IndexedDB/backup 恢复演练 | 是 | 否 |
| 8 | 回收站和 Undo | 62 | trash、undo 有回归脚本 | 真实误删恢复未跑浏览器 | UI 存在但恢复链路失败 | 浏览器删除-恢复-撤销证据 | 是 | 否 |
| 9 | 备份与恢复 | 64 | backup hardening、encrypted backup、ICS deep 通过 | 错误密码导入真实路径未验证 | 失败导入仍污染数据 | 错误密码、损坏备份、恢复截图 | 是 | 否 |
| 10 | 权限反馈 | 58 | permission center/settings 有测试 | 通知、麦克风拒绝未跑浏览器 | 用户拒绝权限后无明确反馈 | 浏览器权限拒绝实测 | 是 | 否 |
| 11 | PWA | 67 | PWA assets、manifest、SW 静态测试通过 | 未跑安装/离线真实路径 | 缓存策略在真实浏览器中失效 | 离线启动与更新演练 | 是 | 否 |
| 12 | 离线能力 | 60 | offline assets 测试通过 | 无真实断网浏览器证据 | 离线缓存缺资源导致白屏 | CDP offline/network 测试 | 是 | 否 |
| 13 | Service Worker 更新 | 58 | SW 包含 `skipWaiting`、`clients.claim`、network-first | 修改了生产 JS 但未升级 cache，这是本分支有意不发布 | 部署后旧缓存继续服务旧资源 | 发布前版本/cache 升级与更新演练 | 是 | 否 |
| 14 | 移动端体验 | 58 | responsive CSS 静态测试通过 | 7 个视口未真实跑 | 横向溢出、键盘遮挡 | 375/390/414 实机或浏览器截图 | 是 | 否 |
| 15 | 桌面端体验 | 60 | 桌面布局已有回归 | 1024/1366/1920 未真实验证 | 工作台遮挡内容 | 真实桌面浏览器截图和交互 | 是 | 否 |
| 16 | 可访问性 | 70 | a11y 6/6；本分支补了按钮 aria-label | 仍是静态检查，无焦点顺序/键盘证据 | aria 存在但不可操作 | 键盘 tab、焦点、reduced-motion 浏览器测试 | 是 | 否 |
| 17 | 性能 | 52 | 无新增重型功能，格式改动无行为意图 | 无 Lighthouse、性能预算、长任务证据 | 复杂 legacy 与 3D 渲染拖慢首屏 | 性能预算和真实测量 | 是 | 否 |
| 18 | 代码架构 | 55 | 有模块目录和部分仓储层 | 大型 `legacy-app.js` 仍是核心风险 | 模块只是包壳，状态重复 | 清晰边界、依赖图、逐步解耦 | 是 | 否 |
| 19 | Legacy 技术债 | 42 | 仍依赖 legacy；本分支未扩大债务 | 主流程仍受 legacy 约束 | 小改触发未知回归 | alpha3 专项解耦和浏览器回归 | 是 | 否 |
| 20 | 测试真实性 | 63 | 修复了 a11y/e2e/format 伪通过问题 | 默认 e2e skip 仍让 `test:all` 退出 0 | SKIPPED 被误解为通过 | 分离 test summary，skip 不计 pass | 是 | 否 |
| 21 | 单元测试质量 | 68 | Unit 9/9，parser 102/102 | 单元数量少，覆盖深度不均 | 关键业务靠静态测试兜底 | 更多行为级单元和失败样本 | 是 | 否 |
| 22 | 集成测试质量 | 60 | Legacy suite 66/66 | 很多是源码字符串或结构检查 | 真实行为与源码检查不一致 | DOM/浏览器集成测试 | 是 | 否 |
| 23 | 浏览器测试质量 | 35 | 默认 e2e 明确 SKIPPED；历史外部 CDP 不是本阶段证据 | 本次未执行真实浏览器 | 合并后误称 E2E 通过 | Playwright 或 CDP 7 视口证据 | 否，除非只合并 CI 加固 | 否 |
| 24 | 安全测试质量 | 62 | security runner 通过，parser hash 固定 | 不等于隐私/密码学审计 | 同步/密钥能力被误认为可靠 | threat model、crypto review、runtime tests | 是 | 否 |
| 25 | CI 门禁 | 74 | 移除 `continue-on-error`，加 a11y/e2e smoke | `npm ci || echo` 仍会吞安装失败；e2e skip 退出 0 | CI 绿但浏览器未验证 | 明确 SKIPPED 报告和依赖安装纪律 | 是 | 否 |
| 26 | Git 发布纪律 | 76 | 独立 worktree，未合 main，未 deploy，未改版本/cache | fetch 失败导致 main 新鲜度不足 | 基于过期 main 合并 | 成功 fetch 并解决冲突 | 是 | 否 |
| 27 | 云能力真实性 | 20 | 当前没有新增云；同步相关仅静态/本地 | 无真实云服务、账号、Push 证据 | 把本地能力包装成云能力 | 后端、账号、真实同步、SLO | 是 | 否 |
| 28 | 隐私边界 | 56 | 本地优先和安全测试存在 | 云/AI/检索边界缺产品化说明 | 用户不知数据去向 | 数据地图、权限文案、隐私测试 | 是 | 否 |
| 29 | 商业可行性 | 38 | 有时间记录方向和差异化雏形 | 无用户、增长、付费、留存证据 | 投入巨大但商业信号弱 | 用户研究、激活/留存指标、定价实验 | 否 | 否 |
| 30 | 投资就绪程度 | 44 | 工程纪律改善，风险开始显性化 | 真实浏览器、云、商业证据不足 | 把工程声势当成投资就绪 | Active Release 闭环和真实用户数据 | 否 | 否 |

平均分：58.6/100。

## 5. 用户视角结论

评分：59/100。

1. 第一次打开大概率能理解它是记录/提醒工具，但差异化不够强。
2. 30 秒内创建第一条记录有机会成功，Parser 和确认 UI 有脚本证据，但缺真实浏览器证据。
3. 明天和未来七天有功能与测试痕迹，但缺本轮真实视口验证。
4. 数据位置不够清楚；本地优先、备份、IndexedDB 对普通用户不可见。
5. 提醒可靠性需要更诚实的产品文案；当前不能承诺关闭浏览器后提醒。
6. 误删恢复存在回收站/Undo 能力，但未完成浏览器恢复演练。
7. 换设备后没有可靠账号/同步基础，用户会丢失或只能手动备份。
8. 相比系统日历或滴答清单，差异化应落在自然语言时间捕获、长期记忆和本地数据主权；当前证据还不够。

## 6. 高级工程师视角结论

评分：64/100。

1. 真正解耦较明显的模块：parser adapter、data integrity、IndexedDB repository、ICS export、部分 agent policy/tool registry。
2. 仍可能只是 legacy 包壳的区域：页面渲染、主路由、部分 settings/data tools、部分 agent UI。
3. 只检查源码字符串的测试仍不少，如导航、HTML integrity、module boundary、部分 release/setting 回归。
4. 无真实运行证据的能力：7 视口浏览器、权限拒绝、离线启动、SW 更新、错误密码导入、键盘焦点、回收站恢复。
5. API 只有壳的风险：cloud/sync/retrieval/agent 的部分路径可能有接口但缺真实生产证明。
6. 状态管理可能重复：legacy 全局状态、ShikeLocalFirst、IndexedDB、trash/snapshot/undo、agent context。
7. 数据写入风险：IndexedDB 与 legacy fallback 并存，失败回滚和迁移一致性需要更多浏览器演练。
8. 长期维护阻碍：大型 `legacy-app.js`、大量静态测试、没有真实浏览器自动化基线。

## 7. 投资人或产品负责人视角结论

评分：52/100。

1. 值得继续投入，但只能投到“验证与可靠性”，不是扩张功能。
2. 差异化方向存在：自然语言时间捕获、本地优先、AI 时间助理。
3. 高留存路径尚未证明；需要每日/每周回顾、未完成承诺、提醒可靠性数据。
4. 无增长数据。
5. 无商业基础。
6. 无真实账号和云同步基础。
7. 最大技术风险：legacy 主体和真实浏览器证据不足。
8. 最大产品风险：用户不知道为什么不用系统日历/清单。
9. 当前阶段：MVP/Alpha 之间；不是可发布产品。
10. 下一笔资源应投向真实浏览器自动化、核心工作流可靠性、数据恢复演练和用户研究。

## 8. 已完成的真实能力

- a11y runner 不再失败后退出 0。
- format-check 不再只打印不失败。
- CI 不再允许 lint/format `continue-on-error`。
- 默认 e2e 不再把旧失败脚本包装成 browser-free 通过，而是明确 SKIPPED。
- `SHIKE_CDP_URL` 存在时 runner 可调用当前 CDP runtime 脚本。
- 确认弹窗按钮有静态可访问名称。
- 当前分支无未提交改动，无生成 profile、日志、node_modules。

## 9. 证据不足的能力

- 真实浏览器 7 视口。
- Playwright Chromium。
- 权限拒绝 UX。
- 离线启动。
- Service Worker 更新。
- 备份错误密码导入。
- 回收站恢复和快照恢复。
- 键盘焦点顺序。
- 通知可靠性。
- 云、账号、同步、Push。
- 商业留存和增长。

## 10. 伪完成风险

1. `npm run test:e2e` 默认 SKIPPED 但退出 0，容易被粗略汇总误写成 E2E 通过。
2. `test:all` 包含 e2e smoke，但默认没有浏览器；必须在报告里分开写 SKIPPED。
3. `test-shike-test-integrity.js` 自身 allowlist 使用 `assert(true, "no pattern")` 作为通过计数，形式上豁免了它自己扫描的模式。
4. 静态检查较多，不能冒充浏览器交互。
5. 本轮生产 JS 有格式换行，虽然语义意图不变，但发布前仍要升级缓存并跑浏览器回归。

## 11. P0

当前 P0：0。

说明：未发现会立即阻止“纯 CI/质量门禁分支继续评审”的问题。

## 12. P1

1. 真实浏览器 E2E 尚未完成。
2. `fetch origin --prune` 两次失败，origin/main 新鲜度未确认。
3. 默认 e2e SKIPPED 退出 0，必须从总通过率中剥离。
4. CI 里 `npm ci || echo "No dependencies to install"` 仍会吞安装失败。
5. `test-integrity` 自身用 allowlist 豁免 `assert(true)` 形式，应改成不计 pass 的扫描汇总。

## 13. P2

1. 仍有大量静态字符串测试。
2. root 下存在已跟踪 zip 文件 `memorial-day-preliminary-web.zip`，虽非本分支新增，但发布纪律上不理想。
3. `lint-check.js` 规则较弱，只能抓明显风险。
4. `sw.js` 注释仍写 v1.5.0，和当前版本叙事不一致。

## 14. 是否值得继续

值得继续，但只能以“验证、可靠性、可恢复性、浏览器自动化”为投入方向。现在不应该继续堆新功能、云同步、支付、团队协作或新动画。

## 15. 是否允许合并

条件允许：只允许作为 CI/质量门禁加固分支进入 PR 评审。合并前必须满足：

- 成功刷新 `origin/main`。
- 明确 PR 说明真实浏览器 E2E 尚未完成或补齐浏览器证据。
- 不修改版本和缓存。
- 不部署产品版本。

## 16. 是否允许部署

不允许。缺少真实浏览器 E2E、离线/SW 更新演练、权限拒绝演练，也未升级 `APP_VERSION` 和 `CACHE_NAME`。

## 17. 下一阶段推荐

启动 `SHIKE 100,000,000-HOUR REFINEMENT PROGRAM` 的 Program Office，但当前 Active Release 只推进 v2.1.0-alpha2 Investment Hardening Final：

1. 建立 program 文档和 backlog，不冒充工程完成。
2. 完成真实浏览器 CDP/Playwright 证据采集。
3. 强化 test-integrity 的 skip 分类和自我豁免问题。
4. 审计 CI install 失败吞掉问题。
5. 只修 P0/P1。

## 18. 最不应该继续投入的内容

- 新云同步。
- 支付。
- 团队协作。
- 新精灵动画。
- 新平台分支。
- 宣称生产发布或投资就绪。

## 19. 最应该立即投入的内容

- 真实浏览器自动化。
- 7 视口截图和 console/network error 证据。
- 数据恢复演练。
- Service Worker 更新演练。
- 跳过测试与通过测试的强制分离。
- 用户首次记录路径验证。

## 20. 最终判定

CONDITIONAL PASS。

理由：当前分支确实修复了若干“看似通过”的门禁问题，diff 范围整体可控，P0 为 0；但真实浏览器 E2E 未完成、远端 main 未刷新、skip 仍可能被误读，因此不能 PASS，不能部署。
