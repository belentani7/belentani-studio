# Auditoría comparativa de las dos versiones de Belentani

## Alcance

Se compararon la versión principal `belentani-studio` y el archivo `belentani-ai-cv.zip` extraído en `/tmp/belentani_v1`. La revisión se centró en las funciones que afectan al usuario: creación de CV, foto, PDF, IA, idiomas, privacidad, almacenamiento, autenticación y mantenibilidad.

| Área | Versión principal | Versión ZIP | Decisión aplicada |
|---|---|---|---|
| Backend | Express + tRPC + Drizzle + OAuth Manus | `server.ts` monolítico con API propia y Gemini directo | Mantener la versión principal por separación de rutas, auth y DB. |
| Formulario CV | Formulario corto; experiencia y formación no eran editables de forma usable | Formulario y componentes de preview más ricos | Integrar formulario guiado de cuatro pasos, filas dinámicas y revisión previa en `Dashboard.tsx`. |
| IA | Pipeline backend `enhanceCVWithAI`, protegido y testeable | Llamada Gemini desde servidor de la versión ZIP, con mayor acoplamiento | Mantener IA server-side en pipeline actual; no exponer claves ni copiar el servidor monolítico. |
| PDF | `pdfkit` en backend con endpoint autenticado | Preview visual en cliente y exportación dependiente del servidor ZIP | Mantener PDF backend y añadir una revisión de datos antes de generar. |
| Foto | Upload validado, re-encodeado y asociado al usuario | `UploadSection` más completo, pero requiere auditar el servidor propio | Mantener upload seguro actual y reforzar UX; no copiar rutas no autenticadas. |
| Traducciones | Catálogo y endpoint de cursos para 39 idiomas | Catálogo amplio de traducciones en cliente | Mantener traducción dinámica de cursos; no duplicar un catálogo de UI enorme sin necesidad. |
| Datos de Cataluña | Recursos en `cataloniaData.ts` | Radio, festivos y temas informativos mezclados con la app | Candidato a módulo educativo futuro; no se incorporan datos externos sin fuentes y fecha de actualización. |
| Privacidad | OAuth, DSAR, borrado lógico, rate limiting, Helmet y ownership | No se acredita aislamiento equivalente | Mantener la versión principal como base de producción. |
| Mantenibilidad | Capas separadas y pruebas Vitest | `App.tsx` y `server.ts` muy grandes y acoplados | No fusionar código monolítico; incorporar únicamente patrones de UX y contenido auditados. |

## Mejoras aplicadas

La mejora principal ya está integrada en el Dashboard de producción. El usuario ahora completa cuatro pasos: datos personales, experiencia laboral, formación y habilidades, y revisión. Puede añadir o eliminar múltiples experiencias y estudios, visualizar un resumen previo, subir una foto opcional y generar el CV solamente después de revisar sus datos. El frontend filtra filas vacías, aplica límites razonables y conserva la validación definitiva en el backend.

La mejora evita un problema funcional importante de la versión anterior: aunque el backend aceptaba arrays de experiencia y formación, la interfaz solo presentaba una fila inicial sin controles suficientes para editarlos. La nueva interfaz aprovecha la capacidad ya existente del pipeline y no modifica el contrato tRPC.

## Riesgos descartados

No se copiaron el servidor monolítico, llamadas de IA desde el cliente, claves de API, endpoints sin autenticación, dependencias no verificadas ni afirmaciones de seguridad absoluta. Tampoco se incorporaron los módulos conceptuales del protocolo Ω-Max que no son implementaciones reales y podrían crear una falsa sensación de seguridad.

## Verificación

`pnpm check` pasa después de la integración. La prueba de ownership de fotografías permanece en la suite de regresión. Antes de publicar la siguiente versión deben ejecutarse la suite completa, el build de producción y una comprobación del flujo de descarga PDF en el entorno desplegado.
