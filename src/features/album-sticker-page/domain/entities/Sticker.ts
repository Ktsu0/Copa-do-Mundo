import { AlbumProgress } from '../../../album-page/domain/entities/Album';

export interface StickerTeam {
  id: string;
  name: string;
  flagUrl?: string;
}

export interface Sticker {
  id: string;
  code: string; // e.g., "BRA 01"
  playerName: string;
  // Asset local (require), nao URL -- ver FIGURINHA_FOTOS.
  imageUrl?: number;
  isCollected: boolean;
  type: 'normal' | 'gold' | 'shiny';
}

export interface TeamAlbum {
  globalProgress: AlbumProgress;
  teams: StickerTeam[];
  selectedTeamId: string;
  stickers: Sticker[];
}
