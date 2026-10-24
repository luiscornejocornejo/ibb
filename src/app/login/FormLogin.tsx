"use client";

import { useActionState, useState } from "react";
import { autenticar, type EstadoLogin } from "./actions";

export function FormLogin({ next }: { next: string }) {
  const [modo, setModo] = useState<"ingresar" | "registrarse">("ingresar");
  const [estado, accion, pendiente] = useActionState<EstadoLogin, FormData>(autenticar, {});

  return (
    <form action={accion} className="tarjeta space-y-4">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="modo" value={modo} />
      {modo === "registrarse" && (
        <div>
          <label className="etiqueta">Nombre</label>
          <input name="nombre" className="campo" required />
        </div>
      )}
      <div>
        <label className="etiqueta">Email</label>
        <input name="email" type="email" className="campo" required />
      </div>
      <div>
        <label className="etiqueta">Contraseña</label>
        <input name="password" type="password" minLength={6} className="campo" required />
      </div>
      {estado.error && <p className="text-sm text-red-600">{estado.error}</p>}
      {estado.mensaje && <p className="text-sm text-green-700">{estado.mensaje}</p>}
      <button className="boton w-full" disabled={pendiente}>
        {modo === "ingresar" ? "Ingresar" : "Crear cuenta"}
      </button>
      <button
        type="button"
        onClick={() => setModo(modo === "ingresar" ? "registrarse" : "ingresar")}
        className="w-full text-center text-sm text-stone-600 underline"
      >
        {modo === "ingresar" ? "¿No tenés cuenta? Registrate" : "Ya tengo cuenta"}
      </button>
    </form>
  );
}
