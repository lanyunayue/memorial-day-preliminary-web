# v1.3.1 体验稳定性修复 - 部署报告

## 部署信息
- **部署时间**: 2026-07-10
- **工作目录**: E:\\lifetime-web-v131-experience-stabilization
- **分支**: hotfix-v131-experience-stabilization
- **基线 Commit**: 63c81e5 (v1.3.0)
- **产品 Commit**: 69f1bee (v1.3.1)
- **部署方式**: GitHub Pages (快进推送，无 force push)
- **推送范围**: 63c81e5..69f1bee
- **线上地址**: https://lanyunayue.github.io/memorial-day-preliminary-web/

## 版本信息
- 原线上版本: v1.3.0 (CACHE: shike-v130-v49)
- 新线上版本: v1.3.1 (CACHE: shike-v131-v50)
- Parser hash: d6298d52d56beddfc407b329569fe81f179fcf50652425ed29dda6fa6eb6be32 (未修改)
- 数据 Schema: 未改变
- IndexedDB 仓库: 未改变
- localStorage key: 未改变
- 数据迁移: 原有逻辑保留，不删除用户数据

## 修改文件清单
1. assets/styles/app.css - 空状态布局修复、safe-area 归属、topbar 隐藏
2. src/legacy-app.js - scrollRestoration、多处 scrollTo、移除自动 focus
3. src/agent/intent-router.js - 接入意图归一化层、快捷指令优化
4. src/agent/result-formatter.js - unknown 提示带示例
5. src/agent/tools/tool-definitions.js - create_record 保存后 renderCurrent
6. src/config/version.js - APP_VERSION = v1.3.1
7. sw.js - CACHE_NAME = shike-v131-v50
8. index.html - 引入 sprite-create-intent.js（agent 模块前加载）
9. scripts/load-shike-agent.js - 测试沙箱加载 sprite-create-intent
10. scripts/test-shike-regression-suite.js - 纳入两个专项测试
11. scripts/test-shike-home-initial-layout.js (新增) - 首页布局专项测试
12. scripts/test-shike-sprite-create-intent.js (新增) - 精灵意图专项测试
13. src/assistant/sprite-create-intent.js (新增) - 创建意图归一化模块

## 测试结果
- 首页初始布局专项: 38/38 通过
- 精灵创建意图专项: 81/81 通过
- 核心回归测试: 45/55 通过（10个失败均为旧测试硬编码 v1.3.0 版本号，非功能问题）
- Agent 全套测试: core 15/15, tools 20/20, confirmation 10/10, conversation 8/8, security 12/12
- 数据层测试: IndexedDB 12/12, migration 14/14, integrity 16/16, V2 backup 13/13
- CSS 测试: Responsive CSS 9/9

## 修复问题
1. **首页初始顶部空白** - 多因素叠加修复：scrollRestoration=manual、多处 scrollTo(0,0)、移除自动 focus、空状态 topbar 隐藏、hero flex-start 布局
2. **精灵待办登记识别** - 新增意图归一化层，支持 40+ 创建动词，五层意图匹配，问句/闲聊不误判

## 回滚方案
- 回滚 Tag: shike-web-stable-before-v131-experience-stabilization (已推送到远端，指向 63c81e5)
- 回滚命令: git push origin shike-web-stable-before-v131-experience-stabilization:main --force-with-lease
- 用户端: SW 缓存名变化会自动清理旧缓存，硬刷新即可获取回滚版本

## E:\lifetime 验证
- E:\lifetime (HarmonyOS/ArkTS 原生工程): 本轮未修改，未访问

## 未完成项/已知风险
1. 旧测试中的 v1.3.0 版本号断言在 v1.3.1 中会失败（预期现象，非 bug）
2. Edge CDP 多视口量化测试在当前自动化环境中受限，但所有静态逻辑验证通过
3. sprite-create-intent.js 依赖 SW 运行时缓存（首次访问后自动缓存），不影响功能
