"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireRol } from "@/lib/auth";
import { buscarLibro } from "@/lib/biblia";
import { textoONull } from "@/lib/formato";
import { createClient } from "@/lib/supabase/server";
import type { Rol } from "@/lib/types";

function check(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

async function subirImagen(supabase: SupabaseClient, archivo: FormDataEntryValue | null, carpeta: string) {
  if (!(archivo instanceof File) || archivo.size === 0) return null;
  const ext = archivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const ruta = `${carpeta}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("imagenes").upload(ruta, archivo, { contentType: archivo.type });
  check(error);
  return supabase.storage.from("imagenes").getPublicUrl(ruta).data.publicUrl;
}

// ---------- Reuniones ----------

export async function guardarReunion(formData: FormData) {
  await requireRol(["multimedia", "transmision"]);
  const supabase = await createClient();
  const id = textoONull(formData.get("id"));

  const datos: Record<string, unknown> = {
    fecha: formData.get("fecha"),
    titulo: textoONull(formData.get("titulo")) ?? "Reunión",
    tema: textoONull(formData.get("tema")),
    predicador: textoONull(formData.get("predicador")),
    resumen: textoONull(formData.get("resumen")),
    youtube_url: textoONull(formData.get("youtube_url")),
    publicada: formData.get("publicada") === "on",
  };
  const portada = await subirImagen(supabase, formData.get("portada"), "portadas");
  if (portada) datos.portada_url = portada;

  if (id) {
    check((await supabase.from("reuniones").update(datos).eq("id", id)).error);
  } else {
    const { data, error } = await supabase.from("reuniones").insert(datos).select("id").single();
    check(error);
    redirect(`/admin/reuniones/${data!.id}`);
  }
  revalidatePath("/", "layout");
}

export async function borrarReunion(formData: FormData) {
  await requireRol(["multimedia", "transmision"]);
  const supabase = await createClient();
  check((await supabase.from("reuniones").delete().eq("id", String(formData.get("id")))).error);
  revalidatePath("/", "layout");
  redirect("/admin/reuniones");
}

export async function agregarCancionAReunion(formData: FormData) {
  await requireRol(["alabanza"]);
  const supabase = await createClient();
  const reunionId = String(formData.get("reunion_id"));
  const { count } = await supabase
    .from("reunion_canciones")
    .select("*", { count: "exact", head: true })
    .eq("reunion_id", reunionId);
  check(
    (
      await supabase.from("reunion_canciones").insert({
        reunion_id: reunionId,
        cancion_id: String(formData.get("cancion_id")),
        orden: count ?? 0,
      })
    ).error,
  );
  revalidatePath("/", "layout");
}

export async function quitarCancionDeReunion(formData: FormData) {
  await requireRol(["alabanza"]);
  const supabase = await createClient();
  check((await supabase.from("reunion_canciones").delete().eq("id", String(formData.get("id")))).error);
  revalidatePath("/", "layout");
}

export async function agregarVersiculo(formData: FormData) {
  await requireRol(["multimedia"]);
  const supabase = await createClient();
  const libro = buscarLibro(String(formData.get("libro")));
  if (!libro) throw new Error("No se reconoce el libro de la Biblia.");
  const desde = Number(formData.get("versiculo_desde"));
  const hasta = Number(formData.get("versiculo_hasta")) || null;
  const reunionId = String(formData.get("reunion_id"));
  const { count } = await supabase
    .from("reunion_versiculos")
    .select("*", { count: "exact", head: true })
    .eq("reunion_id", reunionId);
  check(
    (
      await supabase.from("reunion_versiculos").insert({
        reunion_id: reunionId,
        libro,
        capitulo: Number(formData.get("capitulo")),
        versiculo_desde: desde,
        versiculo_hasta: hasta && hasta > desde ? hasta : null,
        orden: count ?? 0,
      })
    ).error,
  );
  revalidatePath("/", "layout");
}

export async function quitarVersiculo(formData: FormData) {
  await requireRol(["multimedia"]);
  const supabase = await createClient();
  check((await supabase.from("reunion_versiculos").delete().eq("id", String(formData.get("id")))).error);
  revalidatePath("/", "layout");
}

// ---------- Canciones ----------

export async function guardarCancion(formData: FormData) {
  await requireRol(["alabanza"]);
  const supabase = await createClient();
  const id = textoONull(formData.get("id"));
  const datos = {
    titulo: textoONull(formData.get("titulo")) ?? "Sin título",
    autor: textoONull(formData.get("autor")),
    tono: textoONull(formData.get("tono")),
    letra: String(formData.get("letra") ?? "").replace(/\r\n/g, "\n"),
    youtube_url: textoONull(formData.get("youtube_url")),
  };
  if (id) check((await supabase.from("canciones").update(datos).eq("id", id)).error);
  else check((await supabase.from("canciones").insert(datos)).error);
  revalidatePath("/", "layout");
  redirect("/admin/canciones");
}

export async function borrarCancion(formData: FormData) {
  await requireRol(["alabanza"]);
  const supabase = await createClient();
  check((await supabase.from("canciones").delete().eq("id", String(formData.get("id")))).error);
  revalidatePath("/", "layout");
  redirect("/admin/canciones");
}

// ---------- Anuncios ----------

export async function guardarAnuncio(formData: FormData) {
  await requireRol(["anuncios"]);
  const supabase = await createClient();
  const datos: Record<string, unknown> = {
    titulo: textoONull(formData.get("titulo")) ?? "Anuncio",
    texto: textoONull(formData.get("texto")),
    desde: textoONull(formData.get("desde")) ?? new Date().toISOString().slice(0, 10),
    hasta: textoONull(formData.get("hasta")),
    activo: true,
  };
  const imagen = await subirImagen(supabase, formData.get("imagen"), "anuncios");
  if (imagen) datos.imagen_url = imagen;
  check((await supabase.from("anuncios").insert(datos)).error);
  revalidatePath("/", "layout");
}

export async function alternarAnuncio(formData: FormData) {
  await requireRol(["anuncios"]);
  const supabase = await createClient();
  check(
    (
      await supabase
        .from("anuncios")
        .update({ activo: formData.get("activo") !== "true" })
        .eq("id", String(formData.get("id")))
    ).error,
  );
  revalidatePath("/", "layout");
}

export async function borrarAnuncio(formData: FormData) {
  await requireRol(["anuncios"]);
  const supabase = await createClient();
  check((await supabase.from("anuncios").delete().eq("id", String(formData.get("id")))).error);
  revalidatePath("/", "layout");
}

// ---------- Usuarios ----------

export async function actualizarRoles(formData: FormData) {
  await requireRol(["pastor"]);
  const supabase = await createClient();
  const roles = formData.getAll("roles").map(String) as Rol[];
  check((await supabase.from("perfiles").update({ roles }).eq("id", String(formData.get("id")))).error);
  revalidatePath("/admin/usuarios");
}
