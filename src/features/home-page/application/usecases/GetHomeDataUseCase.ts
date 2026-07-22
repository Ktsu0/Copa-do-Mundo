import { IHomeRepository } from '../../domain/repositories/IHomeRepository';
import { HomeData } from '../../domain/entities/HomeData';

export class GetHomeDataUseCase {
  constructor(private repository: IHomeRepository) {}

  async execute(): Promise<HomeData> {
    return this.repository.getHomeData();
  }
}
