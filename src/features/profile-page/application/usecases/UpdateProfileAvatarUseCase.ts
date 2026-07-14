import { IProfileRepository } from '../../domain/repositories/IProfileRepository';

export class UpdateProfileAvatarUseCase {
  constructor(private repository: IProfileRepository) {}

  async execute(avatarUrl: string): Promise<void> {
    return this.repository.updateAvatar(avatarUrl);
  }
}
