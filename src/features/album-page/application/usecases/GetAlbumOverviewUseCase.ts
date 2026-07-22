import { AlbumOverview } from '../../domain/entities/Album';
import { AlbumRepository } from '../../infrastructure/repositories/AlbumRepository';

export class GetAlbumOverviewUseCase {
  constructor(private albumRepository: AlbumRepository) {}

  async execute(): Promise<AlbumOverview> {
    return this.albumRepository.getAlbumOverview();
  }
}
