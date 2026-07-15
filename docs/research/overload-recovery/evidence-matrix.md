# 证据矩阵

> 本文档定义 overload-recovery 项目的四层证据体系，用于区分不同来源、不同可信度的证据，并为产品决策提供依据。

---

## 概述

所有产品决策必须基于证据。证据按来源和可信度分为四层：

| 层级 | 名称 | 来源 | 可信度 | 当前状态 |
|------|------|------|--------|----------|
| A | 外部研究 | 同行评审论文、学术机构报告 | 高（需验证） | 待收集 |
| B | 用户声音 | 真实用户原始表达 | 中高（需去重与交叉验证） | 待收集 |
| C | 产品假设 | 团队内部推断 | 低（未经验证） | 已记录 |
| D | 设计原则 | 基于 A/B/C 提炼的共识 | 中（锁定中） | 已锁定 |

---

## 层级说明

### A 层 — 外部研究

- **定义**：来自同行评审期刊、学术机构、权威组织的研究成果
- **要求**：必须标注来源、机构、时间、样本量、方法
- **局限**：研究人群可能与目标用户不重合；因果性需独立判断
- **状态**：PUBLIC RESEARCH COLLECTION REQUIRED — 需要联网收集真实研究
- **登记文件**：[public-research-register.md](./public-research-register.md)

### B 层 — 用户声音

- **定义**：来自真实用户的原始表达，未经加工或过度解读
- **要求**：保留原始措辞，标注来源页面与日期
- **局限**：个别用户声音不代表普遍需求；需交叉验证
- **状态**：HUMAN OVERLOAD PILOT REQUIRED — 需要真人参与收集
- **登记文件**：[voice-of-customer-register.md](./voice-of-customer-register.md)

### C 层 — 产品假设

- **定义**：团队基于经验和直觉提出的产品假设
- **要求**：每条假设必须有明确的验证方法和推翻标准
- **局限**：未经任何外部验证，不可作为决策的唯一依据
- **状态**：已记录在 hypothesis-register.md，全部标记 PRODUCT HYPOTHESIS — NOT YET VALIDATED
- **登记文件**：[hypothesis-register.md](./hypothesis-register.md)

### D 层 — 设计原则

- **定义**：基于 A/B/C 层证据（以及当前最佳判断）提炼的设计共识
- **要求**：原则一旦锁定，变更需记录原因
- **状态**：已锁定在 product-principles.md
- **登记文件**：[product-principles.md](./product-principles.md)

---

## 证据使用规则

1. **决策优先级**：A > B > D > C（假设仅作为探索方向，不作为决策依据）
2. **假设不可单独支撑决策**：任何基于 C 层假设的决策必须标注风险
3. **原则可被推翻**：当 A/B 层新证据与 D 层原则冲突时，原则需重新评估
4. **缺口必须显性**：所有证据缺口记录在 evidence-gaps.md
5. **已推翻假设需归档**：假设被推翻后移至 invalidated-assumptions.md，并评估对设计原则的影响

---

## 当前证据状态汇总

| 证据类型 | 登记文件 | 条目数 | 状态 |
|----------|----------|--------|------|
| A 外部研究 | public-research-register.md | 0 | PUBLIC RESEARCH COLLECTION REQUIRED |
| B 用户声音 | voice-of-customer-register.md | 0 | HUMAN OVERLOAD PILOT REQUIRED |
| 竞品审查 | competitor-review-register.md | 4 类别 | 框架已建立，待系统收集 |
| C 产品假设 | hypothesis-register.md | 10 | PRODUCT HYPOTHESIS — NOT YET VALIDATED |
| 已推翻假设 | invalidated-assumptions.md | 0 | 无 |
| D 设计原则 | product-principles.md | 6 | 已锁定 |
| 证据缺口 | evidence-gaps.md | 10 | 已识别，待填补 |
| 研究伦理 | research-ethics.md | — | 已建立伦理框架 |
| 验证要求 | ../resources/safety/verification-required.md | — | 全部 NOT VERIFIED |
| 临床审核 | ../resources/safety/clinical-review-required.md | — | 未执行 |

---

## 证据流转图

```
  [A 外部研究] ──验证──> [已验证事实]
       |                      |
       |                 [影响原则]
       |                      |
       v                      v
  [B 用户声音] ──交叉验证──> [D 设计原则]
       |                      |
       |                 [指导假设验证]
       v                      v
  [C 产品假设] ──验证──> [已验证] / [已推翻]
                             |
                        [移至 invalidated-assumptions.md]
```

---

## 变更日志

| 日期 | 变更内容 |
|------|----------|
| 2026-07-15 | 初始创建，建立四层证据体系框架 |

> 最后更新：2026-07-15
> 项目版本：v240a1
