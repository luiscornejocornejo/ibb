export function SinConfigurar() {
  return (
    <div className="tarjeta border-amber-300 bg-amber-50 text-sm">
      <p className="font-semibold">Falta conectar la base de datos.</p>
      <p className="mt-1">
        Configurá <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>{" "}
        (ver README).
      </p>
    </div>
  );
}
