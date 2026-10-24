"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProyectorEstado } from "@/lib/types";

export function Pantalla() {
  const [estado, setEstado] = useState<ProyectorEstado | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("proyector_estado")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data }) => setEstado(data as ProyectorEstado));

    const canal = supabase
      .channel("proyector")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "proyector_estado" },
        (payload) => setEstado(payload.new as ProyectorEstado),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const pantallaCompleta = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  };

  const vacio = !estado || estado.tipo === "vacio" || !estado.texto;

  return (
    <div
      onDoubleClick={pantallaCompleta}
      className="flex min-h-screen cursor-none flex-col items-center justify-center bg-black p-[5vw] text-center text-white"
    >
      {!vacio && (
        <>
          <p
            className={`whitespace-pre-line font-semibold leading-snug ${
              estado.tipo === "versiculo" ? "text-[4.2vw]" : "text-[5vw]"
            }`}
          >
            {estado.texto}
          </p>
          {estado.referencia && <p className="mt-[3vw] text-[2.6vw] text-amber-300">{estado.referencia}</p>}
        </>
      )}
    </div>
  );
}
