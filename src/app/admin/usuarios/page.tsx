import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROLES, type Perfil } from "@/lib/types";
import { actualizarRoles } from "../actions";

export default async function AdminUsuarios() {
  await requireRol(["pastor"]);
  const supabase = await createClient();
  const { data } = await supabase.from("perfiles").select("id, nombre, email, roles").order("creado_en");
  const perfiles = (data as Perfil[]) ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Usuarios y áreas</h1>
      <p className="text-sm text-stone-600">
        Cada encargado se registra desde “Ingreso equipo” y acá le asignás su área.
      </p>
      {perfiles.map((p) => (
        <form key={p.id} action={actualizarRoles} className="tarjeta space-y-3">
          <input type="hidden" name="id" value={p.id} />
          <p className="font-medium">
            {p.nombre} <span className="text-sm font-normal text-stone-500">{p.email}</span>
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            {ROLES.map((r) => (
              <label key={r.valor} className="flex items-center gap-1">
                <input type="checkbox" name="roles" value={r.valor} defaultChecked={p.roles.includes(r.valor)} />
                {r.nombre}
              </label>
            ))}
          </div>
          <button className="boton-sec">Guardar</button>
        </form>
      ))}
    </div>
  );
}
