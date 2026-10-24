import Link from "next/link";
import { SinConfigurar } from "@/components/SinConfigurar";
import { getPerfil, puede } from "@/lib/auth";
import { supabaseConfigurado } from "@/lib/supabase/env";
import type { Rol } from "@/lib/types";
import { salir } from "../login/actions";

const SECCIONES: { href: string; nombre: string; roles: Rol[] }[] = [
  { href: "/admin/reuniones", nombre: "Reuniones", roles: ["multimedia", "transmision", "alabanza"] },
  { href: "/admin/canciones", nombre: "Canciones", roles: ["alabanza"] },
  { href: "/admin/anuncios", nombre: "Anuncios", roles: ["anuncios"] },
  { href: "/proyector/control", nombre: "Proyector", roles: ["multimedia", "alabanza", "transmision", "anuncios"] },
  { href: "/admin/usuarios", nombre: "Usuarios y áreas", roles: ["pastor"] },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  if (!supabaseConfigurado) {
    return (
      <main className="mx-auto max-w-xl p-8">
        <SinConfigurar />
      </main>
    );
  }
  const perfil = await getPerfil();

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <aside className="bg-primario p-4 text-white md:w-60">
        <Link href="/admin" className="mb-6 block font-semibold">
          Panel IBB
        </Link>
        <nav className="flex flex-wrap gap-2 text-sm md:flex-col">
          {SECCIONES.filter((s) => puede(perfil, s.roles)).map((s) => (
            <Link key={s.href} href={s.href} className="rounded px-2 py-1 hover:bg-white/10">
              {s.nombre}
            </Link>
          ))}
          <Link href="/" className="rounded px-2 py-1 hover:bg-white/10">
            Ver sitio
          </Link>
        </nav>
        {perfil && (
          <form action={salir} className="mt-6 text-xs text-white/70">
            <p>{perfil.nombre ?? perfil.email}</p>
            <button className="underline">Salir</button>
          </form>
        )}
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
