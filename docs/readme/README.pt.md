<h1 align="center">
  <img src="../image/icon.png" alt="4buwan" width="64" valign="middle" /> 4buwan
</h1>

<p align="center">
  <a href="https://github.com/og-cz/4buwan"><img src="https://img.shields.io/github/stars/og-cz/4buwan?style=flat&amp;label=%E2%98%85&amp;color=08C" alt="GitHub stars" /></a>
  <a href="https://github.com/og-cz/4buwan/releases"><img src="https://img.shields.io/github/downloads/og-cz/4buwan/total?style=flat&amp;color=08C" alt="Total downloads across all releases" /></a>
  <img src="https://img.shields.io/badge/license-MIT-08C?style=flat" alt="License: MIT" />
</p>

<p align="center">
  <sub><a href="../../README.md">English</a> · <a href="README.zh-CN.md">中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.es.md">Español</a> · <a href="README.fr.md">Français</a> · Português · <a href="README.tl.md">Tagalog</a></sub>
</p>

<p align="center">
  <strong>Verificação de assinaturas apenas a partir de amostras genuínas.</strong><br/>
  Um espaço de exame para decisões claras e evidências verificáveis.
</p>

## Funcionalidades do sistema

<table>
<tr>
<td width="50%" valign="middle">

### Título da funcionalidade

Breve descrição da funcionalidade.

</td>
<td width="50%" align="center">
  <sub><i>Captura de tela em breve</i></sub>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Título da funcionalidade

Breve descrição da funcionalidade.

</td>
<td width="50%" align="center">
  <sub><i>Captura de tela em breve</i></sub>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Título da funcionalidade

Breve descrição da funcionalidade.

</td>
<td width="50%" align="center">
  <sub><i>Captura de tela em breve</i></sub>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Título da funcionalidade

Breve descrição da funcionalidade.

</td>
<td width="50%" align="center">
  <sub><i>Captura de tela em breve</i></sub>
</td>
</tr>
</table>

---

## Funcionalidades do modelo

Verificação offline de assinaturas dependente do escritor. Cada escritor é cadastrado com **12 assinaturas genuínas e nenhuma falsificação**.

### Pipeline

| Etapa | Método | Detalhe |
|---|---|---|
| Pré-processamento | Inversão → remoção de fundo (Otsu) → recorte → preenchimento → redimensionamento | 100 × 100 px |
| Descritor | HOG | 2.916 dimensões por assinatura |
| Representação | Dissimilaridade por pares | 17 medidas de diferença por par; 66 pares genuínos por escritor |
| Normalização | Escala por medida | Tamanho típico entre os escritores de desenvolvimento |
| Métrica | Covariância adaptativa ao escritor de posto 1 (J) | Branqueamento compartilhado (G) adaptado na direção principal |
| Classificador | SVM de uma classe | Treinado apenas com pares genuínos; mesmas configurações para todos |
| Pontuação | Média da saída do SVM | A assinatura de teste é pareada com as 12 referências |

### Métrica

A métrica compartilhada `W_G` branqueia as 17 medidas com a covariância intra-escritor agrupada. J substitui a dispersão agrupada na direção principal `u₁` pela dispersão do próprio escritor `σ`; todas as outras direções continuam compartilhadas.

```math
W_J = W_G + \left(\sigma^{-1} - \lambda_1^{-1/2}\right) u_1 u_1^{\top}
```

Um único parâmetro por escritor, então 12 referências bastam para estimá-lo.

| Código | Métrica | Parâmetros por escritor |
|---|---|---|
| B | Diagonal global | 0 |
| G | Covariância completa agrupada | 0 |
| **J** | **Adaptativa ao escritor de posto 1** | **1** |

### Conjuntos de dados

| Conjunto | Escrita | Escritores de desenvolvimento |
|---|---|---|
| CEDAR | Latina | 25 |
| BHSig260 Bengali | Bengali | 45 |
| BHSig260 Hindi | Devanágari | 72 |

Cadastro: genuínas 1–12. Teste: genuínas 13–24 e falsificações 1–12. 172 escritores estão reservados para uma única avaliação final.

### Resultados (conjunto de desenvolvimento, 142 escritores)

| Métrica | AUC | EER |
|---|---|---|
| B — Diagonal global | 0.772 | 25.8% |
| G — Covariância completa agrupada | 0.831 | 22.0% |
| **J — Adaptativa ao escritor de posto 1** | **0.837** | **21.3%** |

| Conjunto | J AUC | J EER |
|---|---|---|
| CEDAR | 0.839 | 21.3% |
| BHSig260 Bengali | 0.801 | 25.4% |
| BHSig260 Hindi | 0.858 | 18.8% |

Comparação pareada por escritor com testes de Wilcoxon, correção de Holm e intervalos bootstrap. J versus G: +0,006 de AUC (53 escritores melhoraram, 13 pioraram, 76 sem mudança).

> **Status:** rascunho. Os resultados são apenas dos escritores de desenvolvimento; a avaliação reservada ainda não foi executada. Em bengali, um controle baseado em estatísticas de imagem empata com o modelo, por isso esses resultados não são apresentados como verificação de assinaturas.

---

## Licença

4buwan é software livre e de código aberto sob a [Licença MIT](../../LICENSE).

![4buwan footer](../image/footer.png)
