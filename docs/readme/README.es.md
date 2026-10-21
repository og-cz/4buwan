<h1 align="center">
  <img src="../image/icon.png" alt="4buwan" width="64" valign="middle" /> 4buwan
</h1>

<p align="center">
  <a href="https://github.com/og-cz/4buwan"><img src="https://img.shields.io/github/stars/og-cz/4buwan?style=flat&amp;label=%E2%98%85&amp;color=08C" alt="GitHub stars" /></a>
  <a href="https://github.com/og-cz/4buwan/releases"><img src="https://img.shields.io/github/downloads/og-cz/4buwan/total?style=flat&amp;color=08C" alt="Total downloads across all releases" /></a>
  <img src="https://img.shields.io/badge/license-MIT-08C?style=flat" alt="License: MIT" />
</p>

<p align="center">
  <sub><a href="../../README.md">English</a> · <a href="README.zh-CN.md">中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · Español · <a href="README.fr.md">Français</a> · <a href="README.pt.md">Português</a> · <a href="README.tl.md">Tagalog</a></sub>
</p>

<p align="center">
  <strong>Verificación de firmas solo a partir de muestras genuinas.</strong><br/>
  Un espacio de examen para decisiones claras y evidencia verificable.
</p>

## Funciones del sistema

<table>
<tr>
<td width="50%" valign="middle">

### Título de la función

Breve descripción de la función.

</td>
<td width="50%" align="center">
  <sub><i>Captura próximamente</i></sub>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Título de la función

Breve descripción de la función.

</td>
<td width="50%" align="center">
  <sub><i>Captura próximamente</i></sub>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Título de la función

Breve descripción de la función.

</td>
<td width="50%" align="center">
  <sub><i>Captura próximamente</i></sub>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Título de la función

Breve descripción de la función.

</td>
<td width="50%" align="center">
  <sub><i>Captura próximamente</i></sub>
</td>
</tr>
</table>

---

## Funciones del modelo

Verificación offline de firmas dependiente del escritor. Cada escritor se registra con **12 firmas genuinas y ninguna falsificación**.

### Flujo de procesamiento

| Etapa | Método | Detalle |
|---|---|---|
| Preprocesamiento | Inversión → eliminación de fondo (Otsu) → recorte → relleno → redimensionado | 100 × 100 px |
| Descriptor | HOG | 2.916 dimensiones por firma |
| Representación | Disimilitud por pares | 17 medidas de diferencia por par; 66 pares genuinos por escritor |
| Normalización | Escala por medida | Tamaño típico entre los escritores de desarrollo |
| Métrica | Covarianza adaptativa al escritor de rango 1 (J) | Blanqueo compartido (G) adaptado en su dirección principal |
| Clasificador | SVM de una clase | Entrenado solo con pares genuinos; misma configuración para todos |
| Puntuación | Media de la salida del SVM | La firma de prueba se empareja con las 12 referencias |

### Métrica

La métrica compartida `W_G` blanquea las 17 medidas con la covarianza intra-escritor agrupada. J sustituye la dispersión agrupada en la dirección principal `u₁` por la dispersión propia del escritor `σ`; todas las demás direcciones siguen siendo compartidas.

```math
W_J = W_G + \left(\sigma^{-1} - \lambda_1^{-1/2}\right) u_1 u_1^{\top}
```

Un solo parámetro por escritor, por lo que 12 referencias bastan para estimarlo.

| Código | Métrica | Parámetros por escritor |
|---|---|---|
| B | Diagonal global | 0 |
| G | Covarianza completa agrupada | 0 |
| **J** | **Adaptativa al escritor de rango 1** | **1** |

### Conjuntos de datos

| Conjunto | Escritura | Escritores de desarrollo |
|---|---|---|
| CEDAR | Latina | 25 |
| BHSig260 Bengali | Bengalí | 45 |
| BHSig260 Hindi | Devanagari | 72 |

Registro: genuinas 1–12. Prueba: genuinas 13–24 y falsificaciones 1–12. 172 escritores se reservan para una única evaluación final.

### Resultados (conjunto de desarrollo, 142 escritores)

| Métrica | AUC | EER |
|---|---|---|
| B — Diagonal global | 0.772 | 25.8% |
| G — Covarianza completa agrupada | 0.831 | 22.0% |
| **J — Adaptativa al escritor de rango 1** | **0.837** | **21.3%** |

| Conjunto | J AUC | J EER |
|---|---|---|
| CEDAR | 0.839 | 21.3% |
| BHSig260 Bengali | 0.801 | 25.4% |
| BHSig260 Hindi | 0.858 | 18.8% |

Comparación pareada por escritor con pruebas de Wilcoxon, corrección de Holm e intervalos bootstrap. J frente a G: +0,006 de AUC (53 escritores mejoran, 13 empeoran, 76 sin cambios).

> **Estado:** borrador. Los resultados son solo de los escritores de desarrollo; la evaluación reservada aún no se ha ejecutado. En bengalí, un control basado en estadísticas de imagen iguala al modelo, por lo que esos resultados no se presentan como verificación de firmas.

---

## Licencia

4buwan es software libre y de código abierto bajo la [Licencia MIT](../../LICENSE).

![4buwan footer](../image/footer.png)
