import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { CredenciaisLogin } from '../../domain/entities/Credenciais';

export class LoginUseCase {
  constructor(private repository: IAuthRepository) {}

  async execute(credenciais: CredenciaisLogin): Promise<void> {
    const email = credenciais.email.trim();
    if (!email || !credenciais.senha) {
      throw new Error('Preencha e-mail e senha.');
    }
    await this.repository.entrar({ email, senha: credenciais.senha });
  }
}
