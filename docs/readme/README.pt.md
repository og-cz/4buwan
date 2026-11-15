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

<p align="center">
  <img src="../image/readme-hero.png" alt="4buwan" width="960" />
</p>

## Funcionalidades do sistema

<table>
<tr>
<td width="50%" valign="middle">

### Cadastro só com assinaturas genuínas

Doze assinaturas genuínas formam um perfil, cada uma conferida assim que chega. Falsificações nunca são necessárias.

</td>
<td width="50%">
  <img src="../image/feature-profile.png" alt="Cadastro só com assinaturas genuínas" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Verificação adaptada a cada pessoa

O R1-WAW ajusta uma medida compartilhada à variação própria de cada pessoa e dá um veredito consultivo com zona incerta.

</td>
<td width="50%">
  <img src="../image/feature-verify.png" alt="Verificação adaptada a cada pessoa" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Evidência inspecionável

Cada veredito mostra o raciocínio: a pontuação diante da linha de decisão, as 12 comparações, as 17 medidas e a matriz de similaridade.

</td>
<td width="50%">
  <img src="../image/feature-evidence.png" alt="Evidência inspecionável" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Revisão com decisão humana

A ferramenta aconselha, uma pessoa decide. Verificações incertas aguardam numa fila de revisão, e toda decisão exige um motivo.

</td>
<td width="50%">
  <img src="../image/feature-review.png" alt="Revisão com decisão humana" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Laboratório de pesquisa

A tese dentro do app: comparação de métodos, checagem de atalhos do conjunto de dados e o cartão do modelo.

</td>
<td width="50%">
  <img src="../image/feature-research.png" alt="Laboratório de pesquisa" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Painel do escritório

Perfis, verificações, taxa de incertos e decisões pendentes num relance.

</td>
<td width="50%">
  <img src="../image/feature-dashboard.png" alt="Painel do escritório" width="100%" />
</td>
</tr>
</table>

**Também incluído:**

- **Relatórios de evidências** — Relatórios de caso para impressão que você pode salvar em PDF.
- **Comparar** — Examine de duas a seis assinaturas lado a lado.
- **Verificação em lote** — Verifique muitas assinaturas de uma vez.
- **Contas e papéis da equipe** — Verificador, Supervisor e Pesquisador, cada um com seus módulos.
- **Histórico e exportação CSV** — Cada verificação, decisão e nota, pesquisável.
- **Temas claro e escuro** — Com um layout que funciona do celular ao computador.
- **Privado por padrão** — As assinaturas ficam neste computador.

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
