import { TimeResumo } from '../../domain/entities/TimeResumo';
import { ITeamRepository } from '../../domain/repositories/ITeamRepository';

export class GetTeamsUseCase {
  constructor(private repository: ITeamRepository) {}

  async execute(): Promise<TimeResumo[]> {
    return this.repository.getTeams();
  }
}
