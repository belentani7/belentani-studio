# Belentani Document Studio - Project TODO

## Project Overview
AI-powered CV generation platform for budget-conscious users. Accessible pricing (< €1/CV), GDPR-compliant, Stripe integration, secure by design.

---

## Phase 1: Database Schema & Core Infrastructure

### Database Schema
- [x] Create `documents` table (id, userId, title, content, cvData, status, createdAt, updatedAt, deletedAt)
- [x] Create `credits` table (id, userId, balance, lastUpdated, createdAt)
- [x] Create `transactions` table (id, userId, type, amount, stripeId, status, createdAt)
- [x] Create `ats_analyses` table (id, documentId, jobDescription, score, suggestions, createdAt)
- [x] Create `audit_logs` table (id, userId, action, ipAddress, userAgent, timestamp)
- [x] Create `privacy_requests` table (id, userId, type, status, requestedAt, completedAt)
- [x] Add indexes on userId, createdAt, deletedAt for performance
- [x] Run `pnpm db:push` to apply migrations

### Query Helpers (server/db.ts)
- [ ] getUserCredits(userId)
- [ ] deductCredits(userId, amount)
- [ ] addCredits(userId, amount)
- [ ] createDocument(userId, data)
- [ ] getDocumentsByUser(userId, limit, offset)
- [ ] getDocumentById(documentId, userId)
- [ ] deleteDocument(documentId, userId)
- [ ] createAtsAnalysis(documentId, jobDescription)
- [ ] logAuditEvent(userId, action, ipAddress, userAgent)
- [ ] createPrivacyRequest(userId, type)

---

## Phase 2: Landing Page & Public Content

### Landing Page (client/src/pages/Home.tsx)
- [x] Hero section with Belentani branding and value proposition
- [x] Feature cards (AI-powered, ATS optimization, instant PDF, affordable)
- [x] Pricing section with single price (0,99€ per CV, no subscription)
- [x] Testimonials section (placeholder for real user feedback)
- [x] CTA buttons: "Get Started Free" and "Learn More"
- [x] Footer with legal links (Privacy, Terms, Contact)

### Legal Pages
- [ ] Create client/src/pages/Privacy.tsx (GDPR-compliant Privacy Policy)
- [ ] Create client/src/pages/Terms.tsx (Terms of Use)
- [ ] Create client/src/pages/DataRequest.tsx (DSAR & deletion request form)
- [ ] Add routes in App.tsx for /privacy, /terms, /data-request

### Cookie Banner
- [ ] Create client/src/components/CookieBanner.tsx
- [ ] Store consent preference in localStorage
- [ ] Display banner only on first visit
- [ ] Link to Privacy Policy

---

## Phase 3: Authentication & User Management

### User Registration & Login
- [ ] Extend users table with credits_balance field
- [ ] Create registration flow (email validation, password hashing)
- [ ] Implement login with email/password
- [ ] Add "Remember me" functionality
- [ ] Session management with JWT (expiration: 24h)

### User Dashboard
- [ ] Create client/src/pages/Dashboard.tsx with DashboardLayout
- [ ] Display user profile (name, email, credits balance)
- [ ] Quick stats (CVs created, last CV date)
- [ ] Navigation to CV generator, history, privacy settings

### Privacy Panel
- [ ] Create client/src/pages/PrivacyPanel.tsx
- [ ] Display all stored personal data (name, email, CVs, transactions)
- [ ] Export data as JSON (DSAR compliance)
- [ ] Request account deletion (soft delete with 30-day grace period)
- [ ] View audit logs of account activity

---

## Phase 4: Stripe Integration

### Stripe Setup
- [ ] Add Stripe webhook endpoint at /api/webhooks/stripe
- [ ] Create Stripe products: "1 CV Credit" (0,99€), "5 CV Credits" (2,99€)
- [ ] Store Stripe product IDs in environment variables
- [ ] Implement webhook handlers for payment_intent.succeeded and charge.refunded

### Credit Purchase Flow
- [ ] Create client/src/pages/BuyCredits.tsx
- [ ] Display credit pack options with pricing
- [ ] Redirect to Stripe Checkout
- [ ] Handle successful payment (add credits to user account)
- [ ] Send receipt email via Resend/SendGrid
- [ ] Implement refund handling (deduct credits if refund issued)

### Payment Validation
- [ ] Verify Stripe webhook signatures
- [ ] Idempotency checks for duplicate payments
- [ ] Log all payment events in audit_logs
- [ ] Implement payment retry logic for failed transactions

---

## Phase 5: CV Generation with AI

### CV Generation Form
- [ ] Create client/src/pages/GenerateCV.tsx with multi-step form
- [ ] Step 1: Personal info (name, email, phone, location, summary)
- [ ] Step 2: Experience (company, role, duration, description)
- [ ] Step 3: Education (school, degree, field, graduation date)
- [ ] Step 4: Skills (add/remove skills with proficiency levels)
- [ ] Step 5: Review & Generate

### LLM Integration
- [ ] Create server/routers/cv.ts with generateCV procedure
- [ ] Implement prompt engineering for CV generation (professional, ATS-optimized)
- [ ] Call Gemini API with structured prompt
- [ ] Handle LLM errors and retries
- [ ] Cache generated CVs to reduce API calls

### PDF Generation
- [ ] Create server/services/pdfGenerator.ts
- [ ] Generate PDF from CV data using pdfkit or similar
- [ ] Upload PDF to S3 storage
- [ ] Return download URL to client
- [ ] Implement PDF template with professional styling

### Credit Deduction
- [ ] Check user credits before CV generation
- [ ] Deduct 1 credit per CV generated
- [ ] Handle insufficient credits (show error, offer purchase)
- [ ] Log credit deduction in transactions table

---

## Phase 6: ATS Optimization & Analysis

### ATS Analysis Engine
- [ ] Create server/services/atsAnalyzer.ts
- [ ] Parse job description for keywords
- [ ] Compare CV content against keywords
- [ ] Calculate compatibility score (0-100)
- [ ] Generate improvement suggestions (specific, actionable)

### ATS Analysis UI
- [ ] Create client/src/pages/ATSAnalysis.tsx
- [ ] Input field for job description
- [ ] Display compatibility score with visual indicator (gauge/progress bar)
- [ ] List of missing keywords with suggestions
- [ ] Option to regenerate CV with suggestions applied

### ATS Integration
- [ ] Create server/routers/ats.ts with analyzeCV procedure
- [ ] Store ATS analysis results in database
- [ ] Implement caching to avoid duplicate analyses
- [ ] Add ATS analysis as premium feature (free for first 3, then 0,49€ per analysis)

---

## Phase 7: Document History & Management

### Document History Page
- [ ] Create client/src/pages/DocumentHistory.tsx
- [ ] Display list of user's CVs (title, creation date, status)
- [ ] Search and filter by date/status
- [ ] Pagination for large lists

### Document Actions
- [ ] Download CV as PDF
- [ ] Edit CV (reload form with existing data)
- [ ] Duplicate CV (create copy with new title)
- [ ] Delete CV (soft delete, recoverable for 30 days)
- [ ] View ATS analysis history

### Document Details Modal
- [ ] Create client/src/components/DocumentDetailsModal.tsx
- [ ] Show CV metadata (created, modified, last downloaded)
- [ ] Display ATS score if available
- [ ] Quick actions (download, edit, duplicate, delete)

---

## Phase 8: Security & Data Protection

### Input Sanitization
- [ ] Install DOMPurify and sanitize-html packages
- [ ] Create server/middleware/sanitize.ts
- [ ] Sanitize all user inputs (CV data, job descriptions, profile info)
- [ ] Implement XSS prevention in frontend (React auto-escaping + DOMPurify)
- [ ] Validate input types and lengths

### Rate Limiting
- [ ] Install express-rate-limit
- [ ] Implement rate limiting by user ID (100 requests/hour)
- [ ] Implement rate limiting by IP (1000 requests/hour)
- [ ] Apply rate limiting to: CV generation, ATS analysis, payment endpoints
- [ ] Return 429 status with retry-after header

### Session Security
- [ ] Implement JWT with secure signing (HS256 or RS256)
- [ ] Set session expiration to 24 hours
- [ ] Implement refresh token mechanism
- [ ] Secure cookies: HttpOnly, Secure, SameSite=Strict
- [ ] Implement CSRF protection

### HTTPS & TLS
- [ ] Enforce HTTPS in production
- [ ] Set HSTS header (Strict-Transport-Security)
- [ ] Implement CSP (Content Security Policy) headers
- [ ] Add security headers (X-Frame-Options, X-Content-Type-Options, etc.)

### Data Encryption
- [ ] Encrypt sensitive fields at rest (passwords with bcrypt)
- [ ] Use TLS for data in transit
- [ ] Implement field-level encryption for PII if needed

### Audit Logging
- [ ] Log all user actions (login, CV generation, payment, data access)
- [ ] Log failed authentication attempts
- [ ] Log data access and modifications
- [ ] Implement log rotation (keep 90 days of logs)
- [ ] Create admin endpoint to view audit logs

---

## Phase 9: GDPR Compliance & Legal

### Privacy Policy
- [ ] Create comprehensive Privacy Policy (client/src/pages/Privacy.tsx)
- [ ] Document data collection purposes (CV generation, payment processing)
- [ ] Explain data retention policies (90 days after deletion)
- [ ] Detail user rights (access, rectification, deletion, portability)
- [ ] Include cookie policy
- [ ] Specify third-party processors (Stripe, Gemini API, S3)

### Terms of Use
- [ ] Create Terms of Use (client/src/pages/Terms.tsx)
- [ ] Define acceptable use (no illegal content, no spam)
- [ ] Liability limitations
- [ ] Intellectual property rights
- [ ] Dispute resolution and governing law (Spanish/EU law)

### Data Subject Access Request (DSAR)
- [ ] Create client/src/pages/DataRequest.tsx form
- [ ] Implement DSAR processing (export all user data as JSON)
- [ ] Implement right to deletion (soft delete with 30-day grace period)
- [ ] Send confirmation email for DSAR/deletion requests
- [ ] Track DSAR in privacy_requests table
- [ ] Respond to requests within 30 days (GDPR requirement)

### Cookie Consent
- [ ] Implement cookie banner (client/src/components/CookieBanner.tsx)
- [ ] Store consent preference in localStorage + database
- [ ] Only load analytics/tracking after consent
- [ ] Provide option to withdraw consent

### Data Retention Policy
- [ ] Delete user data 90 days after account deletion (soft delete grace period)
- [ ] Implement automated cleanup job (cron or scheduled task)
- [ ] Keep audit logs for 1 year (compliance requirement)
- [ ] Implement data export before deletion

---

## Phase 10: Email & Notifications

### Email Setup
- [ ] Choose email provider (Resend, SendGrid, or Manus built-in)
- [ ] Create email templates (receipt, welcome, data export, deletion confirmation)
- [ ] Implement email sending in tRPC procedures

### Receipt Emails
- [ ] Send receipt after successful payment
- [ ] Include: amount, credits purchased, transaction ID, invoice link

### DSAR & Deletion Emails
- [ ] Send confirmation email when DSAR is requested
- [ ] Send data export link (expires in 7 days)
- [ ] Send confirmation when account is deleted

---

## Phase 11: Testing & Quality Assurance

### Unit Tests
- [ ] Test credit deduction logic
- [ ] Test ATS keyword matching algorithm
- [ ] Test input sanitization
- [ ] Test rate limiting middleware
- [ ] Test JWT token generation and validation
- [ ] Write vitest specs in server/*.test.ts

### Integration Tests
- [ ] Test full CV generation flow (form → LLM → PDF → storage)
- [ ] Test payment flow (Stripe webhook → credit addition)
- [ ] Test DSAR flow (request → export → email)
- [ ] Test session management (login → auth → logout)

### Security Tests
- [ ] Test XSS prevention (inject malicious scripts)
- [ ] Test SQL injection prevention
- [ ] Test rate limiting (exceed limits)
- [ ] Test CSRF protection
- [ ] Test unauthorized access (try to access other users' data)

### Performance Tests
- [ ] Test CV generation speed (target: < 10 seconds)
- [ ] Test PDF generation speed (target: < 5 seconds)
- [ ] Test database query performance (indexes, query optimization)
- [ ] Load test with 100+ concurrent users

---

## Phase 12: Deployment & Launch

### Pre-launch Checklist
- [ ] All tests passing
- [ ] Security audit completed
- [ ] GDPR compliance verified
- [ ] Stripe integration tested in production mode
- [ ] Email templates tested
- [ ] PDF generation tested
- [ ] Rate limiting tested
- [ ] Backup strategy implemented

### Deployment
- [ ] Deploy to production (Manus hosting)
- [ ] Set up monitoring and alerting
- [ ] Configure automated backups
- [ ] Set up error tracking (Sentry or similar)
- [ ] Create runbook for common issues

### Post-launch
- [ ] Monitor error rates and performance
- [ ] Collect user feedback
- [ ] Iterate on design based on feedback
- [ ] Plan Phase 2 features (templates, multi-language, etc.)

---

## Optional Future Features (Phase 2+)

- [ ] CV templates (modern, traditional, creative)
- [ ] Multi-language support (Spanish, English, French)
- [ ] LinkedIn import (auto-fill CV data)
- [ ] Cover letter generation
- [ ] Interview preparation (mock questions)
- [ ] Job board integration (apply directly from platform)
- [ ] Team/HR features (bulk CV generation, analytics)
- [ ] API for third-party integrations

---

## Key Metrics to Track

- **User Acquisition:** Signups per day, conversion rate from landing page
- **Engagement:** CVs generated per user, repeat usage rate
- **Revenue:** Total credits sold, average revenue per user, churn rate
- **Quality:** User satisfaction (NPS), support tickets, bug reports
- **Security:** Failed login attempts, DSAR requests, data breaches (0 target)
- **Performance:** API response times, PDF generation time, error rates

---

## Compliance Checklist

- [ ] GDPR Privacy Policy published
- [ ] GDPR Terms of Use published
- [ ] Cookie banner implemented
- [ ] DSAR process implemented
- [ ] Right to deletion implemented
- [ ] Data retention policy documented
- [ ] Stripe PCI compliance verified
- [ ] Security audit completed
- [ ] Penetration testing completed (optional but recommended)
- [ ] Insurance for data breach (optional but recommended)

## Full stack real y estabilización
- [x] Corregir error de compilación en server/routers.ts
- [x] Verificar build de producción y arranque del servidor
- [x] Implementar generación de PDF descargable desde el backend
- [x] Implementar subida y asociación de foto al CV
- [x] Integrar IA real en el flujo de creación del CV
- [x] Integrar cursos y material didáctico multiidioma
- [x] Implementar donaciones voluntarias sin cobro por CV
- [ ] Verificar privacidad, eliminación y exportación de datos
- [x] Ejecutar pruebas unitarias y de flujo completo
- [x] Guardar checkpoint únicamente después de build y pruebas exitosos
- [x] Traducir y servir el contenido didáctico real en los 39 idiomas soportados
- [x] Añadir prueba que confirme que el contenido cambia al cambiar de idioma

## Auditoría Pesada y Rigurosa
- [x] Inventariar código, rutas, dependencias, esquema y endpoints de producción
- [x] Auditar seguridad, autenticación, cifrado, control de accesos y pagos/donaciones Stripe
- [x] Verificar flujo disponible de CV con IA, foto, PDF y persistencia; documentar límites E2E
- [x] Auditar cumplimiento GDPR España/UE y Cataluña (DSAR, borrado lógico, DPO, retención)
- [x] Verificar catálogo multiidioma (39 idiomas) y traducción dinámica
- [x] Ejecutar pruebas de regresión disponibles (17 pruebas) y documentar riesgos residuales

### Correcciones críticas de auditoría
- [x] Validar y allowlistear Origin/URLs en donaciones Stripe y limitar cantidades
- [x] Comprobar propiedad del documento antes de crear un quality report
- [x] Añadir rate limiting y cabeceras HTTP de seguridad
- [x] Validar límites estrictos de CV y sanitizar entradas del backend
- [x] Validar, re-encodear fotos con Sharp y restringir claves de storage al usuario
- [x] Aplicar AES-256-GCM al CV sensible con clave gestionada y compatibilidad de migración
- [ ] Implementar purga GDPR de documentos, solicitudes y objetos almacenados expirados
- [x] Corregir helpers de transacciones para coincidir con el esquema
- [ ] Añadir pruebas de regresión de autorización, origin, límites, purga y PDF por propietario
- [x] Restringir photoUrl al prefijo del usuario autenticado y corregir el patrón real de claves sin extensión
- [x] Añadir prueba que impida usar una foto perteneciente a otro usuario
- [x] Exigir autenticación y propiedad en el proxy de objetos bajo users/<id>/

## Publicación en GitHub
- [x] Comprobar estado de Git y exclusión de secretos (.gitignore)
- [x] Crear repositorio privado o público en GitHub mediante gh CLI
- [x] Subir la rama principal con los cambios verificados

## Auditoría de Versiones y Mejoras Integradas
- [x] Localizar fuentes e inventariar las dos versiones (versión Node/Express monorepo vs versión ZIP frontend Next.js)
- [x] Analizar diferencias arquitectónicas, seguridad, IA y manejo de PDF/foto
- [x] Aplicar mejoras de usabilidad y robustez identificadas
- [x] Ejecutar tests, build, verificación de producción y sincronización en GitHub

## Endurecimiento posterior a auditoría de versiones
- [x] Aplicar sanitización determinista y límites de negocio al contrato de CV antes de llamar a la IA
- [x] Cifrar el contenido persistido del CV con AES-256-GCM y descifrarlo solo en exportación/PDF
- [x] Añadir pruebas de cifrado de CV, sanitización y ownership del PDF
- [x] Verificar y documentar el endpoint de purga GDPR sin cambiar el esquema de forma destructiva
- [x] Programar la purga GDPR diaria en producción mediante Heartbeat
- [x] Migrar de forma acotada los CVs históricos que aún estén en texto plano al sobre cifrado
