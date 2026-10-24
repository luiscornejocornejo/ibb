import Link from "next/link";
import { requireRol } from "@/lib/auth";
import { formatearFecha } from "@/lib/formato";
import { createClient } from "@/lib/supabase/server";
import type { Reunion } from "@/lib/types";
import { FormReunion } from "./FormReunion";

export default async function AdminReuniones() {
  await requireRol(["multimedia", "transmision", "alabanza"]);
  const supabase = await createClient();
  const { data } = await supabase.from("reuniones").select("*").order("fecha", { ascending: false });
  const reuniones = (data as Reunion[]) ?? [];

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold">Reuniones</h1>
      <section>
        <h2 className="mb-3 font-semibold">Nueva reunión</h2>
        <FormReunion />
      </section>
      <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        {reuniones.map((r) => (
          <li key={r.id}>
            <Link href={`/admin/reuniones/${r.id}`} className="flex justify-between px-4 py-3 hover:bg-stone-50">
              <span>
                <span className="font-medium">{r.titulo}</span>
                <span className="block text-xs text-stone-500">{formatearFecha(r.fecha)}</span>
              </span>
              {!r.publicada && <span className="text-xs text-amber-700">Oculta</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
