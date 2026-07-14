import { IProfileRepository } from '../../domain/repositories/IProfileRepository';

export class UpdateProfileNameUseCase {
  constructor(private repository: IProfileRepository) {}

  async execute(nome: string): Promise<void> {
    return this.repository.updateNome(nome);
  }
}
