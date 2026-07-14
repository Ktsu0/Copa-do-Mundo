import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { DadosCadastro } from '../../domain/entities/Credenciais';

const DATA_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;

export class CadastroUseCase {
  constructor(private repository: IAuthRepository) {}

  async execute(dados: DadosCadastro): Promise<void> {
    if (!dados.nome.trim()) {
      throw new Error('Informe seu nome completo.');
    }
    if (!dados.email.trim()) {
      throw new Error('Informe seu e-mail.');
    }
    if (dados.senha.length < 6) {
      throw new Error('A senha precisa ter pelo menos 6 caracteres.');
    }
    if (!DATA_REGEX.test(dados.dataNascimento)) {
      throw new Error('Informe a data de nascimento no formato DD/MM/AAAA.');
    }
    await this.repository.cadastrar({ ...dados, nome: dados.nome.trim(), email: dados.email.trim() });
  }
}
