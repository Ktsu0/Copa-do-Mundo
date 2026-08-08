export interface TimeResumo {
  id: string;
  nome: string;
  grupo: string;
  subtitulo: string; // Ex: "5 Títulos Mundiais" ou "ATUAL CAMPEÃO"
  bandeiraUrl: string;
  isFavorito?: boolean;
}
