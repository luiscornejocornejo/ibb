import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Anuncio } from "@/lib/types";
import { alternarAnuncio, borrarAnuncio, guardarAnuncio } from "../actions";

export default async function AdminAnuncios() {
  await requireRol(["anuncios"]);
  const supabase = await createClient();
  const { data } = await supabase.from("anuncios").select("*").order("desde", { ascending: false });
  const anuncios = (data as Anuncio[]) ?? [];

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold">Anuncios</h1>
      <form action={guardarAnuncio} className="tarjeta grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="etiqueta">Título</label>
          <input name="titulo" className="campo" required />
        </div>
        <div className="sm:col-span-2">
          <label className="etiqueta">Texto</label>
          <textarea name="texto" rows={3} className="campo" />
        </div>
        <div>
          <label className="etiqueta">Mostrar desde</label>
          <input type="date" name="desde" className="campo" />
        </div>
        <div>
          <label className="etiqueta">Hasta (opcional)</label>
          <input type="date" name="hasta" className="campo" />
        </div>
        <div>
          <label className="etiqueta">Imagen (opcional)</label>
          <input type="file" name="imagen" accept="image/*" className="text-sm" />
        </div>
        <div className="sm:col-span-2">
          <button className="boton">Publicar anuncio</button>
        </div>
      </form>

      <ul className="space-y-3">
        {anuncios.map((a) => (
          <li key={a.id} className="tarjeta flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">
                {a.titulo} {!a.activo && <span className="text-xs text-amber-700">(pausado)</span>}
              </p>
              <p className="text-xs text-stone-500">
                Desde {a.desde}
                {a.hasta && ` hasta ${a.hasta}`}
              </p>
            </div>
            <div className="flex gap-2">
              <form action={alternarAnuncio}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="activo" value={String(a.activo)} />
                <button className="boton-sec">{a.activo ? "Pausar" : "Activar"}</button>
              </form>
              <form action={borrarAnuncio}>
                <input type="hidden" name="id" value={a.id} />
                <button className="boton-peligro">Borrar</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
