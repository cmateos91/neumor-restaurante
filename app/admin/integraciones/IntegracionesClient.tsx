// app/admin/integraciones/IntegracionesClient.tsx
"use client";

import { useSearchParams } from "next/navigation";

export function IntegracionesClient() {
  const searchParams = useSearchParams();
  const connected = searchParams.get("connected");

  const handleConnectClick = async () => {
    // Aquí llamas a tu API de core para obtener la URL de login
    const res = await fetch("/api/meta/connect?clienteId=RESTAURANTE_123");
    const data = await res.json();

    if (data.url) {
      window.location.href = data.url; // redirigir al login de Meta
    } else {
      console.error("No se recibió URL de Meta", data);
    }
  };

  return (
    <div className="space-y-4">
      {connected === "meta_ok" && (
        <p className="text-sm text-green-500">
          ✅ Cuenta de Meta conectada correctamente.
        </p>
      )}

      <button
        onClick={handleConnectClick}
        className="
          inline-flex items-center justify-center
          rounded-full px-6 py-2.5
          text-sm md:text-base font-medium
          bg-[#1877F2] text-white
          hover:bg-[#166fe5]
          transition-all duration-150
        "
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span className="ml-2">Conectar con Meta (Facebook / Instagram)</span>
      </button>
    </div>
  );
}
