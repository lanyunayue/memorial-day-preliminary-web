# 时刻 v1.4.1 体验稳定性候选报告

1. 真实稳定基线：v1.4.0，`7fc40e6`。
2. 审计时线上版本：v1.4.0 / `shike-v140-v52`。
3. worktree：`E:\lifetime-web-v141-experience-completion`。
4. 分支：`hotfix-v141-experience-completion`。
5. 基线 commit：`7fc40e6396c8a2a72ff78ecc22be00a16da0e6cb`。
6. 产品 commit：`889a10faa12c19813bef841ca0d10a91f67aad31`。
7. 首页根因：自动滚动恢复、启动自动聚焦、空状态垂直居中和弹层关闭时机叠加；现有修复经真实前后对照确认有效。
8. 修复前后：375x667 首个有效内容 126.33px -> 42px，输入框 255.30px -> 170.97px；顶部容器留白降至 16px。
9. 精灵根因：旧路由缺少自然创建表达；后续通用计划卡又未展示解析字段，无日期备忘被 parser 默认到今天。
10. 新层设计：独立归一化适配层复用 parser，Agent UI 展示事项/日期/时间/类型。
11. parser hash：函数与 adapter 前后一致。
12. schema：未修改。
13. 专项测试：首页 40/40，精灵 101/101，关注中心 39/39。
14. 总回归：57/57。
15. Edge CDP：体验 33/33、标准 11/11、存储 10/10、离线 3/3、PWA standalone 通过。
16. 风险：Agent 保存会在 localStorage 镜像后显式等待一次 IndexedDB replace，写入次数增加但使用同一幂等替换合同；已通过真实存储与失败回滚测试。
17. 回滚：使用 `shike-web-stable-before-v141-experience-completion` 作为稳定基线，采用 revert 快进提交，不 force push。
18. 建议：满足部署闸门，建议发布 v1.4.1；发布后必须重新跑线上 Edge CDP。

