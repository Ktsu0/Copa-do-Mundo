import { IMatchScheduleRepository } from '../../domain/repositories/IMatchScheduleRepository';
import { GroupSchedule } from '../../domain/entities/GroupSchedule';

export class GetGroupScheduleUseCase {
  constructor(private repository: IMatchScheduleRepository) {}

  async execute(grupo: string): Promise<GroupSchedule | null> {
    return this.repository.getGroupSchedule(grupo);
  }
}
