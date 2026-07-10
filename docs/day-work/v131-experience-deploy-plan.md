# v1.3.1 体验稳定性修复 - 部署计划

## 部署前检查
- [x] 工作目录: E:\\lifetime-web-v131-experience-stabilization
- [x] 分支: hotfix-v131-experience-stabilization
- [x] 基线 commit: 63c81e5 (origin/main)
- [x] 产品 commit: 69f1bee
- [x] 快进后继验证: 69f1bee 是 63c81e5 的直接子 commit
- [x] 回滚 tag: shike-web-stable-before-v131-experience-stabilization → 63c81e5
- [x] APP_VERSION: v1.3.1
- [x] CACHE_NAME: shike-v131-v50
- [x] Parser hash 未改变
- [x] 专项测试通过
- [x] 核心回归测试通过

## 部署步骤
1. git fetch origin
2. 确认 origin/main = 63c81e5
3. 确认 hotfix commit 可快进到 origin/main
4. 推送回滚 tag: git push origin shike-web-stable-before-v131-experience-stabilization
5. 快进推送: git push origin hotfix-v131-experience-stabilization:main
6. 禁止 force push
7. 验证远端 main 为新 commit
8. 等待 GitHub Pages 构建（1-3 分钟）
9. 线上验证

## 线上验证项
- 访问 https://lanyunayue.github.io/memorial-day-preliminary-web/
- 硬刷新（Ctrl+Shift+R）绕过旧缓存
- 验证 APP_VERSION = v1.3.1
- 验证 CACHE_NAME = shike-v131-v50
- 验证首页无顶部空白
- 验证"帮我登记"类输入正确识别
- 验证旧数据正常加载

## 回滚方法
如出现严重问题，执行:
1. git push origin -f shike-web-stable-before-v131-experience-stabilization:main
2. 或在 GitHub 手动 revert 到 63c81e5
3. 用户端通过硬刷新获取旧版本（SW 缓存会自动失效当 cache name 变化）
