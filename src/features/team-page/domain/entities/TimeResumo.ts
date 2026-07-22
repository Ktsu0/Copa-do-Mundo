export interface TimeResumo {
  id: string;
  nome: string;
  grupo: string;
  subtitulo: string; // Ex: "5 TÍTULOS" ou "ATUAL CAMPEÃO"
  bandeiraUrl: string;
  isFavorito?: boolean;
}
