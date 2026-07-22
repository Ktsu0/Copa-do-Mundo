import { TeamAlbum } from '../../domain/entities/Sticker';
import { StickerRepository } from '../../infrastructure/repositories/StickerRepository';

export class GetTeamAlbumUseCase {
  constructor(private repo: StickerRepository) {}

  async execute(teamId?: string): Promise<TeamAlbum> {
    return this.repo.getTeamAlbum(teamId);
  }
}
