export type Rol = "pastor" | "alabanza" | "multimedia" | "transmision" | "anuncios";

export const ROLES: { valor: Rol; nombre: string }[] = [
  { valor: "pastor", nombre: "Pastor (administrador)" },
  { valor: "alabanza", nombre: "Alabanza" },
  { valor: "multimedia", nombre: "Multimedia / Proyector" },
  { valor: "transmision", nombre: "Transmisión" },
  { valor: "anuncios", nombre: "Anuncios" },
];

export type Perfil = {
  id: string;
  nombre: string | null;
  email: string | null;
  roles: Rol[];
};

export type Reunion = {
  id: string;
  fecha: string;
  titulo: string;
  tema: string | null;
  predicador: string | null;
  resumen: string | null;
  youtube_url: string | null;
  portada_url: string | null;
  publicada: boolean;
};

export type Cancion = {
  id: string;
  titulo: string;
  autor: string | null;
  tono: string | null;
  letra: string;
  youtube_url: string | null;
};

export type ReunionVersiculo = {
  id: string;
  reunion_id: string;
  libro: string;
  capitulo: number;
  versiculo_desde: number;
  versiculo_hasta: number | null;
  orden: number;
};

export type Anuncio = {
  id: string;
  titulo: string;
  texto: string | null;
  imagen_url: string | null;
  desde: string;
  hasta: string | null;
  activo: boolean;
};

export type ProyectorEstado = {
  id: number;
  tipo: "vacio" | "cancion" | "versiculo" | "texto";
  titulo: string | null;
  texto: string | null;
  referencia: string | null;
};
