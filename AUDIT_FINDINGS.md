# Auditoría pesada de Belentani

## Alcance
Auditoría técnica y de cumplimiento del proyecto desplegado `belentani-mtmcq4q9.manus.space`, con revisión de frontend, backend, base de datos, almacenamiento, autenticación, IA, PDF, donaciones y privacidad.

## Evidencias iniciales

| Área | Evidencia | Estado inicial |
|---|---|---|
| Build | `pnpm check`, `pnpm test` y `pnpm build` habían pasado en la revisión previa | Parcial: debe repetirse tras correcciones |
| Tests | 7 archivos / 14 pruebas ligeras | Insuficiente para E2E real |
| CV | `server/routers.ts` llama a IA y persiste `cvData`; PDF se genera en `server/_core/index.ts` | Parcial: falta prueba real con DB/S3 |
| Foto | `/api/cv/photo` acepta Data URL y lo sube | Riesgo alto: body 50 MB, confianza en MIME, sin re-encode/validación de bytes |
| PDF | Ruta `/api/cv/:documentId/pdf` comprueba usuario propietario | Parcial: debe validar foto almacenada por usuario y probar descarga |
| Donación | `donation.createCheckout` es público y usa `Origin` para redirect | Riesgo alto: origin no allowlisteado, cantidad sin máximo, sin metadata/webhook |
| Seguridad | No se encontraron rate limit, helmet/CSP, sanitización backend ni CSRF explícitos | Riesgo alto |
| Cifrado | `encryption.ts` usa AES-256-CBC con clave aleatoria si falta `ENCRYPTION_KEY`; no se usa en `db.ts` ni routers | Riesgo crítico: PII/CV se almacena sin cifrar; afirmación de AES-256 no corresponde al flujo real |
| Contraseñas | Existe SHA-256 simple pero el acceso es Manus OAuth | Riesgo medio: código muerto/inadecuado si se habilita password |
| GDPR | Hay exportación y archivo lógico de documentos; no hay worker/purga definitiva ni borrado de cuenta | Riesgo crítico de cumplimiento operativo |
| DSAR | `dataExport` devuelve perfil/documentos/transacciones, pero no logs, privacidad ni archivos S3 | Parcial/incompleto |
| Autorización | `quality.list` comprueba role; `quality.report` no comprueba que el documento pertenezca al usuario | Riesgo alto: posible reporte sobre IDs de otros usuarios |
| Validación | CV acepta strings/arrays sin límites máximos ni formato de email; `photoUrl` solo comprueba prefijo | Riesgo alto: abuso de recursos y posible acceso indirecto a storage |
| Idiomas | Catálogo declara 39 códigos y endpoint público usa LLM con caché en memoria | Parcial: falta prueba UI real y caché persistente; coste/latencia no acotados |
| Producción | Dominio disponible `belentani-mtmcq4q9.manus.space`; los logs previos mostraron un error antiguo de módulo en desarrollo, posteriormente el servidor arrancó | Requiere validación limpia post-corrección |

## Riesgos prioritarios a corregir

1. Hacer obligatorios los límites de entrada, validar email, tamaños de arrays y texto, y añadir rate limiting.
2. Re-encodear imágenes con `sharp`, verificar bytes reales y restringir la clave de foto al prefijo del usuario.
3. Validar propiedad en reportes de calidad y en todas las operaciones de documentos.
4. Sustituir cifrado CBC no autenticado por AES-256-GCM con clave obligatoria y aplicar cifrado al `cvData` sensible o documentar cifrado de base/S3 real.
5. Añadir cabeceras de seguridad, origen permitido para Stripe y límites de donación.
6. Implementar purga definitiva de documentos, usuarios y objetos S3 tras el periodo definido, con prueba.
7. Completar DSAR con todos los datos y archivos bajo control del usuario.

Este archivo es una base de trabajo; el informe final debe distinguir hechos verificados de riesgos pendientes.

## Evidencia de producción

La landing desplegada en `https://belentani-mtmcq4q9.manus.space/` respondió y renderizó correctamente. Se observaron enlaces de OAuth, rutas de cursos/privacidad/términos, botón de donación y banner de cookies. Los claims visibles de “100% seguro” y “encriptación de nivel empresarial” no deben considerarse demostrados: la auditoría encontró que el módulo de cifrado no se aplica al `cvData` persistido. La producción carga cabeceras Helmet tras la corrección local pendiente de nuevo checkpoint.

## Marco legal contrastado

El contraste se hizo con fuentes oficiales: [RGPD 2016/679 en EUR-Lex](https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32016R0679), [LO 3/2018 en BOE](https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673), [Ley 34/2002 (LSSI-CE) en BOE](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758), [Guía de cookies de la AEPD](https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/aepd-actualiza-guia-cookies-para-adaptarla-a-nuevas-directrices-cepd), [criterios AEPD sobre DPD](https://www.aepd.es/preguntas-frecuentes/4-dpd/1-delegado-de-proteccion-de-datos/FAQ-0402-cuando-se-debe-nombrar-un-dpd) y [APDCAT](https://apdcat.gencat.cat/).

La web tiene banner y páginas legales, pero eso no demuestra cumplimiento. Faltan o deben verificarse documentalmente: identidad y domicilio del responsable, base jurídica por finalidad, encargados y transferencias internacionales (OAuth, LLM, Stripe/Forge/S3), registro de actividades, análisis de riesgos, contratos de encargado, procedimiento de brechas, plazos de respuesta DSAR, prueba de consentimiento y retirada, política de retención ejecutada, y designación real/comunicación de DPD solo si procede. “100% seguro”, “cifrado empresarial” y “cero riesgo legal” son afirmaciones que deben retirarse o probarse.

La aplicación no debe afirmar que existe un DPD si no hay persona/entidad designada y canal operativo. En Cataluña, APDCAT puede ser autoridad de control según el responsable y el ámbito; no sustituye el análisis de competencia de AEPD.

## Estado técnico verificado — 22 de agosto de 2026

> Esta sección sustituye el estado de riesgo descrito como **inicial** en las secciones anteriores. Conserva el diagnóstico previo como trazabilidad, no como descripción de la versión publicada actual.

| Área | Control técnico actual | Evidencia verificada | Estado |
| --- | --- | --- | --- |
| CV en reposo | `cvData` se persiste en un sobre `cv-v1` con AES-256-GCM e IV aleatorio; se descifra solo dentro del proceso de servidor para PDF o exportación. | Pruebas de cifrado y migración; la tarea diaria migra lotes históricos. | Implementado técnicamente |
| Fotos y almacenamiento | Se valida el tipo real con Sharp, se re-encodea a JPEG, se limita a 5 MB y el proxy exige autenticación/propiedad para rutas `users/<id>/`. | Pruebas de subida y de no acceso cruzado. | Implementado técnicamente |
| PDF | La descarga exige propietario, se genera bajo demanda y responde con `private, no-store`, `Pragma: no-cache` y `X-Robots-Tag`. | Pruebas de ownership y de cabeceras. | Implementado técnicamente |
| Entrada y abuso | Esquemas estrictos, límites de texto/listas, rate limits para API, fotos, PDF y cursos; mutaciones de usuario con comprobación de mismo origen. | Pruebas de regresión de entrada excesiva, CSRF y autorización. | Implementado técnicamente |
| Cabeceras | CSP de producción restrictiva, `frame-ancestors 'none'`, `object-src 'none'`, HSTS de Helmet, Referrer-Policy y Permissions-Policy mínima. | Pruebas de regresión de cabeceras. | Implementado técnicamente |
| Registros | Logs de errores saneados; el helper de auditoría únicamente conserva metadatos técnicos limitados. | Pruebas de auditoría y logs. | Implementado técnicamente |
| Borrado RGPD | Petición de baja con periodo de gracia y purga diaria autenticada mediante Heartbeat; incluye documentos, reportes y anonimización de cuenta. | Ruta cron, prueba y tarea programada activa. | Implementado técnicamente |
| IA y coste | El proveedor predeterminado es local/determinista; la integración externa es opcional y revierte al modo local en error. El catálogo educativo tampoco llama por defecto a un proveedor. | Pruebas de fallback y catálogo local. | Implementado técnicamente |
| Dependencias y secretos | Auditoría de producción sin vulnerabilidades conocidas y escaneo de archivos e historial Git sin patrones comunes de claves. | `pnpm audit --prod --audit-level=high` y escaneo no revelador. | Verificado en esta revisión |
| Operación | `/api/health` devuelve señal mínima sin configuración; métricas globales excluyen usuarios, CVs, prompts y documentos. | Comprobación en ejecución y migración de tabla. | Implementado técnicamente |

## Resultados de validación

| Comprobación | Resultado |
| --- | --- |
| Análisis de tipos | `pnpm check` correcto. |
| Suite de regresión | 16 archivos y **38 pruebas** correctas en la última ejecución. |
| Build de producción | `pnpm build` correcto. El bundle inicial bajó a 647.67 kB (191.40 kB gzip) y las rutas secundarias se emiten como chunks; aún conserva un aviso de tamaño superior a 500 kB, que es una mejora de rendimiento pendiente, no un fallo de compilación. |
| Dependencias de producción | Sin vulnerabilidades conocidas en el último `pnpm audit --prod --audit-level=high`. |
| Vista móvil | Landing, cursos y formulario guiado revisados a 375 × 812 px; la navegación pública se corrigió para no solaparse. |
| Despliegue | Landing y `/api/health` verificados en el dominio publicado; CSP, HSTS, Permissions-Policy, Referrer-Policy y `no-store` confirmados por cabeceras. Checkpoints publicados y sincronizados en `belentani7/belentani-studio`. |

## Matriz de riesgo residual

| Riesgo | Probabilidad | Impacto | Mitigación disponible | Estado |
| --- | --- | --- | --- | --- |
| Rotación del secreto raíz sin re-cifrado | Baja | Alta | Plan de migración y re-cifrado antes de rotar `JWT_SECRET`; preferir una futura `ENCRYPTION_KEY` separada. | Pendiente de decisión operativa |
| Borrado físico de objetos no referenciados en almacenamiento | Media | Media | La aplicación retira referencias y acceso; falta una política de ciclo de vida del proveedor para eliminación física. | Pendiente de configuración de plataforma |
| Traducciones educativas revisadas fuera de español | Alta | Baja | El modo local sirve el catálogo base y comunica que 39 idiomas están preparados; no se simula traducción. | Pendiente de contenidos o proveedor opcional |
| Garantía jurídica de cumplimiento | Media | Alta | Medidas técnicas y documentación; validar responsable, bases jurídicas, contratos, transferencias y procedimientos con asesoramiento profesional. | **LEGAL REVIEW REQUIRED** |
| IA opcional | Baja en modo local | Variable | Por defecto desactivada; antes de activarla decidir proveedor, coste, transferencias y aviso al usuario. | **BLOCKED BY EXTERNAL CREDENTIAL** para proveedor externo |

## Límites honestos

La aplicación no puede afirmar estar “blindada al 100 %” ni jurídicamente certificada solo por su código. El RGPD exige, además de medidas técnicas, responsabilidades organizativas y documentación de tratamiento.[1] La LOPDGDD y la LSSI-CE añaden obligaciones que dependen de la entidad responsable, los tratamientos y las comunicaciones comerciales reales.[2] [3]

Las decisiones empresariales pendientes incluyen identificar formalmente al responsable, publicar datos de contacto válidos, decidir encargados/subencargados, comprobar transferencias internacionales, establecer el proceso de brechas y definir la retención física del almacenamiento. La designación de DPD debe analizarse según las circunstancias reales, no declararse sin nombramiento y canal efectivo.[4]

## Modelo de coste y producto

El **modo básico útil** permanece gratuito: captura validada de datos, CV estructurado, PDF con foto, historial, exportación y cursos base. La viabilidad de bajo coste se apoya en operaciones locales, rate limits, PDF bajo demanda y donaciones voluntarias. Las opciones que sí pueden requerir análisis económico previo son traducción asistida, mejora de IA, OCR, correo transaccional, almacenamiento de larga duración y soporte a gran escala. No se activa ninguna de ellas silenciosamente.

### Referencias

[1]: https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32016R0679 "Reglamento (UE) 2016/679 — RGPD"
[2]: https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673 "Ley Orgánica 3/2018 — LOPDGDD"
[3]: https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758 "Ley 34/2002 — LSSI-CE"
[4]: https://www.aepd.es/preguntas-frecuentes/4-dpd/1-delegado-de-proteccion-de-datos/FAQ-0402-cuando-se-debe-nombrar-un-dpd "AEPD — Cuándo debe designarse un delegado de protección de datos"
