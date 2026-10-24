import type { SupabaseClient } from "@supabase/supabase-js";

export const LIBROS = [
  "Génesis", "Éxodo", "Levítico", "Números", "Deuteronomio", "Josué", "Jueces", "Rut",
  "1 Samuel", "2 Samuel", "1 Reyes", "2 Reyes", "1 Crónicas", "2 Crónicas", "Esdras",
  "Nehemías", "Ester", "Job", "Salmos", "Proverbios", "Eclesiastés", "Cantares", "Isaías",
  "Jeremías", "Lamentaciones", "Ezequiel", "Daniel", "Oseas", "Joel", "Amós", "Abdías",
  "Jonás", "Miqueas", "Nahúm", "Habacuc", "Sofonías", "Hageo", "Zacarías", "Malaquías",
  "Mateo", "Marcos", "Lucas", "Juan", "Hechos", "Romanos", "1 Corintios", "2 Corintios",
  "Gálatas", "Efesios", "Filipenses", "Colosenses", "1 Tesalonicenses", "2 Tesalonicenses",
  "1 Timoteo", "2 Timoteo", "Tito", "Filemón", "Hebreos", "Santiago", "1 Pedro", "2 Pedro",
  "1 Juan", "2 Juan", "3 Juan", "Judas", "Apocalipsis",
];

const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

export function buscarLibro(nombre: string) {
  const n = normalizar(nombre);
  return (
    LIBROS.find((l) => normalizar(l) === n) ??
    LIBROS.find((l) => normalizar(l).startsWith(n)) ??
    null
  );
}

export type Referencia = { libro: string; capitulo: number; desde: number | null; hasta: number | null };

/** Interpreta "Juan 3:16", "jn 3:16-18", "Salmos 23". */
export function parseReferencia(texto: string): Referencia | null {
  const m = texto.trim().match(/^(\d?\s*[^\d:]+?)\s+(\d+)(?::(\d+)(?:\s*-\s*(\d+))?)?$/);
  if (!m) return null;
  const libro = buscarLibro(m[1]);
  if (!libro) return null;
  return {
    libro,
    capitulo: Number(m[2]),
    desde: m[3] ? Number(m[3]) : null,
    hasta: m[4] ? Number(m[4]) : m[3] ? Number(m[3]) : null,
  };
}

export function formatearReferencia(r: { libro: string; capitulo: number; desde: number | null; hasta: number | null }) {
  if (r.desde == null) return `${r.libro} ${r.capitulo}`;
  if (r.hasta == null || r.hasta === r.desde) return `${r.libro} ${r.capitulo}:${r.desde}`;
  return `${r.libro} ${r.capitulo}:${r.desde}-${r.hasta}`;
}

export type Versiculo = { libro: string; capitulo: number; versiculo: number; texto: string };

export async function obtenerPasaje(supabase: SupabaseClient, ref: Referencia): Promise<Versiculo[]> {
  let q = supabase
    .from("biblia")
    .select("libro, capitulo, versiculo, texto")
    .eq("libro", ref.libro)
    .eq("capitulo", ref.capitulo)
    .order("versiculo");
  if (ref.desde != null) q = q.gte("versiculo", ref.desde);
  if (ref.hasta != null) q = q.lte("versiculo", ref.hasta);
  const { data } = await q;
  return (data as Versiculo[]) ?? [];
}

export async function buscarTexto(supabase: SupabaseClient, palabras: string): Promise<Versiculo[]> {
  const { data } = await supabase
    .from("biblia")
    .select("libro, capitulo, versiculo, texto")
    .textSearch("texto", palabras, { config: "spanish", type: "websearch" })
    .order("libro_orden")
    .limit(50);
  return (data as Versiculo[]) ?? [];
}
