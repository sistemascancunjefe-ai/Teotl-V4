# Roadmap detallado con checkpoints por fase

## Fase 0 — Arranque (Setup)
**Meta:** poder trabajar ordenado desde el día 1.

### Checkpoints
- [x] README inicial (qué es, cómo correr, variables, estructura)
- [x] Estructura de carpetas + convenciones
- [x] Gestión de configuración/secretos definida (aunque sea local)
- [x] Licencia, CONTRIBUTING, CODEOWNERS (si aplica)

**Finalización de fase:** cualquier dev nuevo puede clonar y correr “algo” o al menos ejecutar pruebas/lint sin dolor.

## Fase 1 — Descubrimiento y Diseño
**Meta:** claridad del producto y decisiones técnicas base.

### Checkpoints
- [ ] “Documento 1-página” (visión, usuario, problema, propuesta)
- [ ] User stories del MVP + criterios de aceptación
- [ ] Diseño de arquitectura (diagrama simple)
- [ ] Modelo de datos (si aplica) y contratos (API/eventos)
- [ ] Riesgos y supuestos (lista corta)

**Finalización:** backlog del MVP priorizado + decisiones clave registradas.

## Fase 2 — Base técnica (infra, calidad, seguridad base)
**Meta:** construir la pista para despegar sin deuda crítica.

### Checkpoints
- [ ] CI mínimo: lint + tests + build
- [ ] Formateo/linters predecibles
- [ ] Entornos: dev/staging/prod (aunque prod sea futuro)
- [ ] Manejo de secretos correcto (no en repo)
- [ ] Logging estructurado + trazas básicas
- [ ] Dependabot / actualización de dependencias (opcional)

**Finalización:** cada PR valida automáticamente y el repo no se rompe fácil.

## Fase 3 — MVP (camino feliz)
**Meta:** entregar valor con el mínimo conjunto de features.

### Checkpoints
- [ ] Implementar “Happy Path” end-to-end
- [ ] UI/API funcional mínima (según el tipo de proyecto)
- [ ] Persistencia (si aplica) con migraciones
- [ ] Autenticación/autorización mínima (si aplica)
- [ ] Pruebas: unitarias clave + 1–3 e2e críticas

**Finalización:** demo estable del MVP, repetible, con datos controlados.

## Fase 4 — Beta (robustez)
**Meta:** hacerlo confiable y operable.

### Checkpoints
- [ ] Observabilidad: métricas + dashboards + alertas básicas
- [ ] Pruebas ampliadas (e2e, integración)
- [ ] Performance básica (profiling + límites)
- [ ] Seguridad: revisión OWASP básica, permisos, rate limits (si aplica)
- [ ] Documentación operativa (runbook)

**Finalización:** se puede usar por un grupo pequeño de usuarios sin incendios constantes.

## Fase 5 — Release 1.0
**Meta:** producción con control.

### Checkpoints
- [ ] Release notes + versionado
- [ ] Backups/restore probado (si hay datos)
- [ ] Plan de despliegue + rollback
- [ ] SLA/SLO (aunque sea simple)
- [ ] Soporte y monitoreo post-release

**Finalización:** “1.0” desplegado con monitoreo y procedimiento de operación.
