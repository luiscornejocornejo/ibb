import { notFound } from "next/navigation";
import { YouTube } from "@/components/YouTube";
import { formatearReferencia, obtenerPasaje } from "@/lib/biblia";
import { formatearFecha } from "@/lib/formato";
import { createClient } from "@/lib/supabase/server";
import type { Cancion, Reunion, ReunionVersiculo } from "@/lib/types";

export default async function DetalleReunion({ params }: PageProps<"/reuniones/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: reunion } = await supabase.from("reuniones").select("*").eq("id", id).maybeSingle<Reunion>();
  if (!reunion) notFound();

  const { data: rc } = await supabase
    .from("reunion_canciones")
    .select("orden, canciones(*)")
    .eq("reunion_id", id)
    .order("orden");
  const canciones = ((rc ?? []) as unknown as { canciones: Cancion }[]).map((x) => x.canciones);

  const { data: vs } = await supabase
    .from("reunion_versiculos")
    .select("*")
    .eq("reunion_id", id)
    .order("orden");
  const versiculos = await Promise.all(
    ((vs ?? []) as ReunionVersiculo[]).map(async (v) => {
      const ref = { libro: v.libro, capitulo: v.capitulo, desde: v.versiculo_desde, hasta: v.versiculo_hasta ?? v.versiculo_desde };
      return { ref: formatearReferencia(ref), texto: await obtenerPasaje(supabase, ref) };
    }),
  );

  return (
    <article className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-wide text-acento">{formatearFecha(reunion.fecha)}</p>
        <h1 className="text-3xl font-bold">{reunion.titulo}</h1>
        {reunion.predicador && <p className="text-stone-600">Predica: {reunion.predicador}</p>}
      </header>

      <YouTube url={reunion.youtube_url} titulo={reunion.titulo} />

      {(reunion.tema || reunion.resumen) && (
        <section className="tarjeta">
          <h2 className="mb-2 text-lg font-semibold">De qué se habló</h2>
          {reunion.tema && <p className="font-medium">{reunion.tema}</p>}
          {reunion.resumen && <p className="mt-2 whitespace-pre-line text-stone-700">{reunion.resumen}</p>}
        </section>
      )}

      {versiculos.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Versículos</h2>
          <div className="space-y-3">
            {versiculos.map((v) => (
              <div key={v.ref} className="tarjeta">
                <p className="font-medium">{v.ref}</p>
                {v.texto.map((t) => (
                  <p key={t.versiculo} className="mt-1 text-stone-700">
                    <sup className="mr-1 text-stone-400">{t.versiculo}</sup>
                    {t.texto}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {canciones.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Canciones</h2>
          <div className="space-y-3">
            {canciones.map((c, i) => (
              <details key={c.id} className="tarjeta">
                <summary className="cursor-pointer font-medium">
                  {i + 1}. {c.titulo}
                  {c.autor && <span className="font-normal text-stone-500"> · {c.autor}</span>}
                  {c.tono && <span className="font-normal text-stone-500"> · Tono {c.tono}</span>}
                </summary>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-stone-700">{c.letra}</p>
                {c.youtube_url && (
                  <a href={c.youtube_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-primario underline">
                    Escuchar para practicar
                  </a>
                )}
              </details>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
