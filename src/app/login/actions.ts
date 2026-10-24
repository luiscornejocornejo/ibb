"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstadoLogin = { error?: string; mensaje?: string };

export async function autenticar(_estado: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  return formData.get("modo") === "registrarse" ? registrarse(formData) : ingresar(formData);
}

async function ingresar(formData: FormData): Promise<EstadoLogin> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) return { error: "Email o contraseña incorrectos." };

  const next = String(formData.get("next") || "/admin");
  redirect(next.startsWith("/") ? next : "/admin");
}

async function registrarse(formData: FormData): Promise<EstadoLogin> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
    options: { data: { nombre: String(formData.get("nombre") || "") } },
  });
  if (error) return { error: error.message };
  return {
    mensaje: "Cuenta creada. Revisá tu email para confirmarla y pedile al pastor que te asigne un área.",
  };
}

export async function salir() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
