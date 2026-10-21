<h1 align="center">
  <img src="../image/icon.png" alt="4buwan" width="64" valign="middle" /> 4buwan
</h1>

<p align="center">
  <a href="https://github.com/og-cz/4buwan"><img src="https://img.shields.io/github/stars/og-cz/4buwan?style=flat&amp;label=%E2%98%85&amp;color=08C" alt="GitHub stars" /></a>
  <a href="https://github.com/og-cz/4buwan/releases"><img src="https://img.shields.io/github/downloads/og-cz/4buwan/total?style=flat&amp;color=08C" alt="Total downloads across all releases" /></a>
  <img src="https://img.shields.io/badge/license-MIT-08C?style=flat" alt="License: MIT" />
</p>

<p align="center">
  <sub><a href="../../README.md">English</a> · 中文 · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.es.md">Español</a> · <a href="README.fr.md">Français</a> · <a href="README.pt.md">Português</a> · <a href="README.tl.md">Tagalog</a></sub>
</p>

<p align="center">
  <strong>仅凭真实样本进行签名验证。</strong><br/>
  一个让决策清晰、证据可查的鉴定工作台。
</p>

## 系统功能

<table>
<tr>
<td width="50%" valign="middle">

### 功能标题

功能简介。

</td>
<td width="50%" align="center">
  <sub><i>截图即将推出</i></sub>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 功能标题

功能简介。

</td>
<td width="50%" align="center">
  <sub><i>截图即将推出</i></sub>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 功能标题

功能简介。

</td>
<td width="50%" align="center">
  <sub><i>截图即将推出</i></sub>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 功能标题

功能简介。

</td>
<td width="50%" align="center">
  <sub><i>截图即将推出</i></sub>
</td>
</tr>
</table>

---

## 模型功能

依赖书写者的离线签名验证。每位书写者仅用 **12 个真实签名、不使用任何伪造签名** 进行注册。

### 处理流程

| 阶段 | 方法 | 说明 |
|---|---|---|
| 预处理 | 反相 → Otsu 去背景 → 裁剪 → 填充 → 缩放 | 100 × 100 像素 |
| 描述子 | HOG | 每个签名 2,916 维 |
| 表示 | 成对差异 | 每对 17 个差异度量；每位书写者 66 个真实签名对 |
| 归一化 | 按度量缩放 | 以开发集书写者的典型量级为准 |
| 度量 | 秩 1 书写者自适应协方差（J） | 沿共享白化（G）的主方向进行自适应 |
| 分类器 | 单类 SVM | 仅用真实签名对训练；所有书写者使用相同设置 |
| 评分 | SVM 输出均值 | 测试签名与全部 12 个参考签名配对 |

### 度量

共享度量 `W_G` 用跨书写者合并的书写者内协方差对 17 个度量进行白化。J 在主方向 `u₁` 上用书写者自身的离散度 `σ` 替代合并离散度；其余方向保持共享。

```math
W_J = W_G + \left(\sigma^{-1} - \lambda_1^{-1/2}\right) u_1 u_1^{\top}
```

每位书写者只有一个参数，因此 12 个参考签名足以估计。

| 代号 | 度量 | 每位书写者参数 |
|---|---|---|
| B | 全局对角 | 0 |
| G | 合并全协方差 | 0 |
| **J** | **秩 1 书写者自适应** | **1** |

### 数据集

| 数据集 | 文字 | 开发集书写者 |
|---|---|---|
| CEDAR | 拉丁文 | 25 |
| BHSig260 Bengali | 孟加拉文 | 45 |
| BHSig260 Hindi | 天城文 | 72 |

注册：真实签名 1–12。测试：真实签名 13–24 与伪造签名 1–12。另有 172 位书写者保留用于一次性最终评估。

### 结果（开发集，142 位书写者）

| 度量 | AUC | EER |
|---|---|---|
| B — 全局对角 | 0.772 | 25.8% |
| G — 合并全协方差 | 0.831 | 22.0% |
| **J — 秩 1 书写者自适应** | **0.837** | **21.3%** |

| 数据集 | J AUC | J EER |
|---|---|---|
| CEDAR | 0.839 | 21.3% |
| BHSig260 Bengali | 0.801 | 25.4% |
| BHSig260 Hindi | 0.858 | 18.8% |

按书写者配对，使用 Wilcoxon 检验、Holm 校正与 bootstrap 区间。J 相对 G：AUC +0.006（53 位书写者提升，13 位下降，76 位不变）。

> **状态：** 草稿。结果仅来自开发集书写者；保留集评估尚未进行。在孟加拉文数据上，图像统计对照与模型表现相当，因此孟加拉文结果不作为签名验证结果报告。

---

## 许可证

4buwan 是基于 [MIT 许可证](../../LICENSE) 的免费开源软件。

![4buwan footer](../image/footer.png)
