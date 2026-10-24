import { redirect } from "next/navigation";
import { getPerfil } from "@/lib/auth";

export default async function SinAcceso() {
  const perfil = await getPerfil();
  if (perfil && perfil.roles.length > 0) redirect("/admin");

  return (
    <div className="tarjeta max-w-lg">
      <h1 className="text-lg font-semibold">Todavía no tenés un área asignada</h1>
      <p className="mt-2 text-sm text-stone-600">
        Pedile al pastor que te asigne un área en “Usuarios y áreas”.
      </p>
    </div>
  );
}
