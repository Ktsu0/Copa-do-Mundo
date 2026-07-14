import { IProfileRepository } from '../../domain/repositories/IProfileRepository';

export class DeleteAccountUseCase {
  constructor(private repository: IProfileRepository) {}

  async execute(): Promise<void> {
    return this.repository.deleteAccount();
  }
}
