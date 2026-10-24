import Link from "next/link";
import { notFound } from "next/navigation";
import { puede, requireRol } from "@/lib/auth";
import { LIBROS, formatearReferencia } from "@/lib/biblia";
import { createClient } from "@/lib/supabase/server";
import type { Cancion, Reunion, ReunionVersiculo } from "@/lib/types";
import {
  agregarCancionAReunion,
  agregarVersiculo,
  borrarReunion,
  quitarCancionDeReunion,
  quitarVersiculo,
} from "../../actions";
import { FormReunion } from "../FormReunion";

export default async function EditarReunion({ params }: PageProps<"/admin/reuniones/[id]">) {
  const perfil = await requireRol(["multimedia", "transmision", "alabanza"]);
  const { id } = await params;
  const supabase = await createClient();

  const { data: reunion } = await supabase.from("reuniones").select("*").eq("id", id).maybeSingle<Reunion>();
  if (!reunion) notFound();

  const [{ data: rc }, { data: vs }, { data: todas }] = await Promise.all([
    supabase.from("reunion_canciones").select("id, orden, canciones(id, titulo)").eq("reunion_id", id).order("orden"),
    supabase.from("reunion_versiculos").select("*").eq("reunion_id", id).order("orden"),
    supabase.from("canciones").select("id, titulo").order("titulo"),
  ]);
  const canciones = (rc ?? []) as unknown as { id: string; canciones: Pick<Cancion, "id" | "titulo"> }[];
  const versiculos = (vs ?? []) as ReunionVersiculo[];

  const editaDatos = puede(perfil, ["multimedia", "transmision"]);
  const editaCanciones = puede(perfil, ["alabanza"]);
  const editaVersiculos = puede(perfil, ["multimedia"]);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{reunion.titulo}</h1>
        <Link href={`/proyector/control?reunion=${id}`} className="boton-sec">
          Abrir en proyector
        </Link>
      </div>

      {editaDatos && <FormReunion reunion={reunion} />}

      <section className="tarjeta space-y-3">
        <h2 className="font-semibold">Canciones</h2>
        <ol className="space-y-2">
          {canciones.map((c, i) => (
            <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
              <span>
                {i + 1}. {c.canciones.titulo}
              </span>
              {editaCanciones && (
                <form action={quitarCancionDeReunion}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="boton-peligro">Quitar</button>
                </form>
              )}
            </li>
          ))}
          {canciones.length === 0 && <li className="text-sm text-stone-500">Sin canciones.</li>}
        </ol>
        {editaCanciones && (
          <form action={agregarCancionAReunion} className="flex gap-2">
            <input type="hidden" name="reunion_id" value={id} />
            <select name="cancion_id" className="campo" required>
              <option value="">Elegir canción…</option>
              {((todas ?? []) as Pick<Cancion, "id" | "titulo">[]).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titulo}
                </option>
              ))}
            </select>
            <button className="boton">Agregar</button>
          </form>
        )}
      </section>

      <section className="tarjeta space-y-3">
        <h2 className="font-semibold">Versículos</h2>
        <ul className="space-y-2">
          {versiculos.map((v) => (
            <li key={v.id} className="flex items-center justify-between text-sm">
              {formatearReferencia({ libro: v.libro, capitulo: v.capitulo, desde: v.versiculo_desde, hasta: v.versiculo_hasta })}
              {editaVersiculos && (
                <form action={quitarVersiculo}>
                  <input type="hidden" name="id" value={v.id} />
                  <button className="boton-peligro">Quitar</button>
                </form>
              )}
            </li>
          ))}
          {versiculos.length === 0 && <li className="text-sm text-stone-500">Sin versículos.</li>}
        </ul>
        {editaVersiculos && (
          <form action={agregarVersiculo} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <input type="hidden" name="reunion_id" value={id} />
            <select name="libro" className="campo col-span-2" required>
              {LIBROS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <input name="capitulo" type="number" min={1} placeholder="Cap." className="campo" required />
            <input name="versiculo_desde" type="number" min={1} placeholder="Desde" className="campo" required />
            <input name="versiculo_hasta" type="number" min={1} placeholder="Hasta" className="campo" />
            <button className="boton col-span-2 sm:col-span-5">Agregar versículo</button>
          </form>
        )}
      </section>

      {editaDatos && (
        <form action={borrarReunion}>
          <input type="hidden" name="id" value={id} />
          <button className="boton-peligro">Eliminar reunión</button>
        </form>
      )}
    </div>
  );
}
