# 时刻 v0.8.7 部署受阻报告

## 结论

v0.8.7 draft edit handoff 候选已完成实现、测试、候选报告和本地浏览器验收，但本轮未部署。

原因是 GitHub HTTPS/TLS 连接再次失败，无法在部署前确认远端 main 是否仍停留在 v0.8.6。为避免本地 main 进入“已合并但未推送”的半部署状态，本轮未合并 main、未 push、未 deploy。

## 候选分支

rematch-v087-draft-edit-handoff

## 候选 HEAD

ea6dd1da52d31450d1bdef4df88b2ba401431178

## 实现 commit

52e563cb734880f6535c427bda6f2fc10e5c4f06

## 已完成能力

- 批量整理页草稿新增“修改”操作。
- 点击“修改”后移除该草稿。
- 回到首页输入框并回填原始草稿文本。
- 自动打开解析预览，继续复用 v0.8.5 的纠错/确认能力。

## 已通过测试

- Clean candidate suite：23/23 通过
- Draft edit handoff：6/6 通过
- Batch capture inbox：8/8 通过
- Time sprite：8/8 通过
- Backup hardening：11/11 通过
- ICS export：11/11 通过
- ICS deep：14/14 通过
- 本地 Headless Edge：14/14 通过

## GitHub 连接失败记录

部署前远端核验失败：

```text
git ls-remote origin refs/heads/main refs/tags/shike-web-stable-before-v087-draft-edit-handoff
fatal: unable to access 'https://github.com/lanyunayue/memorial-day-preliminary-web.git/': OpenSSL SSL_read: SSL_ERROR_SYSCALL, errno 0
```

随后 TCP 检查失败：

```text
Test-NetConnection github.com -Port 443
TcpTestSucceeded: False
```

## 本轮未执行操作

- 未创建远端备份 tag。
- 未合并到 E:\lifetime-web main。
- 未 push。
- 未部署 GitHub Pages。

## 当前线上版本

部署受阻时，上一轮线上版本仍为：

- v0.8.6
- shike-v086-v32

## 连接恢复后的部署步骤

```powershell
cd E:\lifetime-web
git ls-remote origin refs/heads/main refs/tags/shike-web-stable-before-v087-draft-edit-handoff
git tag shike-web-stable-before-v087-draft-edit-handoff 1f0a5a917860b3e399a160d15846252b22e5c1f2
git push origin shike-web-stable-before-v087-draft-edit-handoff
git merge --ff-only rematch-v087-draft-edit-handoff
node scripts/test-shike-regression-suite.js
node scripts/test-shike-draft-edit-handoff.js
node scripts/test-shike-batch-capture-inbox.js
node scripts/test-shike-time-sprite.js
node scripts/test-shike-backup-hardening.js
node scripts/test-shike-ics-export.js
node scripts/test-shike-ics-deep.js
git push origin main
```

部署后验证：

- APP_VERSION：v0.8.7
- sw.js cache：shike-v087-v33

## 建议

保留 v0.8.7 候选分支。等 GitHub 连接恢复后优先部署本候选，不要在其上继续叠加 v0.8.8。
