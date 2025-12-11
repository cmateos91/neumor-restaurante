# Live preview y mensajería iframe/admin

- Mensajes tipados en `lib/contracts.ts` (`AdminToIframeMessage`, `IframeToAdminMessage`). Usa esos tipos cuando añadas nuevos mensajes.
- Editables: `docs/editable-map.json` + `lib/editable-map.ts`. Añade nuevos `elementId` ahí y ejecuta `npm run validate-editables`.
- Navegación: `docs/navigation.json` y `lib/contracts.ts` definen tabs y rutas. No uses strings sueltas.
- Validaciones: `npm run validate-editables` y `npm run validate-schemas` para detectar inconsistencias de mapa/layout/schemas.
