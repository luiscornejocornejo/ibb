import Link from "next/link";
import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Cancion } from "@/lib/types";
import { FormCancion } from "./FormCancion";

export default async function AdminCanciones() {
  await requireRol(["alabanza"]);
  const supabase = await createClient();
  const { data } = await supabase.from("canciones").select("id, titulo, autor, tono").order("titulo");
  const canciones = (data as Cancion[]) ?? [];

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold">Canciones</h1>
      <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        {canciones.map((c) => (
          <li key={c.id}>
            <Link href={`/admin/canciones/${c.id}`} className="block px-4 py-3 hover:bg-stone-50">
              <span className="font-medium">{c.titulo}</span>
              <span className="text-sm text-stone-500">
                {c.autor && ` · ${c.autor}`}
                {c.tono && ` · ${c.tono}`}
              </span>
            </Link>
          </li>
        ))}
        {canciones.length === 0 && <li className="px-4 py-3 text-stone-500">Sin canciones todavía.</li>}
      </ul>
      <section>
        <h2 className="mb-3 font-semibold">Nueva canción</h2>
        <FormCancion />
      </section>
    </div>
  );
}
