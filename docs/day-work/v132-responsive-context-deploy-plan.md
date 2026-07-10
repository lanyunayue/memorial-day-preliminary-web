# v1.3.2 部署计划

**版本**: v1.3.2
**日期**: 2026-07-10
**基线 tag**: shike-web-stable-before-v132-responsive-context-polish
**源分支**: hotfix-v132-responsive-context-polish
**目标分支**: main (origin/main)
**部署方式**: 快进式 push

## 部署前检查清单
- [x] 响应式专项测试 45/45 通过
- [x] Agent 上下文专项测试 65/65 通过
- [x] 完整回归套件 57/57 通过
- [x] parser-adapter.js hash 不变（核心解析逻辑未改）
- [x] IndexedDB schema 不变
- [x] APP_VERSION = v1.3.2
- [x] CACHE_NAME = shike-v132-v51
- [x] 桌面卡片操作不堆积
- [x] 移动端 swipe 正常
- [x] "我待会还有作业要写" 可识别
- [x] "晚上八点吧" 可修改草稿时间
- [x] 无负 margin、无横向 overflow

## 部署步骤
1. 打基线 tag: shike-web-stable-before-v132-responsive-context-polish
2. 产品提交: "fix v1.3.2 responsive actions and agent context"
3. 快进推送到 origin/main: git push origin hotfix-v132-responsive-context-polish:main
4. 等待 GitHub Pages 构建（约 1-2 分钟）
5. 部署报告提交: "report v1.3.2 responsive context deployment"
6. 线上验证：
   - https://lanyunayue.github.io/memorial-day-preliminary-web/
   - APP_VERSION === v1.3.2
   - CACHE_NAME === shike-v132-v51
   - 桌面端卡片 more menu 正常
   - 移动端 swipe 正常
   - "我待会还有作业要写" 触发预览
   - 无应用级 JS error

## 回滚策略
若线上验证失败：
1. 立即将 main 重置到基线 tag
2. force push 回滚（仅在失败时使用）
3. 记录失败原因，修复后重新部署
4. v1.4.0+ 不得跳序

## 部署后顺序
v1.3.2 验证通过后才继续：
1. v1.4.0 关注中心
2. v1.5.0 小熊助手状态机与工作台
3. v2.0.0-rc1 全站发布候选
