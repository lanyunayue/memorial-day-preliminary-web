# 时刻 v0.8.5 部署受阻报告

## 结论

v0.8.5 keyboard capture 候选已完成实现、测试、报告和本地浏览器验收，但本轮暂未部署。

原因是 GitHub HTTPS 连接不稳定：`Test-NetConnection github.com -Port 443` 曾短暂恢复，但 `git ls-remote` 仍在 SSL read 阶段超时 / 断开。为避免本地 main 进入“已合并但未推送”的半部署状态，本轮没有合并 main、没有 push、没有部署。

## 候选状态

- 工作区：D:\lifetime-v085-keyboard-capture
- 分支：rematch-v085-keyboard-capture
- 实现 commit：b8e028c5b346b9cd3d3be7c53dcc3d4cd1763b35
- 候选报告 commit：f56650d325a72f0260c628d1dca09e62185a91de
- 线上仍为：v0.8.4 / shike-v084-v30

## 已完成能力

- Enter：已有预览时确认创建。
- Enter：没有预览时先打开预览。
- Ctrl+Enter / Command+Enter：直接保存。
- Esc：取消当前预览，不保存。
- “直接保存”按钮：调用直存逻辑。
- Shift+Enter：保留多行输入。

## 测试结果

- Clean candidate suite：21/21 通过
- Keyboard capture：7/7 通过
- Time sprite：8/8 通过
- Backup hardening：11/11 通过
- ICS export：11/11 通过
- ICS deep：14/14 通过
- 本地 Headless Edge：13/13 通过

## GitHub 连接问题

观察到：

```text
Test-NetConnection github.com -Port 443
Try 1: False
Try 2: True
```

但 Git 操作仍失败：

```text
git ls-remote origin refs/heads/main refs/tags/shike-web-stable-before-v085-keyboard-capture
fatal: unable to access 'https://github.com/lanyunayue/memorial-day-preliminary-web.git/': OpenSSL SSL_read: SSL_ERROR_SYSCALL, errno 0
```

## 未执行操作

- 未创建 `shike-web-stable-before-v085-keyboard-capture` 远端 tag。
- 未合并到 main。
- 未 push。
- 未部署 GitHub Pages。

## 连接恢复后的部署步骤

```powershell
cd D:\lifetime
git switch main
git status
git ls-remote origin refs/heads/main
git tag shike-web-stable-before-v085-keyboard-capture 81bf12a4da9ccc85d20f9accd037d1efe81bc82a
git push origin shike-web-stable-before-v085-keyboard-capture
git merge --ff-only rematch-v085-keyboard-capture
node scripts/test-shike-regression-suite.js
node scripts/test-shike-keyboard-capture.js
node scripts/test-shike-time-sprite.js
node scripts/test-shike-backup-hardening.js
node scripts/test-shike-ics-export.js
node scripts/test-shike-ics-deep.js
git push origin main
```

部署后验证正式地址：

https://lanyunayue.github.io/memorial-day-preliminary-web/

应显示：

- APP_VERSION：v0.8.5
- sw.js cache：shike-v085-v31

## 建议

保留 v0.8.5 候选分支。等 GitHub HTTPS 连接稳定后再部署，不建议在连接抖动时合并 main。
