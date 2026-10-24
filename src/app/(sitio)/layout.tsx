import Link from "next/link";

export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-primario text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/" className="text-lg font-semibold">
            IBB Villa Pueyrredón
          </Link>
          <nav className="flex gap-5 text-sm">
            <Link href="/">Inicio</Link>
            <Link href="/reuniones">Reuniones</Link>
            <Link href="/biblia">Biblia</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        Iglesia Bautista Villa Pueyrredón ·{" "}
        <Link href="/admin" className="underline">
          Ingreso equipo
        </Link>
      </footer>
    </>
  );
}
