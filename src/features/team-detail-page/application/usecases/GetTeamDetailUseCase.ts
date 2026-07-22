import { TimeDetalhe } from '../../domain/entities/TimeDetalhe';
import { ITeamDetailRepository } from '../../domain/repositories/ITeamDetailRepository';

export class GetTeamDetailUseCase {
  constructor(private repository: ITeamDetailRepository) {}

  async execute(id: string): Promise<TimeDetalhe | null> {
    return this.repository.getTeamDetail(id);
  }
}
