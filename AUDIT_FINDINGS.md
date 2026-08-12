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
