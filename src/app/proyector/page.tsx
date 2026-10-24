import { SinConfigurar } from "@/components/SinConfigurar";
import { supabaseConfigurado } from "@/lib/supabase/env";
import { Pantalla } from "./Pantalla";

export const metadata = { title: "Proyector" };

export default function Proyector() {
  return supabaseConfigurado ? <Pantalla /> : <SinConfigurar />;
}
