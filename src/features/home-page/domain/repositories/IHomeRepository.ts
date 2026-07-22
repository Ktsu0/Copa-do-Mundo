import { HomeData } from '../entities/HomeData';

export interface IHomeRepository {
  getHomeData(): Promise<HomeData>;
}
