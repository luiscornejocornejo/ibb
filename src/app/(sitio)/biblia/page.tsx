import { SinConfigurar } from "@/components/SinConfigurar";
import { buscarTexto, formatearReferencia, obtenerPasaje, parseReferencia, type Versiculo } from "@/lib/biblia";
import { supabaseConfigurado } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Biblia · IBB Villa Pueyrredón" };

export default async function Biblia({ searchParams }: PageProps<"/biblia">) {
  if (!supabaseConfigurado) return <SinConfigurar />;
  const { q } = await searchParams;
  const consulta = typeof q === "string" ? q.trim() : "";

  let titulo = "";
  let resultados: Versiculo[] = [];
  if (consulta) {
    const supabase = await createClient();
    const ref = parseReferencia(consulta);
    if (ref) {
      titulo = formatearReferencia(ref);
      resultados = await obtenerPasaje(supabase, ref);
    } else {
      titulo = `Resultados para “${consulta}”`;
      resultados = await buscarTexto(supabase, consulta);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Biblia</h1>
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={consulta}
          placeholder="Ej: Juan 3:16, Salmos 23, o palabras como “amor paciente”"
          className="campo"
        />
        <button className="boton">Buscar</button>
      </form>

      {consulta && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">{titulo}</h2>
          {resultados.length === 0 ? (
            <p className="text-stone-500">No se encontraron versículos.</p>
          ) : (
            <div className="tarjeta space-y-2">
              {resultados.map((v) => (
                <p key={`${v.libro}-${v.capitulo}-${v.versiculo}`}>
                  <span className="mr-2 text-sm font-medium text-primario">
                    {v.libro} {v.capitulo}:{v.versiculo}
                  </span>
                  {v.texto}
                </p>
              ))}
            </div>
          )}
        </section>
      )}

      <p className="text-xs text-stone-500">
        Próximamente: hacé preguntas sobre la Biblia y recibí respuestas con los versículos citados.
      </p>
    </div>
  );
}
