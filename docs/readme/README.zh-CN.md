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

### 可打印的证据报告

一键把案件变成可存档的报告：待检签名、全部 12 个参考签名、结论和评分。可打印，也可保存为 PDF。

</td>
<td width="50%">
  <img src="../image/feature-report.png" alt="可打印的证据报告" width="100%" />
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

### 捷径检查

证明方法读的是笔迹，而不是扫描仪。每个结果都与只看简单图像特征的对照组比较。

</td>
<td width="50%">
  <img src="../image/feature-shortcut.png" alt="捷径检查" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 角色与员工账号

核验员负责核验，主管做决定并管理员工，研究员研究方法。每个角色只看到自己需要的模块。

</td>
<td width="50%">
  <img src="../image/feature-staff.png" alt="角色与员工账号" width="100%" />
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

- **比对** — 并排查看 2 到 6 个签名。
- **批量核验** — 一次核验多个签名。
- **历史记录与 CSV 导出** — 每次核验、决定和备注都可搜索。
- **浅色与深色主题** — 布局从手机到桌面都适用。
- **隐私优先** — 签名只保存在这台电脑上。

---

## 模型功能

依赖书写者的离线签名验证。每位书写者仅用 **12 个真实签名、不使用任何伪造签名** 进行注册。

### 方法（摘要）

签名按成对方式比较。一个只用该书写者真实签名对训练的模型，把待检签名与全部 12 个参考签名逐一评分。方法的核心 **R1-WAW**（秩一书写者自适应白化）用一个参数把多位书写者共享的尺度调整到每位书写者，因此 12 个参考签名就足以拟合。

实现细节不公开：核验引擎以编译形式提供（`backend/sigdesk_engine/engine.pyc`，Python 3.14）。

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
