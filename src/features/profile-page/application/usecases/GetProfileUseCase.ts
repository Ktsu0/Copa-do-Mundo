import { IProfileRepository } from '../../domain/repositories/IProfileRepository';
import { Profile } from '../../domain/entities/Profile';

export class GetProfileUseCase {
  constructor(private repository: IProfileRepository) {}

  async execute(): Promise<Profile | null> {
    return this.repository.getProfile();
  }
}
