import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class RedefinirSenhaUseCase {
  constructor(private repository: IAuthRepository) {}

  async execute(email: string): Promise<void> {
    const emailLimpo = email.trim();
    if (!emailLimpo) {
      throw new Error('Informe seu e-mail.');
    }
    await this.repository.redefinirSenha(emailLimpo);
  }
}
