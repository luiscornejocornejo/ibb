import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Perfil, Rol } from "@/lib/types";

export async function getPerfil(): Promise<Perfil | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("id, nombre, email, roles")
    .eq("id", userId)
    .single();
  return (perfil as Perfil) ?? null;
}

export function puede(perfil: Perfil | null, roles: Rol[]) {
  if (!perfil) return false;
  return perfil.roles.includes("pastor") || perfil.roles.some((r) => roles.includes(r));
}

/** Corta la request si el usuario no tiene ninguno de los roles (el pastor siempre pasa). */
export async function requireRol(roles: Rol[] = []) {
  const perfil = await getPerfil();
  if (!perfil) redirect("/login");
  const ok = roles.length === 0 ? perfil.roles.length > 0 : puede(perfil, roles);
  if (!ok) redirect("/admin/sin-acceso");
  return perfil;
}
