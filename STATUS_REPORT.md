### Informe de Estado: Teotl V4 (Nightmare Mode)

He revisado el repositorio y completado las tareas de estabilización de la **Fase 0** y la base de la **Fase 1**.

#### Contexto y Estado Actual del Desarrollo
1. **Motor (Rust/WASM)**: El núcleo del juego está funcional y expone una API determinística a través de `wasm-bindgen`. He compilado exitosamente el motor hacia WebAssembly (`teotl_wasm_bg.wasm`).
2. **Web Host (TypeScript/Vite)**: El entorno de navegador en `web/src` funciona correctamente. El `WasmBridge` carga el módulo y delega el ciclo de vida (game loop) usando `requestAnimationFrame` alimentando a `wasm.tick(dt)`.
3. **Pruebas (Tests)**:
   - Se migró el entorno de pruebas de JavaScript de Jest a `Vitest` para el Web Host.
   - Las pruebas de la suite de Rust (`cargo test --workspace`) pasaron exitosamente (33 tests, 0 fallos).
   - Las pruebas del frontend (`vitest run`) se ejecutan y validan sin errores (8 tests, 0 fallos).
4. **Construcción (Build)**: El proceso de empaquetado (`npm run build` con Vite) funciona sin errores, produciendo los artefactos listos para producción en el directorio `web/dist`.
5. **Evidencia**: Se levantó un servidor local y se utilizó un script en Python (Playwright) para capturar pantallazos (evidencias `screenshot_final.png` y `screenshot_running.png`).

#### Próximos Pasos Recomendados (Plan)
- **Fase 1 (Vertical Slice)**: Continuar con la implementación del HUD In-game y los shaders de distorsión WebGL para los niveles de trauma.
- **ECS & Colisiones**: Agregar lógica dentro del motor Rust para detección de colisiones de jugador y movimiento básico.
- **Pipeline de Arte**: Ejecutar los scripts de empaquetado de sprites (`tools/pack-assets.sh`) y generar el manifest de assets iniciales para la validación.
