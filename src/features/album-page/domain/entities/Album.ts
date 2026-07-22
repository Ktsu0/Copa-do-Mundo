export interface AlbumProgress {
  collected: number;
  total: number;
  percentage: number;
}

export interface GroupTeam {
  id: string;
  name: string;
  flagUrl: string; // the icon next to the team
}

export interface AlbumGroup {
  id: string;
  name: string;
  teams: GroupTeam[];
}

export interface AlbumOverview {
  progress: AlbumProgress;
  groups: AlbumGroup[];
}
