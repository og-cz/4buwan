<h1 align="center">
  <img src="../image/icon.png" alt="4buwan" width="64" valign="middle" /> 4buwan
</h1>

<p align="center">
  <a href="https://github.com/og-cz/4buwan"><img src="https://img.shields.io/github/stars/og-cz/4buwan?style=flat&amp;label=%E2%98%85&amp;color=08C" alt="GitHub stars" /></a>
  <a href="https://github.com/og-cz/4buwan/releases"><img src="https://img.shields.io/github/downloads/og-cz/4buwan/total?style=flat&amp;color=08C" alt="Total downloads across all releases" /></a>
  <img src="https://img.shields.io/badge/license-MIT-08C?style=flat" alt="License: MIT" />
</p>

<p align="center">
  <sub><a href="../../README.md">English</a> · <a href="README.zh-CN.md">中文</a> · 日本語 · <a href="README.ko.md">한국어</a> · <a href="README.es.md">Español</a> · <a href="README.fr.md">Français</a> · <a href="README.pt.md">Português</a> · <a href="README.tl.md">Tagalog</a></sub>
</p>

<p align="center">
  <strong>本物の署名だけで行う署名検証。</strong><br/>
  判断が明確で、根拠を確認できる鑑定ワークスペース。
</p>

## システム機能

<table>
<tr>
<td width="50%" valign="middle">

### 機能タイトル

機能の短い説明。

</td>
<td width="50%" align="center">
  <sub><i>スクリーンショットは近日公開</i></sub>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 機能タイトル

機能の短い説明。

</td>
<td width="50%" align="center">
  <sub><i>スクリーンショットは近日公開</i></sub>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 機能タイトル

機能の短い説明。

</td>
<td width="50%" align="center">
  <sub><i>スクリーンショットは近日公開</i></sub>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 機能タイトル

機能の短い説明。

</td>
<td width="50%" align="center">
  <sub><i>スクリーンショットは近日公開</i></sub>
</td>
</tr>
</table>

---

## モデル機能

書き手依存のオフライン署名検証。各書き手は **本物の署名 12 枚のみ（偽造署名なし）** で登録されます。

### パイプライン

| 段階 | 手法 | 詳細 |
|---|---|---|
| 前処理 | 反転 → Otsu による背景除去 → 切り抜き → パディング → リサイズ | 100 × 100 px |
| 記述子 | HOG | 署名ごとに 2,916 次元 |
| 表現 | ペア間の相違度 | ペアごとに 17 の差分指標、書き手ごとに本物のペア 66 組 |
| 正規化 | 指標ごとのスケーリング | 開発用書き手全体での典型的な大きさ |
| 距離尺度 | ランク 1 書き手適応共分散（J） | 共有白色化（G）を主方向に沿って適応 |
| 分類器 | One-class SVM | 本物のペアのみで学習、全書き手で同一設定 |
| スコア | SVM 出力の平均 | テスト署名を 12 枚の参照署名すべてとペアにする |

### 距離尺度

共有尺度 `W_G` は、書き手全体でプールした書き手内共分散で 17 の指標を白色化します。J は主方向 `u₁` に沿ったプール済みのばらつきを書き手自身のばらつき `σ` に置き換え、他の方向はすべて共有のままにします。

```math
W_J = W_G + \left(\sigma^{-1} - \lambda_1^{-1/2}\right) u_1 u_1^{\top}
```

書き手ごとのパラメータは 1 つだけなので、12 枚の参照署名で推定できます。

| コード | 距離尺度 | 書き手ごとのパラメータ |
|---|---|---|
| B | グローバル対角 | 0 |
| G | プール全共分散 | 0 |
| **J** | **ランク 1 書き手適応** | **1** |

### データセット

| データセット | 文字 | 開発用書き手 |
|---|---|---|
| CEDAR | ラテン文字 | 25 |
| BHSig260 Bengali | ベンガル文字 | 45 |
| BHSig260 Hindi | デーヴァナーガリー | 72 |

登録：本物 1–12。テスト：本物 13–24 と偽造 1–12。172 人の書き手は 1 回限りの最終評価のために保留しています。

### 結果（開発セット、142 人の書き手）

| 距離尺度 | AUC | EER |
|---|---|---|
| B — グローバル対角 | 0.772 | 25.8% |
| G — プール全共分散 | 0.831 | 22.0% |
| **J — ランク 1 書き手適応** | **0.837** | **21.3%** |

| データセット | J AUC | J EER |
|---|---|---|
| CEDAR | 0.839 | 21.3% |
| BHSig260 Bengali | 0.801 | 25.4% |
| BHSig260 Hindi | 0.858 | 18.8% |

書き手単位の対応比較で、Wilcoxon 検定、Holm 補正、ブートストラップ区間を使用。J と G の差：AUC +0.006（改善 53 人、悪化 13 人、変化なし 76 人）。

> **ステータス：** 草案。結果は開発用書き手のみのものです。保留セットでの評価はまだ行っていません。ベンガル語では画像統計の対照がモデルと同等の性能を示すため、ベンガル語の結果は署名検証として報告していません。

---

## ライセンス

4buwan は [MIT ライセンス](../../LICENSE) のもとで公開されている無料のオープンソースソフトウェアです。

![4buwan footer](../image/footer.png)
