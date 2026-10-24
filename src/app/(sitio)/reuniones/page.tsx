import Link from "next/link";
import { SinConfigurar } from "@/components/SinConfigurar";
import { formatearFecha } from "@/lib/formato";
import { supabaseConfigurado } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Reunion } from "@/lib/types";

export const metadata = { title: "Reuniones · IBB Villa Pueyrredón" };

export default async function Reuniones() {
  if (!supabaseConfigurado) return <SinConfigurar />;
  const supabase = await createClient();
  const { data } = await supabase
    .from("reuniones")
    .select("*")
    .eq("publicada", true)
    .order("fecha", { ascending: false });
  const reuniones = (data as Reunion[]) ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Reuniones</h1>
      <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        {reuniones.map((r) => (
          <li key={r.id}>
            <Link href={`/reuniones/${r.id}`} className="block px-5 py-4 hover:bg-stone-50">
              <p className="text-xs uppercase text-stone-500">{formatearFecha(r.fecha)}</p>
              <p className="font-medium">{r.titulo}</p>
              {r.tema && <p className="text-sm text-stone-600">{r.tema}</p>}
            </Link>
          </li>
        ))}
        {reuniones.length === 0 && <li className="px-5 py-4 text-stone-500">Sin reuniones todavía.</li>}
      </ul>
    </div>
  );
}
