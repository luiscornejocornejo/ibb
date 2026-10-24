-- =====================================================================
-- IBB Villa Pueyrredón — esquema inicial
-- Pegar completo en Supabase > SQL Editor > Run
-- =====================================================================

-- ---------- Roles y perfiles ----------------------------------------

create type public.rol as enum ('pastor', 'alabanza', 'multimedia', 'transmision', 'anuncios');

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  email text,
  -- Un usuario puede tener varios roles. Sin roles = sin acceso al panel.
  roles public.rol[] not null default '{}',
  creado_en timestamptz not null default now()
);

-- Al registrarse un usuario se crea su perfil (sin roles).
create function public.crear_perfil()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, email, nombre)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'nombre', new.email));
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- ¿El usuario actual tiene alguno de estos roles? (el pastor siempre puede)
create function public.tiene_rol(requeridos public.rol[])
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.perfiles p
    where p.id = auth.uid()
      and (p.roles && requeridos or 'pastor' = any (p.roles))
  );
$$;

create function public.es_staff()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and cardinality(p.roles) > 0
  );
$$;

-- ---------- Contenido -----------------------------------------------

create table public.reuniones (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  titulo text not null,
  tema text,                 -- de qué se habló
  predicador text,
  resumen text,
  youtube_url text,
  portada_url text,
  publicada boolean not null default true,
  creado_en timestamptz not null default now()
);
create index reuniones_fecha_idx on public.reuniones (fecha desc);

create table public.canciones (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  autor text,
  tono text,
  -- Estrofas separadas por una línea en blanco
  letra text not null default '',
  youtube_url text,          -- referencia para practicar
  creado_en timestamptz not null default now()
);

create table public.reunion_canciones (
  id uuid primary key default gen_random_uuid(),
  reunion_id uuid not null references public.reuniones (id) on delete cascade,
  cancion_id uuid not null references public.canciones (id) on delete cascade,
  orden int not null default 0
);
create index reunion_canciones_reunion_idx on public.reunion_canciones (reunion_id, orden);

create table public.reunion_versiculos (
  id uuid primary key default gen_random_uuid(),
  reunion_id uuid not null references public.reuniones (id) on delete cascade,
  libro text not null,
  capitulo int not null,
  versiculo_desde int not null,
  versiculo_hasta int,
  orden int not null default 0
);
create index reunion_versiculos_reunion_idx on public.reunion_versiculos (reunion_id, orden);

create table public.anuncios (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  texto text,
  imagen_url text,
  desde date not null default current_date,
  hasta date,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

-- Texto bíblico. Se carga con un script (ver README).
create table public.biblia (
  id bigint generated always as identity primary key,
  version text not null default 'RV1909',
  libro text not null,
  libro_orden int not null,
  capitulo int not null,
  versiculo int not null,
  texto text not null,
  unique (version, libro, capitulo, versiculo)
);
create index biblia_ref_idx on public.biblia (libro, capitulo, versiculo);
create index biblia_texto_idx on public.biblia using gin (to_tsvector('spanish', texto));

-- Lo que se está mostrando ahora en el proyector (una sola fila).
create table public.proyector_estado (
  id int primary key default 1 check (id = 1),
  tipo text not null default 'vacio' check (tipo in ('vacio', 'cancion', 'versiculo', 'texto')),
  titulo text,
  texto text,
  referencia text,
  actualizado_en timestamptz not null default now()
);
insert into public.proyector_estado (id) values (1);

-- ---------- Seguridad (RLS) -----------------------------------------

alter table public.perfiles enable row level security;
alter table public.reuniones enable row level security;
alter table public.canciones enable row level security;
alter table public.reunion_canciones enable row level security;
alter table public.reunion_versiculos enable row level security;
alter table public.anuncios enable row level security;
alter table public.biblia enable row level security;
alter table public.proyector_estado enable row level security;

-- Perfiles: cada uno ve el suyo; el pastor ve y edita todos.
create policy "ver perfil propio o pastor" on public.perfiles
  for select using (id = auth.uid() or public.tiene_rol('{pastor}'));
create policy "pastor edita perfiles" on public.perfiles
  for update using (public.tiene_rol('{pastor}'));

-- Reuniones: público ve las publicadas; staff ve todas.
create policy "leer reuniones" on public.reuniones
  for select using (publicada or public.es_staff());
create policy "editar reuniones" on public.reuniones
  for all using (public.tiene_rol('{multimedia,transmision}'))
  with check (public.tiene_rol('{multimedia,transmision}'));

-- Canciones
create policy "leer canciones" on public.canciones for select using (true);
create policy "editar canciones" on public.canciones
  for all using (public.tiene_rol('{alabanza}'))
  with check (public.tiene_rol('{alabanza}'));

create policy "leer reunion_canciones" on public.reunion_canciones for select using (true);
create policy "editar reunion_canciones" on public.reunion_canciones
  for all using (public.tiene_rol('{alabanza}'))
  with check (public.tiene_rol('{alabanza}'));

-- Versículos de la reunión
create policy "leer reunion_versiculos" on public.reunion_versiculos for select using (true);
create policy "editar reunion_versiculos" on public.reunion_versiculos
  for all using (public.tiene_rol('{multimedia}'))
  with check (public.tiene_rol('{multimedia}'));

-- Anuncios: público ve los vigentes.
create policy "leer anuncios" on public.anuncios
  for select using (
    public.es_staff()
    or (activo and desde <= current_date and (hasta is null or hasta >= current_date))
  );
create policy "editar anuncios" on public.anuncios
  for all using (public.tiene_rol('{anuncios}'))
  with check (public.tiene_rol('{anuncios}'));

-- Biblia: lectura pública. Se carga con la service role key (salta RLS).
create policy "leer biblia" on public.biblia for select using (true);

-- Proyector: todos leen, cualquier staff lo controla.
create policy "leer proyector" on public.proyector_estado for select using (true);
create policy "controlar proyector" on public.proyector_estado
  for update using (public.es_staff()) with check (public.es_staff());

-- Tiempo real para el proyector
alter publication supabase_realtime add table public.proyector_estado;

-- ---------- Archivos (portadas e imágenes de anuncios) --------------

insert into storage.buckets (id, name, public)
values ('imagenes', 'imagenes', true)
on conflict (id) do nothing;

create policy "staff sube imagenes" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'imagenes' and public.es_staff());
create policy "staff borra imagenes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'imagenes' and public.es_staff());
