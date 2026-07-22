import { TimeDetalhe } from '../entities/TimeDetalhe';

export interface ITeamDetailRepository {
  getTeamDetail(id: string): Promise<TimeDetalhe | null>;
}
