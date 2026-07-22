import { GroupSchedule } from '../entities/GroupSchedule';

export interface IMatchScheduleRepository {
  getGroupSchedule(grupo: string): Promise<GroupSchedule | null>;
}
