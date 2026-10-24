import { guardarReunion } from "../actions";
import type { Reunion } from "@/lib/types";

export function FormReunion({ reunion }: { reunion?: Reunion }) {
  return (
    <form action={guardarReunion} className="tarjeta grid gap-4 sm:grid-cols-2">
      {reunion && <input type="hidden" name="id" value={reunion.id} />}
      <div>
        <label className="etiqueta">Fecha</label>
        <input type="date" name="fecha" defaultValue={reunion?.fecha} className="campo" required />
      </div>
      <div>
        <label className="etiqueta">Título</label>
        <input name="titulo" defaultValue={reunion?.titulo ?? "Reunión dominical"} className="campo" required />
      </div>
      <div>
        <label className="etiqueta">Tema / de qué se habló</label>
        <input name="tema" defaultValue={reunion?.tema ?? ""} className="campo" />
      </div>
      <div>
        <label className="etiqueta">Predicador</label>
        <input name="predicador" defaultValue={reunion?.predicador ?? ""} className="campo" />
      </div>
      <div className="sm:col-span-2">
        <label className="etiqueta">URL de YouTube (transmisión)</label>
        <input name="youtube_url" defaultValue={reunion?.youtube_url ?? ""} placeholder="https://youtube.com/live/..." className="campo" />
      </div>
      <div className="sm:col-span-2">
        <label className="etiqueta">Resumen</label>
        <textarea name="resumen" rows={4} defaultValue={reunion?.resumen ?? ""} className="campo" />
      </div>
      <div>
        <label className="etiqueta">Portada (imagen)</label>
        <input type="file" name="portada" accept="image/*" className="text-sm" />
        {reunion?.portada_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={reunion.portada_url} alt="" className="mt-2 h-24 rounded" />
        )}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="publicada" defaultChecked={reunion?.publicada ?? true} />
        Visible para la congregación
      </label>
      <div className="sm:col-span-2">
        <button className="boton">{reunion ? "Guardar cambios" : "Crear reunión"}</button>
      </div>
    </form>
  );
}
