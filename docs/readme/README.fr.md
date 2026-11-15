<h1 align="center">
  <img src="../image/icon.png" alt="4buwan" width="64" valign="middle" /> 4buwan
</h1>

<p align="center">
  <a href="https://github.com/og-cz/4buwan"><img src="https://img.shields.io/github/stars/og-cz/4buwan?style=flat&amp;label=%E2%98%85&amp;color=08C" alt="GitHub stars" /></a>
  <a href="https://github.com/og-cz/4buwan/releases"><img src="https://img.shields.io/github/downloads/og-cz/4buwan/total?style=flat&amp;color=08C" alt="Total downloads across all releases" /></a>
  <img src="https://img.shields.io/badge/license-MIT-08C?style=flat" alt="License: MIT" />
</p>

<p align="center">
  <sub><a href="../../README.md">English</a> · <a href="README.zh-CN.md">中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.es.md">Español</a> · Français · <a href="README.pt.md">Português</a> · <a href="README.tl.md">Tagalog</a></sub>
</p>

<p align="center">
  <strong>Vérification de signatures à partir d'échantillons authentiques uniquement.</strong><br/>
  Un espace d'expertise pour des décisions claires et des preuves vérifiables.
</p>

<p align="center">
  <img src="../image/readme-hero.png" alt="4buwan" width="960" />
</p>

## Fonctionnalités du système

<table>
<tr>
<td width="50%" valign="middle">

### Inscription avec des signatures authentiques uniquement

Douze signatures authentiques forment un profil, chacune contrôlée dès son arrivée. Aucune contrefaçon nécessaire, jamais.

</td>
<td width="50%">
  <img src="../image/feature-profile.png" alt="Inscription avec des signatures authentiques uniquement" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Vérification adaptée à chaque personne

R1-WAW ajuste un étalon partagé à la variation propre de chaque personne, puis donne un verdict indicatif avec une zone incertaine.

</td>
<td width="50%">
  <img src="../image/feature-verify.png" alt="Vérification adaptée à chaque personne" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Preuves vérifiables

Chaque verdict montre son raisonnement : le score face à la ligne de décision, les 12 comparaisons, les 17 mesures et la matrice de similarité.

</td>
<td width="50%">
  <img src="../image/feature-evidence.png" alt="Preuves vérifiables" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Revue par décision humaine

L’outil conseille, une personne décide. Les vérifications incertaines attendent dans une file de revue, et chaque décision exige un motif.

</td>
<td width="50%">
  <img src="../image/feature-review.png" alt="Revue par décision humaine" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Laboratoire de recherche

La thèse dans l’application : comparaison des méthodes, contrôle des raccourcis du jeu de données et fiche du modèle.

</td>
<td width="50%">
  <img src="../image/feature-research.png" alt="Laboratoire de recherche" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Tableau de bord du bureau

Profils, vérifications, taux d’incertitude et décisions en attente d’un coup d’œil.

</td>
<td width="50%">
  <img src="../image/feature-dashboard.png" alt="Tableau de bord du bureau" width="100%" />
</td>
</tr>
</table>

**Également inclus :**

- **Rapports de preuves** — Rapports de dossier imprimables, à enregistrer en PDF.
- **Comparer** — Examinez de deux à six signatures côte à côte.
- **Vérification par lot** — Vérifiez de nombreuses signatures en une fois.
- **Comptes et rôles du personnel** — Vérificateur, Superviseur et Chercheur, chacun avec ses modules.
- **Historique et export CSV** — Chaque vérification, décision et note, consultable.
- **Thèmes clair et sombre** — Avec une mise en page qui va du téléphone à l’ordinateur.
- **Confidentiel par conception** — Les signatures restent sur cet ordinateur.

---

## Fonctionnalités du modèle

Vérification hors ligne de signatures dépendante du scripteur. Chaque scripteur est enrôlé avec **12 signatures authentiques et aucune contrefaçon**.

### Chaîne de traitement

| Étape | Méthode | Détail |
|---|---|---|
| Prétraitement | Inversion → suppression du fond (Otsu) → recadrage → marges → redimensionnement | 100 × 100 px |
| Descripteur | HOG | 2 916 dimensions par signature |
| Représentation | Dissimilarité par paires | 17 mesures de différence par paire ; 66 paires authentiques par scripteur |
| Normalisation | Mise à l'échelle par mesure | Taille typique sur les scripteurs de développement |
| Métrique | Covariance adaptée au scripteur de rang 1 (J) | Blanchiment partagé (G) adapté selon sa direction principale |
| Classifieur | SVM à une classe | Entraîné sur les paires authentiques uniquement ; mêmes réglages pour tous |
| Score | Moyenne des sorties SVM | La signature testée est appariée aux 12 références |

### Métrique

La métrique partagée `W_G` blanchit les 17 mesures avec la covariance intra-scripteur mise en commun. J remplace la dispersion commune selon la direction principale `u₁` par la dispersion propre du scripteur `σ` ; toutes les autres directions restent partagées.

```math
W_J = W_G + \left(\sigma^{-1} - \lambda_1^{-1/2}\right) u_1 u_1^{\top}
```

Un seul paramètre par scripteur : 12 références suffisent pour l'estimer.

| Code | Métrique | Paramètres par scripteur |
|---|---|---|
| B | Diagonale globale | 0 |
| G | Covariance complète commune | 0 |
| **J** | **Adaptée au scripteur, rang 1** | **1** |

### Jeux de données

| Jeu de données | Écriture | Scripteurs de développement |
|---|---|---|
| CEDAR | Latine | 25 |
| BHSig260 Bengali | Bengali | 45 |
| BHSig260 Hindi | Devanagari | 72 |

Enrôlement : authentiques 1–12. Test : authentiques 13–24 et contrefaçons 1–12. 172 scripteurs sont réservés pour une unique évaluation finale.

### Résultats (ensemble de développement, 142 scripteurs)

| Métrique | AUC | EER |
|---|---|---|
| B — Diagonale globale | 0.772 | 25.8% |
| G — Covariance complète commune | 0.831 | 22.0% |
| **J — Adaptée au scripteur, rang 1** | **0.837** | **21.3%** |

| Jeu de données | J AUC | J EER |
|---|---|---|
| CEDAR | 0.839 | 21.3% |
| BHSig260 Bengali | 0.801 | 25.4% |
| BHSig260 Hindi | 0.858 | 18.8% |

Comparaisons appariées par scripteur avec tests de Wilcoxon, correction de Holm et intervalles bootstrap. J par rapport à G : +0,006 d'AUC (53 scripteurs améliorés, 13 dégradés, 76 inchangés).

> **Statut :** brouillon. Les résultats portent uniquement sur les scripteurs de développement ; l'évaluation réservée n'a pas encore été effectuée. En bengali, un contrôle fondé sur des statistiques d'image égale le modèle : ces résultats ne sont donc pas présentés comme de la vérification de signatures.

---

## Licence

4buwan est un logiciel libre et open source sous [licence MIT](../../LICENSE).

![4buwan footer](../image/footer.png)
