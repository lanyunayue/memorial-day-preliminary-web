# 时刻 v0.8.4 部署受阻报告

## 结论

v0.8.4 smart capture 候选已完成本地实现、测试和浏览器验收，但本轮未能上线。

原因是当前环境无法稳定连接 GitHub HTTPS，部署所需的 `git ls-remote` / `git push` 通道不可用。为避免本地 main 进入“已合并但未推送”的半部署状态，本轮没有合并 main、没有 push、没有部署。

## 当前候选状态

- 候选工作区：D:\lifetime-v084-smart-capture
- 候选分支：rematch-v084-smart-capture
- 候选实现 commit：3adfc73ebd694e01faf3b81a3e42cc17622e3634
- 候选报告 commit：042c11c3fecdf4fca94144cfda734717dc4f90b1
- 线上版本仍为：v0.8.3
- 线上 sw.js 仍为：shike-v083-v29

## 已通过检查

- clean candidate suite：20/20 通过
- parse preview：10/10 通过
- correction chips：10/10 通过
- later inbox：10/10 通过
- example chips：7/7 通过
- time sprite：8/8 通过
- backup hardening：11/11 通过
- ICS export：11/11 通过
- ICS deep：14/14 通过
- 本地 Headless Edge 验收：18/18 通过

## GitHub 连接失败记录

线上检查成功：

- root：v0.8.3
- sw.js：shike-v083-v29

GitHub 部署通道失败：

```text
git ls-remote origin refs/heads/main
fatal: unable to access 'https://github.com/lanyunayue/memorial-day-preliminary-web.git/': OpenSSL SSL_connect: SSL_ERROR_SYSCALL in connection to github.com:443
```

随后 `Test-NetConnection github.com -Port 443` 连续 3 次失败：

```text
Try  Tcp    Remote
1    False  20.205.243.166
2    False  20.205.243.166
3    False  20.205.243.166
```

## 本轮未执行的操作

- 未创建 v0.8.4 线上备份 tag
- 未合并 rematch-v084-smart-capture 到 main
- 未 push main
- 未更新 GitHub Pages
- 未修改 gh-pages

## 恢复部署时的建议步骤

GitHub 连接恢复后再执行：

```powershell
cd D:\lifetime
git switch main
git status
git ls-remote origin refs/heads/main
git tag shike-web-stable-before-v084-smart-capture 6d9a8e09ad8fea6923567e486020114ee4c8004e
git push origin shike-web-stable-before-v084-smart-capture
git merge --ff-only rematch-v084-smart-capture
node scripts/test-shike-regression-suite.js
node scripts/test-shike-time-sprite.js
node scripts/test-shike-backup-hardening.js
node scripts/test-shike-ics-export.js
node scripts/test-shike-ics-deep.js
git push origin main
```

部署后再验证正式地址：

https://lanyunayue.github.io/memorial-day-preliminary-web/

应显示：

- APP_VERSION：v0.8.4
- sw.js cache：shike-v084-v30

## 风险判断

当前最大风险不是产品代码，而是 GitHub 网络不可用导致无法上线。候选分支可以保留，等连接恢复后继续部署。
