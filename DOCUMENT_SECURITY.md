# Seguridad de documentos y CV

## Estado implementado

Belentani cifra el contenido estructurado de los CV antes de guardarlo en la columna `documents.cvData`. Cada registro nuevo se persiste como un sobre `cv-v1` con `AES-256-GCM`; ni el nombre, ni el email, ni la experiencia aparecen en texto legible dentro de ese sobre. Los documentos existentes en formato anterior siguen siendo legibles de forma compatible durante la migración no destructiva.

| Superficie | Control aplicado | Resultado operativo |
| --- | --- | --- |
| Datos de CV en reposo | AES-256-GCM autenticado con IV aleatorio | El contenido del CV se cifra antes de insertarse en la base de datos. |
| Material criptográfico | `ENCRYPTION_KEY` opcional y preferente; derivación HKDF desde el secreto de sesión gestionado si no existe | La instalación no queda bloqueada por una clave manual. La clave de sesión no se expone al cliente. |
| IA | Modo local determinista si la llamada de IA falla o no devuelve JSON válido | El PDF puede generarse con los datos ya validados sin depender de una API externa. |
| PDF | Generación autenticada y bajo demanda | No se conserva una segunda copia PDF en almacenamiento tras la descarga. |
| Listados | Datos y URL de PDF excluidos de `cv.list` | La interfaz de historial recibe únicamente metadatos necesarios. |
| Exportación RGPD | Descifrado solo dentro del proceso de servidor para el titular autenticado | La exportación incluye el contenido del documento sin guardar una copia descifrada. |
| Foto | Tipo real validado con Sharp, re-encode JPEG, límite de 5 MB y prefijo de titularidad | Reduce contenido activo y evita usar fotos de otra cuenta. |
| Proxy de almacenamiento | Claves acotadas, sin `..`, sin URLs externas, y autorización del propietario en `users/<id>/...` | Impide traversal, redirecciones de almacenamiento controladas por el usuario y lectura cruzada de fotos. |
| Abuso | Límites de foto, PDF, cursos y API | Reduce consumo y operaciones repetitivas no autorizadas. |

## Reglas de acceso

El endpoint de PDF obtiene el documento con el par `(documentId, userId)` del usuario autenticado. Una ID de otro usuario devuelve `404` y no llega a generar ni a exponer el archivo. Los reportes de calidad aplican la misma comprobación de propietario.

El proxy solo resuelve claves de objeto internas. No acepta `..`, esquemas como `https://` ni rutas que comiencen con caracteres no permitidos. Las rutas de almacenamiento del usuario se siguen validando también en el contrato de creación de CV.

## Retención y purga

La solicitud de supresión archiva documentos durante treinta días. El endpoint de mantenimiento `/api/scheduled/gdpr-purge` exige una identidad de tarea programada y, al expirar el periodo, elimina documentos y reportes, anonimiza la cuenta y borra identificadores personales de los logs de auditoría. La tarea debe ejecutarse mediante Heartbeat en producción; su programación y resultados se administran fuera del proceso web.

La tarea de producción `belentani-gdpr-purge` está activada con la expresión UTC `0 0 3 * * *` (todos los días a las 03:00 UTC) y el identificador de plataforma `2dnhverckRxnyzjErNoHtf`.

Después, la tarea `belentani-cv-encryption-migration` se ejecuta a las 03:05 UTC con `0 5 3 * * *` e identificador `55ob4pRKpeFUE72a8jcSC5`. Migra como máximo 250 CVs antiguos por ejecución, por lo que reduce el impacto sobre la base de datos y se detiene de forma natural cuando no quedan sobres anteriores.

> La interfaz de almacenamiento disponible no ofrece eliminación física directa de objetos. Al purgar se eliminan las referencias y el acceso de aplicación; la retención/borrado físico del proveedor debe configurarse con una política de ciclo de vida cuando la plataforma lo permita.

## Limitaciones y operación segura

La derivación HKDF desde `JWT_SECRET` permite operar sin una nueva clave manual, pero una futura rotación de ese secreto requiere un plan de migración/re-cifrado de los CV. Para una separación de claves y rotación independiente, se recomienda configurar posteriormente `ENCRYPTION_KEY` como secreto de 32 bytes hexadecimal.

Estos controles reducen riesgos técnicos comprobados, pero no sustituyen una evaluación jurídica, un acuerdo de encargados, la gestión de brechas o un análisis de impacto cuando sea exigible.
