import { AlbumProgress } from '../../../album-page/domain/entities/Album';

export interface StickerTeam {
  id: string;
  name: string;
  flagUrl?: string;
}

export interface Sticker {
  id: string;
  code: string; // e.g., "BRA 2"
  position: string; // e.g., "ATA", "MEI", "DEF", "GOL"
  number: string; // parte numerica do code, ex. "2"
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
