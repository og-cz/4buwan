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

<p align="center">
  <img src="../image/readme-hero.png" alt="4buwan" width="960" />
</p>

## Funciones del sistema

<table>
<tr>
<td width="50%" valign="middle">

### Inscripción solo con firmas genuinas

Doce firmas genuinas crean un perfil, y cada una pasa un control de calidad al llegar. Nunca hacen falta falsificaciones.

</td>
<td width="50%">
  <img src="../image/feature-profile.png" alt="Inscripción solo con firmas genuinas" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Verificación adaptada a cada persona

R1-WAW ajusta una medida compartida a la variación propia de cada persona y da un veredicto orientativo con zona incierta.

</td>
<td width="50%">
  <img src="../image/feature-verify.png" alt="Verificación adaptada a cada persona" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Evidencia inspeccionable

Cada veredicto muestra su razonamiento: la puntuación frente a la línea de decisión, las 12 comparaciones, las 17 medidas y la matriz de similitud.

</td>
<td width="50%">
  <img src="../image/feature-evidence.png" alt="Evidencia inspeccionable" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Revisión con decisión humana

La herramienta aconseja, una persona decide. Las verificaciones inciertas esperan en una cola de revisión y cada decisión necesita un motivo.

</td>
<td width="50%">
  <img src="../image/feature-review.png" alt="Revisión con decisión humana" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Laboratorio de investigación

La tesis dentro de la app: comparación de métodos, comprobación de atajos del conjunto de datos y la ficha del modelo.

</td>
<td width="50%">
  <img src="../image/feature-research.png" alt="Laboratorio de investigación" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Panel de la oficina

Perfiles, verificaciones, tasa de inciertos y decisiones pendientes de un vistazo.

</td>
<td width="50%">
  <img src="../image/feature-dashboard.png" alt="Panel de la oficina" width="100%" />
</td>
</tr>
</table>

**También incluye:**

- **Informes de evidencia** — Informes de caso imprimibles que puedes guardar como PDF.
- **Comparar** — Examina de dos a seis firmas lado a lado.
- **Verificación por lotes** — Verifica muchas firmas de una vez.
- **Cuentas y roles del personal** — Verificador, Supervisor e Investigador, cada uno con sus módulos.
- **Historial y exportación CSV** — Cada verificación, decisión y nota, con búsqueda.
- **Temas claro y oscuro** — Con un diseño que funciona del teléfono al escritorio.
- **Privado por diseño** — Las firmas se quedan en este ordenador.

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
