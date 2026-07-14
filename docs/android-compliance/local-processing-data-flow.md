# 本地处理数据流

```text
系统通知回调
  -> 包名白名单检查
  -> 内存物流信号检查
  -> 本地 ParcelParser
  -> EventEnvelope（不含原文）
  -> Policy Engine
  -> 待确认草稿或同一 Parcel 生命周期更新
  -> Room 本地数据库
```

取件码在写入 Room 前使用 Android Keystore 管理的 AES-GCM 密钥加密。操作日志只保存操作类型、实体 ID、状态和 checksum。应用没有远程 AI、分析 SDK、广告 SDK或网络上传路径。
