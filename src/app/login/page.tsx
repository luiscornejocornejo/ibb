import { SinConfigurar } from "@/components/SinConfigurar";
import { supabaseConfigurado } from "@/lib/supabase/env";
import { FormLogin } from "./FormLogin";

export const metadata = { title: "Ingreso equipo · IBB Villa Pueyrredón" };

export default async function Login({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-4 py-16">
      <h1 className="mb-6 text-center text-2xl font-bold">Ingreso del equipo</h1>
      {supabaseConfigurado ? <FormLogin next={typeof next === "string" ? next : "/admin"} /> : <SinConfigurar />}
    </main>
  );
}
