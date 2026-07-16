# 时刻 v1.4.1 部署计划

## 发布对象

- 分支：`hotfix-v141-experience-completion`
- 产品提交：`889a10faa12c19813bef841ca0d10a91f67aad31`
- 版本：v1.4.1
- 缓存：`shike-v141-v53`
- 稳定基线：v1.4.0 `7fc40e6`
- 回滚标签：`shike-web-stable-before-v141-experience-completion`

## 部署闸门

1. 再次 fetch，确认 `origin/main` 仍为基线或本候选祖先。
2. 确认分支干净，parser hash 和 schema 不变。
3. 推送回滚标签。
4. 通过 fast-forward 推送候选到 `origin/main`，不触碰本地脏 `main`，不 force push。
5. 等待 GitHub Pages 根地址返回 v1.4.1 与 `shike-v141-v53`。
6. 检查根页、版本、SW、精灵、Agent、存储和关注模块 HTTP 200。
7. 用全新 Edge profile 执行线上体验 CDP、标准运行态和离线重启。
8. 验证首页、作业登记、买牛奶、明日 15:00、批量整理、IndexedDB、JSON 备份、ICS、手机和桌面。

## 回滚

如果线上闸门失败，不 force push。以回滚标签作为已知稳定内容创建 revert 提交，快进推送到 main，并重新验证版本和缓存。保留失败候选与报告供复盘。

