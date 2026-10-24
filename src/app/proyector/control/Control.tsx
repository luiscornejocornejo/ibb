"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { obtenerPasaje, parseReferencia, formatearReferencia } from "@/lib/biblia";
import { createClient } from "@/lib/supabase/client";
import type { ProyectorEstado } from "@/lib/types";

export type Diapositiva = {
  grupo: string;
  etiqueta: string;
  tipo: ProyectorEstado["tipo"];
  titulo: string | null;
  texto: string;
  referencia: string | null;
};

export function Control({ diapositivas }: { diapositivas: Diapositiva[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [actual, setActual] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [extra, setExtra] = useState<Diapositiva[]>([]);

  const todas = useMemo(() => [...diapositivas, ...extra], [diapositivas, extra]);

  const mostrar = useCallback(
    async (d: Diapositiva | null, indice: number | null) => {
      const { error } = await supabase
        .from("proyector_estado")
        .update({
          tipo: d?.tipo ?? "vacio",
          titulo: d?.titulo ?? null,
          texto: d?.texto ?? null,
          referencia: d?.referencia ?? null,
          actualizado_en: new Date().toISOString(),
        })
        .eq("id", 1);
      setError(error?.message ?? null);
      if (!error) setActual(indice);
    },
    [supabase],
  );

  // Flechas del teclado: siguiente / anterior. Escape: pantalla negra.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "Escape") mostrar(null, null);
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        const i = actual == null ? 0 : Math.min(actual + 1, todas.length - 1);
        if (todas[i]) mostrar(todas[i], i);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const i = actual == null ? 0 : Math.max(actual - 1, 0);
        if (todas[i]) mostrar(todas[i], i);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [actual, todas, mostrar]);

  const buscarVersiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    const ref = parseReferencia(busqueda);
    if (!ref) return setError("No entendí la referencia. Probá con “Juan 3:16”.");
    const pasaje = await obtenerPasaje(supabase, ref);
    if (pasaje.length === 0) return setError("No se encontró ese pasaje.");
    const grupo = formatearReferencia(ref);
    setExtra((prev) => [
      ...prev,
      ...pasaje.map((p) => ({
        grupo: `${grupo} (agregado)`,
        etiqueta: `v. ${p.versiculo}`,
        tipo: "versiculo" as const,
        titulo: grupo,
        texto: p.texto,
        referencia: `${p.libro} ${p.capitulo}:${p.versiculo}`,
      })),
    ]);
    setBusqueda("");
    setError(null);
  };

  const grupos = todas.reduce<Record<string, number[]>>((acc, d, i) => {
    (acc[d.grupo] ??= []).push(i);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => mostrar(null, null)} className="boton bg-black">
          Pantalla negra (Esc)
        </button>
        <form onSubmit={buscarVersiculo} className="flex flex-1 gap-2">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Versículo en el momento: Romanos 8:28"
            className="campo"
          />
          <button className="boton-sec">Agregar</button>
        </form>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-stone-500">Usá ← → o la barra espaciadora para pasar.</p>

      {todas.length === 0 && <p className="text-stone-500">Esta reunión no tiene canciones ni versículos cargados.</p>}

      {Object.entries(grupos).map(([grupo, indices]) => (
        <section key={grupo}>
          <h2 className="mb-2 font-semibold">{grupo}</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {indices.map((i) => (
              <button
                key={i}
                onClick={() => mostrar(todas[i], i)}
                className={`rounded-md border p-3 text-left text-sm transition ${
                  actual === i ? "border-primario bg-primario text-white" : "border-stone-200 bg-white hover:border-primario"
                }`}
              >
                <span className="mb-1 block text-xs opacity-70">{todas[i].etiqueta}</span>
                <span className="line-clamp-4 whitespace-pre-line">{todas[i].texto}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
