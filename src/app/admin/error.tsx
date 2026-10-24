"use client";

export default function ErrorAdmin({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="tarjeta max-w-lg border-red-300">
      <h1 className="font-semibold text-red-700">No se pudo guardar</h1>
      <p className="mt-2 text-sm">{error.message}</p>
      <button onClick={reset} className="boton-sec mt-4">
        Volver a intentar
      </button>
    </div>
  );
}
