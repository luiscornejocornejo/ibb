import Link from "next/link";
import { SinConfigurar } from "@/components/SinConfigurar";
import { YouTube } from "@/components/YouTube";
import { formatearFecha } from "@/lib/formato";
import { supabaseConfigurado } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Anuncio, Reunion } from "@/lib/types";

export default async function Inicio() {
  if (!supabaseConfigurado) return <SinConfigurar />;

  const supabase = await createClient();
  const hoy = new Date().toISOString().slice(0, 10);

  // Próxima reunión (o la de hoy); si no hay, la última.
  const { data: proxima } = await supabase
    .from("reuniones")
    .select("*")
    .eq("publicada", true)
    .gte("fecha", hoy)
    .order("fecha")
    .limit(1)
    .maybeSingle();
  const { data: ultima } = proxima
    ? { data: null }
    : await supabase
        .from("reuniones")
        .select("*")
        .eq("publicada", true)
        .order("fecha", { ascending: false })
        .limit(1)
        .maybeSingle();
  const reunion = (proxima ?? ultima) as Reunion | null;

  const { data: anuncios } = await supabase
    .from("anuncios")
    .select("*")
    .order("desde", { ascending: false });

  return (
    <div className="space-y-10">
      {reunion ? (
        <section className="space-y-4">
          <p className="text-sm uppercase tracking-wide text-acento">
            {proxima ? "Próxima reunión" : "Última reunión"} · {formatearFecha(reunion.fecha)}
          </p>
          <h1 className="text-3xl font-bold">{reunion.titulo}</h1>
          {reunion.tema && <p className="text-lg text-stone-600">{reunion.tema}</p>}
          {reunion.youtube_url ? (
            <YouTube url={reunion.youtube_url} titulo={reunion.titulo} />
          ) : reunion.portada_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={reunion.portada_url} alt={reunion.titulo} className="w-full rounded-lg" />
          ) : null}
          <Link href={`/reuniones/${reunion.id}`} className="boton">
            Ver canciones y versículos
          </Link>
        </section>
      ) : (
        <p className="text-stone-500">Todavía no hay reuniones cargadas.</p>
      )}

      {(anuncios as Anuncio[] | null)?.length ? (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Anuncios</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(anuncios as Anuncio[]).map((a) => (
              <article key={a.id} className="tarjeta">
                {a.imagen_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.imagen_url} alt="" className="mb-3 w-full rounded" />
                )}
                <h3 className="font-semibold">{a.titulo}</h3>
                {a.texto && <p className="mt-1 whitespace-pre-line text-sm text-stone-600">{a.texto}</p>}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
