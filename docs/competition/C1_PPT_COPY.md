# C1 PPT Copy - 时刻 x 归时谷

## 比赛演示文案

---

### Slide 1 - 封面
**时刻 x 归时谷**
把现实里的事，带进一个会回应你的世界。

---

### Slide 2 - 用户问题（配图 01_product_problem.png）
**现实里的事太多，传统工具只负责记录。**

待办清单越列越长，承诺压在心上，等待的结果悬而未决。
我们记下了所有事，却依然感到焦虑和无力。

问题不是事情太多，而是我们缺少一个空间，去看见它们、感受它们，然后做出选择。

---

### Slide 3 - 产品定位（配图 02_web_recording.png）
**时刻是一个记录工具，归时谷是一个会回应你的3D空间。**

- 在「时刻」写下现实里的事项
- 进入「归时谷」，事项化作具象的物体出现在山谷中
- 通过延期、拆分、放下、完成等动作，让世界产生变化
- 带着世界的反馈回到现实工具

---

### Slide 4 - 双端产品结构（配图 03_dual_endpoint_architecture.png）
**Web 记录 + 3D 体验，纯前端实现，零后端依赖。**

- 时刻（Web）：competition.html，负责记录事项
- 交接协议：基于 localStorage 的 JSON 协议，version 1
- 归时谷（3D）：valley/，Babylon.js 渲染的山谷世界
- 双向数据流：Web -> handoff -> Game -> return payload -> Web

用户数据全程留在本地浏览器，无需账号，无需服务器。

---

### Slide 5 - 现实事项如何进入游戏（配图 04_handoff_protocol.png）
**结构化的交接协议，安全可逆。**

进入归时谷时，系统读取 localStorage 中的 handoff JSON：
- transferId：唯一交接编号
- records：包含 sourceRecordId、title、gameType（TASK/COMMITMENT/WAITING_FOR）
- returnUrl：返回地址

返回时，Game 写入 return payload：
- actions：每项事项对应的减负动作和结果
- 子步骤（拆分）、安放状态（已见到/已安放）

---

### Slide 6 - 三类事项如何具象化（配图 05/06/07）

**TASK -> 木牌**（配图 05_task_sign.png）
要做的事化作工坊前的木牌，立在那里等待被看见和处理。

**COMMITMENT -> 誓约灯**（配图 06_commitment_lamp.png）
答应别人的话化作桥上的灯盏，发出温暖但有重量的光。

**WAITING_FOR -> 纸舟**（配图 07_waiting_boat.png）
等待结果的事化作候信亭边的纸舟，顺水而漂，顺其自然。

---

### Slide 7 - DeLoad 如何产生真实动作（配图 08_deload_split.png）
**四种减负方式，对应不同的心理需求。**

- 延期：不是今天必须做的，改天再说
- 拆分：太大了？拆成更小的几步
- 今天不处理：今天就到这里，明天再看
- 放下：承认做不到，山谷会接住它

选择拆分后，系统会自动建议子步骤，用户可编辑后确认。

---

### Slide 8 - 世界如何响应（配图 09_world_response.png）
**你的每一个选择，山谷都会回应。**

- 拆分后：雾气变化，光照调整，木牌分裂为更小的碎片
- 放下后：物体消失或转化，世界变得更轻盈
- 延期后：物体移至远景，暂不占据注意力
- 完成后：物体化为光点消散，精灵给予反馈

时灵会说出对应的回应，例如："对，千里之行始于足下。先做最小的一步。"

---

### Slide 9 - 如何回到现实工具（配图 10_return_feedback.png）
**带着反馈回到「时刻」，继续生活。**

点击「返回时刻」按钮，系统：
1. 收集所有已执行的减负动作
2. 写入 localStorage return payload
3. 导航回 competition.html
4. Web 端读取 payload，展示反馈卡片
5. 用户点击「应用并清除」，完成闭环

反馈卡片显示："归时谷带回了一次反馈"，列出每项事项的处理结果。

---

### Slide 10 - 技术架构（配图 14_technical_architecture.png）
**纯前端技术栈，轻量但完整。**

- 3D 引擎：Babylon.js 7.0
- 构建工具：Vite（hash bundle 缓存）
- 离线支持：Service Worker（network-first for HTML）
- 状态管理：自研 Player State Machine（11个状态）
- 数据层：localStorage（handoff + return payload）
- 部署：GitHub Pages，HTTPS，全路径 200

---

### Slide 11 - 可靠性和测试（配图 11_test_result.png）
**166 个测试用例，全部通过。**

- PSM 状态机转换覆盖
- Competition Entry 模式测试
- Game Bridge 双向交接测试
- DeLoad 系统四类动作测试
- Return Payload 完整性验证
- Babylon 场景初始化测试

npm test: 166 passed, 0 failed, exit code 0
npm run build: passed

---

### Slide 12 - 实际部署（配图 12_deployment_result.png）
**已部署到公开地址，双浏览器验证通过。**

- 地址：https://lanyunayue.github.io/memorial-day-preliminary-web/
- 部署 Commit：106adf6（main）
- 浏览器：Chrome + Edge 双测通过
- 分辨率：1920x1080 和 1366x768 响应式通过
- 全路径验证：/, /competition.html, /valley/, /sw.js 全部 HTTPS 200
- 新用户全流程走通：入口->导入->FREE_PLAY->拆分->反馈->返回->清除

---

### Slide 13 - Git 版本基线（配图 13_git_commit_history.png）
**可追溯的提交历史，清晰的冻结基线。**

Game 仓库（competition/c0-web-game-pilot）：
- 88de9cb fix: repair c0 boot and competition state path
- bc7f053 fix: stabilize c0 return and loading lifecycle
- 4006ec0 test: cover c0 runtime and bridge closure

Web 仓库（main，已部署）：
- 106adf6 Merge C1: sw cache bump, valley sync, C1 evidence
- abb55dc fix: update c0 return feedback experience

---

### Slide 14 - 创新价值（配图 15_product_value.png）
**不是效率工具，而是一个与自己相处的空间。**

核心创新：
1. 具象化：抽象的心理负担变成看得见、摸得到的物体
2. 双向闭环：游戏不是逃避，而是带着反馈回到现实
3. 零门槛：无需下载，打开网页即用，数据留在本地
4. 尊重节奏：不催你完成更多，而是帮你看见、调整、继续

---

### Slide 15 - 结束页
**不是催你完成更多，**
**而是帮助你看见、调整并继续生活。**

时刻 x 归时谷
2026.07

---

## 禁用词检查（已确认不出现）
- 元宇宙 -> 使用"3D体验空间"
- 心理治疗 -> 使用"心理减负"
- 替代医生 -> 不涉及医疗声明
- 全球首创 -> 使用"创新的"
- AI大模型驱动 -> 当前未接入AI，不提及
- 无依据市场数字 -> 不使用市场数据
- 已完成全部商业化 -> 不涉及商业化声明
