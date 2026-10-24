// Carga el texto bíblico en la tabla `biblia`.
//
// Uso:
//   node --env-file=.env.local scripts/cargar-biblia.mjs <archivo.json> [VERSION]
//
// Formatos aceptados:
//   1) Lista plana: [{ "libro": "Juan", "capitulo": 3, "versiculo": 16, "texto": "..." }, ...]
//   2) Por libros en orden canónico (Génesis → Apocalipsis):
//      [{ "chapters": [["v1", "v2", ...], ...] }, ...]
//
// Necesita SUPABASE_SECRET_KEY (la clave secreta / service_role, nunca la pública).

import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const LIBROS = [
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

const [archivo, version = "RV1909"] = process.argv.slice(2);
if (!archivo) {
  console.error("Falta el archivo JSON. Ver instrucciones al inicio del script.");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SECRET_KEY.");
  process.exit(1);
}

const datos = JSON.parse((await readFile(archivo, "utf8")).replace(/^﻿/, ""));
const filas = [];

if (datos[0]?.chapters) {
  if (datos.length !== 66) throw new Error(`Se esperaban 66 libros y vinieron ${datos.length}.`);
  datos.forEach((libro, i) =>
    libro.chapters.forEach((versiculos, c) =>
      versiculos.forEach((texto, v) =>
        filas.push({ version, libro: LIBROS[i], libro_orden: i + 1, capitulo: c + 1, versiculo: v + 1, texto: texto.trim() }),
      ),
    ),
  );
} else {
  for (const f of datos) {
    const orden = LIBROS.indexOf(f.libro) + 1;
    if (!orden) throw new Error(`Libro desconocido: ${f.libro}. Usá los nombres de la lista LIBROS.`);
    filas.push({ version, libro: f.libro, libro_orden: orden, capitulo: f.capitulo, versiculo: f.versiculo, texto: String(f.texto).trim() });
  }
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
for (let i = 0; i < filas.length; i += 1000) {
  const { error } = await supabase
    .from("biblia")
    .upsert(filas.slice(i, i + 1000), { onConflict: "version,libro,capitulo,versiculo" });
  if (error) throw new Error(error.message);
  process.stdout.write(`\r${Math.min(i + 1000, filas.length)} / ${filas.length} versículos`);
}
console.log("\nListo.");
