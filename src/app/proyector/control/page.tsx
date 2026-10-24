import Link from "next/link";
import { requireRol } from "@/lib/auth";
import { formatearReferencia, obtenerPasaje } from "@/lib/biblia";
import { estrofas, formatearFecha } from "@/lib/formato";
import { createClient } from "@/lib/supabase/server";
import type { Cancion, Reunion, ReunionVersiculo } from "@/lib/types";
import { Control, type Diapositiva } from "./Control";

export const metadata = { title: "Control del proyector" };

export default async function ControlProyector({ searchParams }: PageProps<"/proyector/control">) {
  await requireRol();
  const { reunion: reunionParam } = await searchParams;
  const supabase = await createClient();

  const { data: lista } = await supabase
    .from("reuniones")
    .select("id, fecha, titulo")
    .order("fecha", { ascending: false })
    .limit(15);
  const reuniones = (lista ?? []) as Pick<Reunion, "id" | "fecha" | "titulo">[];

  // Por defecto: la reunión de hoy o la más próxima ya cargada
  const hoy = new Date().toISOString().slice(0, 10);
  const id =
    (typeof reunionParam === "string" && reunionParam) ||
    [...reuniones].reverse().find((r) => r.fecha >= hoy)?.id ||
    reuniones[0]?.id;

  const diapositivas: Diapositiva[] = [];
  if (id) {
    const [{ data: rc }, { data: vs }] = await Promise.all([
      supabase.from("reunion_canciones").select("orden, canciones(*)").eq("reunion_id", id).order("orden"),
      supabase.from("reunion_versiculos").select("*").eq("reunion_id", id).order("orden"),
    ]);

    for (const { canciones: c } of (rc ?? []) as unknown as { canciones: Cancion }[]) {
      estrofas(c.letra).forEach((e, i) =>
        diapositivas.push({ grupo: c.titulo, etiqueta: `Estrofa ${i + 1}`, tipo: "cancion", titulo: c.titulo, texto: e, referencia: null }),
      );
    }
    for (const v of (vs ?? []) as ReunionVersiculo[]) {
      const ref = { libro: v.libro, capitulo: v.capitulo, desde: v.versiculo_desde, hasta: v.versiculo_hasta ?? v.versiculo_desde };
      const grupo = formatearReferencia(ref);
      const pasaje = await obtenerPasaje(supabase, ref);
      if (pasaje.length === 0) {
        diapositivas.push({ grupo, etiqueta: grupo, tipo: "versiculo", titulo: grupo, texto: "(cargá la Biblia en la base de datos)", referencia: grupo });
      }
      for (const p of pasaje) {
        const r = `${p.libro} ${p.capitulo}:${p.versiculo}`;
        diapositivas.push({ grupo, etiqueta: `v. ${p.versiculo}`, tipo: "versiculo", titulo: grupo, texto: p.texto, referencia: r });
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Control del proyector</h1>
        <div className="flex gap-2">
          <a href="/proyector" target="_blank" className="boton-sec">
            Abrir pantalla del proyector ↗
          </a>
          <Link href="/admin" className="boton-sec">
            Panel
          </Link>
        </div>
      </div>
      <form className="flex gap-2">
        <select name="reunion" defaultValue={id} className="campo max-w-md">
          {reuniones.map((r) => (
            <option key={r.id} value={r.id}>
              {formatearFecha(r.fecha)} — {r.titulo}
            </option>
          ))}
        </select>
        <button className="boton-sec">Cambiar</button>
      </form>
      <Control diapositivas={diapositivas} />
    </div>
  );
}
