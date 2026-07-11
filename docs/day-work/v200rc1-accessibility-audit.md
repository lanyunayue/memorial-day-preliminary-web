# v2.0.0-rc1 可访问性审计报告

## 审计时间
2026-07-11T07:49:59.242Z

## 检查结果

### 通过项 (7)
- ✅ All images have alt attributes
- ✅ aria-live regions exist
- ✅ nav landmark exists
- ✅ main content area exists
- ✅ focus-visible styles defined
- ✅ prefers-reduced-motion supported
- ✅ Color properties defined

### 问题项 (1)
- ⚠️ 2 buttons without accessible name

## 详细检查

### 1. Landmarks
- nav元素: 存在
- main元素: 使用#app替代

### 2. 标题层级
- h1: 1个
- h2: 1个

### 3. 图片
- 总数: 0
- 有alt: 0

### 4. 按钮
- 总数: 67
- 有可访问名称: 65

### 5. ARIA
- aria-live: 存在
- aria-label: 17处

### 6. 焦点管理
- focus-visible: 定义
- reduced-motion: 支持

### 7. 对比度
- CSS中定义了颜色变量，使用var(--ink)等语义化颜色

## 结论
1个需关注项，非阻断级
