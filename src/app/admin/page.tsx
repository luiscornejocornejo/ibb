import Link from "next/link";
import { requireRol } from "@/lib/auth";
import { ROLES } from "@/lib/types";

export default async function Admin() {
  const perfil = await requireRol();
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Hola, {perfil.nombre ?? perfil.email}</h1>
      <p className="text-stone-600">
        Tus áreas:{" "}
        {perfil.roles.map((r) => ROLES.find((x) => x.valor === r)?.nombre).join(", ")}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/reuniones" className="tarjeta hover:border-primario">
          <p className="font-semibold">Reuniones del domingo</p>
          <p className="text-sm text-stone-600">Portada, YouTube, tema, canciones y versículos.</p>
        </Link>
        <Link href="/proyector/control" className="tarjeta hover:border-primario">
          <p className="font-semibold">Controlar proyector</p>
          <p className="text-sm text-stone-600">Pasar letras y versículos en vivo.</p>
        </Link>
      </div>
    </div>
  );
}
