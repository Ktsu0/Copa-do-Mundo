export interface PlayerRank {
  id: number;
  name: string;
  points: string;
  position: number;
  avatar: string;
  color?: string; // Hex color for podium
}

export interface RankData {
  topPlayers: PlayerRank[];
  currentUser: PlayerRank;
  otherPlayers: PlayerRank[];
}
