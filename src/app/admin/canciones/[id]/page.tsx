import { notFound } from "next/navigation";
import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Cancion } from "@/lib/types";
import { borrarCancion } from "../../actions";
import { FormCancion } from "../FormCancion";

export default async function EditarCancion({ params }: PageProps<"/admin/canciones/[id]">) {
  await requireRol(["alabanza"]);
  const { id } = await params;
  const supabase = await createClient();
  const { data: cancion } = await supabase.from("canciones").select("*").eq("id", id).maybeSingle<Cancion>();
  if (!cancion) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">{cancion.titulo}</h1>
      <FormCancion cancion={cancion} />
      <form action={borrarCancion}>
        <input type="hidden" name="id" value={id} />
        <button className="boton-peligro">Eliminar canción</button>
      </form>
    </div>
  );
}
