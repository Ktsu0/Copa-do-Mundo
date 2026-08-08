export interface PlayerRank {
  id: number;
  name: string;
  points: string;
  position: number;
  avatar: string;
}

export interface RankData {
  topPlayers: PlayerRank[];
  currentUser: PlayerRank;
  otherPlayers: PlayerRank[];
}
