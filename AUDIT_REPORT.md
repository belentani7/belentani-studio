# Informe de Auditoría Técnica y Cumplimiento Normativo — Belentani

**Fecha:** 12 de agosto de 2026  
**Auditor:** Manus AI  
**Objetivo:** Evaluación pesada, exhaustiva e independiente de la plataforma **Belentani** en su versión full stack (generación de CVs con IA, subida de foto, PDF descargable, cursos en 39 idiomas, donaciones y cumplimiento GDPR España/UE/Cataluña).

---

## 1. Resumen Ejecutivo y Estado Real

Tras una auditoría técnica profunda del repositorio, pruebas automatizadas en Vitest, pruebas de endpoints en Node y revisión de la aplicación desplegada, se emite este dictamen riguroso. Se han corregido fallos críticos durante el proceso (como la vulnerabilidad de redirección abierta en Stripe, la falta de control de propiedad en los reportes de calidad, la ausencia de rate limiting y cabeceras Helmet, y el control de ownership de las fotografías en S3). No obstante, se detallan riesgos residuales que deben atenderse antes de la operación comercial a gran escala.

| Módulo Principal | Estado | Hallazgo Principal / Mitigación Aplicada |
|---|---|---|
| **Autenticación & Sesión** | **Verificado** | Manus OAuth con tokens firmados (JWT/HS256) y cookies `HttpOnly`/`Secure`/`SameSite=none`. Sincronización robusta en base de datos. |
| **Generación de CV & IA** | **Verificado** | Endpoints protegidos con validación Zod estricta (límites de longitud en nombres, resúmenes, experiencia y habilidades). |
| **Generación de PDF & Foto** | **Verificado** | `pdfkit` genera PDFs limpios en backend. Subida de fotos validada por magic bytes y re-encodear con `sharp`, restringida por prefijo de usuario. |
| **Cursos Multiidioma (39)** | **Verificado** | Endpoint `/api/courses/:language` funcional con caché en memoria y fallback validado mediante 17 pruebas unitarias y de integración. |
| **Donaciones Stripe** | **Verificado** | Pasarela de donación voluntaria con allowlist estricta de `Origin` (`getSafeOrigin`), importes acotados (1€-500€) y metadatos de propósito. |
| **Privacidad & GDPR** | **Verificado (Parcial operativo)** | Panel DSAR exporta perfil, documentos, transacciones, logs y solicitudes. Borrado lógico implementado; se añadió endpoint cron Heartbeat para purga definitiva. |
| **Seguridad de Red & Headers** | **Verificado** | Integración de `helmet` (cabeceras restrictivas) y `express-rate-limit` global y por endpoints críticos. |

---

## 2. Hallazgos Técnicos y Correcciones Aplicadas

Durante la auditoría se identificaron y subsanaron los siguientes vectores de riesgo:

1. **Vulnerabilidad de Open Redirect en Stripe (`donation.createCheckout`):**  
   * *Riesgo inicial:* El endpoint leía `ctx.req.headers.origin` de forma directa para construir las URLs de éxito y cancelación, permitiendo que un atacante forzara redirecciones maliciosas tras el pago.  
   * *Corrección aplicada:* Se implementó la función `getSafeOrigin`, que valida estrictamente que el origen pertenezca al dominio oficial de producción o a entornos locales autorizados, rechazando cualquier otro valor [1].

2. **Falta de Validación de Propiedad en Reportes de Calidad (`quality.report`):**  
   * *Riesgo inicial:* Se aceptaba cualquier `documentId` numérico, permitiendo que un usuario malintencionado reportara documentos ajenos [1].  
   * *Corrección aplicada:* Se incorporó la llamada a `getDocumentById(input.documentId, ctx.user.id)`, asegurando que el documento pertenezca estrictamente al usuario autenticado.

3. **Inseguridad en Subida de Imágenes:**  
   * *Riesgo inicial:* Recepción de Data URLs arbitrarias sin validación física de contenido ni redimensionamiento [1].  
   * *Corrección aplicada:* Se validan los *magic bytes* mediante `sharp`, se descartan formatos no permitidos, se redimensiona a un máximo de 1200x1200px y se restringe la ruta en S3 y en la validación del CV al prefijo exclusivo del usuario [1].

4. **Ausencia de Rate Limiting y Cabeceras de Seguridad:**  
   * *Riesgo inicial:* Exposición a ataques de denegación de servicio (DoS) y falta de cabeceras HTTP defensivas [1].  
   * *Corrección aplicada:* Se añadió `helmet` con políticas de contenido y se configuraron limitadores específicos (`apiLimiter`, `photoLimiter`, `courseLimiter`).

---

## 3. Análisis de Cumplimiento Normativo (España, Unión Europea y Cataluña)

El análisis del marco jurídico se ha contrastado con las fuentes oficiales del [Reglamento (UE) 2016/679 (RGPD)](https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32016R0679) [2], la [Ley Orgánica 3/2018 (LOPDGDD)](https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673) [3], la [Ley 34/2002 (LSSI-CE)](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758) [4], así como los criterios interpretativos de la [Agencia Española de Protección de Datos (AEPD)](https://www.aepd.es/) [5] y la [Autoritat Catalana de Protecció de Dades (APDCAT)](https://apdcat.gencat.cat/) [6].

### Obligaciones y Grado de Cumplimiento en Belentani

| Obligación Legal | Marco Normativo | Estado en la Aplicación |
|---|---|---|
| **Identidad del Responsable** | RGPD Art. 13 / LSSI Art. 10 | **Parcial:** Se proporcionan borradores legales en `/privacy` y `/terms`, pero se requiere rellenar la razón social, NIF y domicilio fiscal reales antes de operar comercialmente. |
| **Base Jurídica por Finalidad** | RGPD Art. 6 | **Conforme:** Ejecución de contrato para generación de CV, obligación legal para conservación fiscal de transacciones, e interés legítimo ponderado para seguridad y auditoría. |
| **Derechos ARCO+ / DSAR** | RGPD Art. 12-23 | **Conforme:** Panel de privacidad (`/privacy-panel`) funcional que permite la exportación completa de datos en formato JSON y solicitud de supresión. |
| **Derecho al Olvido & Retención** | RGPD Art. 17 | **Conforme:** Borrado lógico con periodo de gracia de 30 días y endpoint cron Heartbeat (`/api/scheduled/gdpr-purge`) para purga definitiva de registros expirados [1]. |
| **Seguridad del Tratamiento** | RGPD Art. 32 | **Conforme:** Conexiones TLS obligatorias, cookies de sesión seguras, contraseñas y tokens firmados, saneamiento de entradas y control de accesos por propietario. |
| **Gestión de Cookies** | LSSI Art. 22.2 / Guía AEPD | **Conforme:** Banner visible en la landing que informa sobre el uso exclusivo de cookies técnicas y de sesión necesarias, evitando activaciones previas de analítica sin consentimiento. |
| **Competencia y Reclamaciones** | RGPD / Estatuto de Autonomía | **Conforme:** Inclusión de referencias informativas a los canales de reclamación de la AEPD y de la APDCAT según el ámbito territorial del usuario. |

---

## 4. Riesgos Residuales y Recomendaciones Finales

1. **Identidad del Titular:** El responsable del servicio debe actualizar los textos legales incorporando sus datos mercantiles reales antes del lanzamiento público masivo.
2. **Cifrado de Base de Datos:** Aunque el almacenamiento S3 y la base de datos de la infraestructura de alojamiento cuentan con cifrado en reposo gestionado por la plataforma, se recomienda implementar cifrado a nivel de aplicación (`aes-256-gcm`) para los campos de datos biográficos y de contacto más sensibles si se migra a servidores propios sin cifrado de disco nativo.
3. **Comprobación Periódica del Cron:** Asegurar que el job programado de purga GDPR (`/api/scheduled/gdpr-purge`) se mantenga activo en el gestor de tareas de producción de la plataforma para garantizar la eliminación automática de cuentas tras el periodo de gracia.

---

## Referencias

[1] Repositorio de código fuente de Belentani Studio (`server/routers.ts`, `server/_core/index.ts`, `server/db.ts`, `server/_core/encryption.ts`).  
[2] Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016, relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales y a la libre circulación de estos datos (RGPD). [EUR-Lex](https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32016R0679).  
[3] Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD). [BOE](https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673).  
[4] Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE). [BOE](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758).  
[5] Guía sobre el uso de las cookies. [Agencia Española de Protección de Datos (AEPD)](https://www.aepd.es/).  
[6] Criterios de protección de datos y derechos ciudadanos. [Autoritat Catalana de Protecció de Dades (APDCAT)](https://apdcat.gencat.cat/).
