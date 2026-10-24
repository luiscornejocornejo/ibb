import { guardarCancion } from "../actions";
import type { Cancion } from "@/lib/types";

export function FormCancion({ cancion }: { cancion?: Cancion }) {
  return (
    <form action={guardarCancion} className="tarjeta grid gap-4 sm:grid-cols-3">
      {cancion && <input type="hidden" name="id" value={cancion.id} />}
      <div className="sm:col-span-2">
        <label className="etiqueta">Título</label>
        <input name="titulo" defaultValue={cancion?.titulo} className="campo" required />
      </div>
      <div>
        <label className="etiqueta">Tono</label>
        <input name="tono" defaultValue={cancion?.tono ?? ""} className="campo" />
      </div>
      <div>
        <label className="etiqueta">Autor</label>
        <input name="autor" defaultValue={cancion?.autor ?? ""} className="campo" />
      </div>
      <div className="sm:col-span-2">
        <label className="etiqueta">YouTube para practicar</label>
        <input name="youtube_url" defaultValue={cancion?.youtube_url ?? ""} className="campo" />
      </div>
      <div className="sm:col-span-3">
        <label className="etiqueta">Letra (separá las estrofas con una línea en blanco)</label>
        <textarea name="letra" rows={14} defaultValue={cancion?.letra} className="campo font-mono" />
      </div>
      <div>
        <button className="boton">{cancion ? "Guardar cambios" : "Crear canción"}</button>
      </div>
    </form>
  );
}
