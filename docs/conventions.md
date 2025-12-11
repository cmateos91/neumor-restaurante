# Convenciones y guías rápidas

- **Mapa de editables**: `docs/editable-map.json` lista todos los `elementId` con su tab, página e input. Usa `lib/editable-map.ts` para consumirlo en código y `npm run validate-editables` para asegurarte de que no hay duplicados.
- **Contratos de navegación**: `lib/contracts.ts` centraliza tabs (`adminTabs`), rutas (`pagePaths`) y tipos de mensajes iframe/admin. Evita definir strings de tabs o paths en cada archivo.
- **Mensajería iframe-admin**: Los mensajes `postMessage` están centralizados en `useIframeCommunication` y usan el mapa de editables importado desde `lib/editable-map.ts`.
- **Nombrado de campos**: Los textos de navegación usan prefijo `nav_`; el resto sigue el patrón `pagina.section.campo` en `elementId` y `formRestaurante`.
- **Evita strings sueltas**: Reutiliza el mapa de editables o enums ya existentes antes de introducir nuevos literales.
- **Validación rápida**: `npm run validate-editables` verifica el manifiesto; `npm run lint` mantiene el estilo y evita patrones inseguros (por ejemplo, setState directo en effects).
- **Validación de esquemas**: `npm run validate-schemas` valida defaults (textos, layout) con Zod y detecta duplicados en manifiestos.
- **Mapas auxiliares**: `docs/navigation.json` (tabs/rutas), `docs/forms-map.json` (data-field por tab), `docs/page-layout.json` (secciones).
