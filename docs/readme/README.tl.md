<h1 align="center">
  <img src="../image/icon.png" alt="4buwan" width="64" valign="middle" /> 4buwan
</h1>

<p align="center">
  <a href="https://github.com/og-cz/4buwan"><img src="https://img.shields.io/github/stars/og-cz/4buwan?style=flat&amp;label=%E2%98%85&amp;color=08C" alt="GitHub stars" /></a>
  <a href="https://github.com/og-cz/4buwan/releases"><img src="https://img.shields.io/github/downloads/og-cz/4buwan/total?style=flat&amp;color=08C" alt="Total downloads across all releases" /></a>
  <img src="https://img.shields.io/badge/license-MIT-08C?style=flat" alt="License: MIT" />
</p>

<p align="center">
  <sub><a href="../../README.md">English</a> · <a href="README.zh-CN.md">中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.es.md">Español</a> · <a href="README.fr.md">Français</a> · <a href="README.pt.md">Português</a> · Tagalog</sub>
</p>

<p align="center">
  <strong>Pagpapatunay ng pirma gamit lamang ang mga tunay na sample.</strong><br/>
  Isang workspace sa pagsusuri para sa malinaw na desisyon at ebidensiyang masusuri.
</p>

## Mga Feature ng Sistema

<table>
<tr>
<td width="50%" valign="middle">

### Pamagat ng Feature

Maikling paglalarawan ng feature.

</td>
<td width="50%" align="center">
  <sub><i>Paparating ang screenshot</i></sub>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Pamagat ng Feature

Maikling paglalarawan ng feature.

</td>
<td width="50%" align="center">
  <sub><i>Paparating ang screenshot</i></sub>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Pamagat ng Feature

Maikling paglalarawan ng feature.

</td>
<td width="50%" align="center">
  <sub><i>Paparating ang screenshot</i></sub>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Pamagat ng Feature

Maikling paglalarawan ng feature.

</td>
<td width="50%" align="center">
  <sub><i>Paparating ang screenshot</i></sub>
</td>
</tr>
</table>

---

## Mga Feature ng Modelo

Offline na pagpapatunay ng pirma na nakadepende sa sumulat. Ang bawat sumulat ay ini-enroll gamit ang **12 tunay na pirma at walang pineke**.

### Pipeline

| Yugto | Paraan | Detalye |
|---|---|---|
| Preprocessing | Invert → pag-alis ng background (Otsu) → crop → pad → resize | 100 × 100 px |
| Descriptor | HOG | 2,916 dimensyon bawat pirma |
| Representasyon | Pairwise na pagkakaiba | 17 sukat ng pagkakaiba bawat pares; 66 tunay na pares bawat sumulat |
| Normalisasyon | Scale bawat sukat | Karaniwang laki sa mga development na sumulat |
| Metric | Rank-1 writer-adaptive na covariance (J) | Shared whitening (G) na inaangkop sa pangunahing direksyon nito |
| Classifier | One-class SVM | Sinanay sa tunay na pares lamang; parehong setting para sa lahat |
| Pag-score | Average ng SVM output | Ipinapares ang test na pirma sa lahat ng 12 reference |

### Metric

Ang shared na metric na `W_G` ay nagwa-whiten sa 17 sukat gamit ang pinagsamang within-writer covariance. Pinapalitan ng J ang pinagsamang spread sa pangunahing direksyong `u₁` ng sariling spread ng sumulat na `σ`; nananatiling shared ang lahat ng iba pang direksyon.

```math
W_J = W_G + \left(\sigma^{-1} - \lambda_1^{-1/2}\right) u_1 u_1^{\top}
```

Isang parameter lamang bawat sumulat, kaya sapat ang 12 reference para tantiyahin ito.

| Code | Metric | Parameter bawat sumulat |
|---|---|---|
| B | Global diagonal | 0 |
| G | Pinagsamang full covariance | 0 |
| **J** | **Rank-1 writer-adaptive** | **1** |

### Mga Dataset

| Dataset | Sulat | Development na sumulat |
|---|---|---|
| CEDAR | Latin | 25 |
| BHSig260 Bengali | Bengali | 45 |
| BHSig260 Hindi | Devanagari | 72 |

Enrolment: tunay 1–12. Test: tunay 13–24 at pineke 1–12. 172 sumulat ang nakareserba para sa iisang huling ebalwasyon.

### Mga Resulta (development set, 142 sumulat)

| Metric | AUC | EER |
|---|---|---|
| B — Global diagonal | 0.772 | 25.8% |
| G — Pinagsamang full covariance | 0.831 | 22.0% |
| **J — Rank-1 writer-adaptive** | **0.837** | **21.3%** |

| Dataset | J AUC | J EER |
|---|---|---|
| CEDAR | 0.839 | 21.3% |
| BHSig260 Bengali | 0.801 | 25.4% |
| BHSig260 Hindi | 0.858 | 18.8% |

Paired ayon sa sumulat gamit ang Wilcoxon test, Holm correction at bootstrap interval. J laban sa G: +0.006 AUC (53 sumulat ang gumanda, 13 ang lumala, 76 ang walang pagbabago).

> **Status:** draft. Mula lamang sa mga development na sumulat ang mga resulta; hindi pa naisasagawa ang ebalwasyon sa nakareserbang set. Sa Bengali, katumbas ng modelo ang control na batay sa image statistics, kaya hindi iniuulat ang resulta sa Bengali bilang pagpapatunay ng pirma.

---

## Lisensya

Ang 4buwan ay libre at open source sa ilalim ng [MIT License](../../LICENSE).

![4buwan footer](../image/footer.png)
