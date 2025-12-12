// app/admin/integraciones/page.tsx
import { Suspense } from "react";
import { IntegracionesClient } from "./IntegracionesClient";

export default function IntegracionesPage() {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-4">
        Integraciones con Meta (Facebook / Instagram)
      </h1>

      <Suspense fallback={<p>Cargando estado de conexión...</p>}>
        <IntegracionesClient />
      </Suspense>
    </div>
  );
}
