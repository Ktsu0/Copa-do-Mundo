import { AlbumProgress } from '../../../album-page/domain/entities/Album';

export interface StickerTeam {
  id: string;
  name: string;
  flagUrl?: string;
}

export interface Sticker {
  id: string;
  code: string; // e.g., "BRA 2"
  playerName: string;
  imageUrl: string | null;
  isCollected: boolean;
}

export interface TeamAlbum {
  globalProgress: AlbumProgress;
  teams: StickerTeam[];
  selectedTeamId: string;
  stickers: Sticker[];
}
