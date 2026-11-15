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

<p align="center">
  <img src="../image/readme-hero.png" alt="4buwan" width="960" />
</p>

## 系统功能

<table>
<tr>
<td width="50%" valign="middle">

### 只用真实签名登记

12 个真实签名建立一份档案，每个签名一到就检查质量。从不需要伪造样本。

</td>
<td width="50%">
  <img src="../image/feature-profile.png" alt="只用真实签名登记" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 按书写者自适应的核验

R1-WAW 把一把共享尺子调整到每个人自己的书写变化，再给出带不确定区间的参考结论。

</td>
<td width="50%">
  <img src="../image/feature-verify.png" alt="按书写者自适应的核验" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 可查验的证据

每个结论都展示依据：相对决策线的分数、全部 12 次比较、17 项度量和相似度矩阵。

</td>
<td width="50%">
  <img src="../image/feature-evidence.png" alt="可查验的证据" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 人工决定复核

工具给建议，人来做决定。不确定的核验进入复核队列，每个决定都要写明理由。

</td>
<td width="50%">
  <img src="../image/feature-review.png" alt="人工决定复核" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 研究实验室

论文就在应用里：方法比较、数据集捷径检查和模型卡。

</td>
<td width="50%">
  <img src="../image/feature-research.png" alt="研究实验室" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 机构仪表盘

一眼看清档案、核验、不确定比例和待决定事项。

</td>
<td width="50%">
  <img src="../image/feature-dashboard.png" alt="机构仪表盘" width="100%" />
</td>
</tr>
</table>

**还包括：**

- **证据报告** — 可打印的案件报告，可保存为 PDF。
- **比对** — 并排查看 2 到 6 个签名。
- **批量核验** — 一次核验多个签名。
- **员工账号与角色** — 核验员、主管和研究员，各有各的模块。
- **历史记录与 CSV 导出** — 每次核验、决定和备注都可搜索。
- **浅色与深色主题** — 布局从手机到桌面都适用。
- **隐私优先** — 签名只保存在这台电脑上。

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
