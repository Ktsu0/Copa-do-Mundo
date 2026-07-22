import { TimeResumo } from '../entities/TimeResumo';

export interface ITeamRepository {
  getTeams(): Promise<TimeResumo[]>;
}
