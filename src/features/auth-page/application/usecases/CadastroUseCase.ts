import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { DadosCadastro } from '../../domain/entities/Credenciais';

const DATA_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;

// A regex so garante o formato (dois digitos/dois digitos/quatro digitos) --
// nao pega datas invalidas tipo "31/02/2000", que o `Date` do JS rolaria
// silenciosamente para 02/03/2000. Aqui confere se o dia/mes/ano batem
// depois de ida e volta pelo Date.
function isDataDeCalendarioValida(dataNascimento: string): boolean {
  const [diaStr, mesStr, anoStr] = dataNascimento.split('/');
  const dia = Number(diaStr);
  const mes = Number(mesStr);
  const ano = Number(anoStr);
  const data = new Date(ano, mes - 1, dia);
  return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
}

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
    if (!DATA_REGEX.test(dados.dataNascimento) || !isDataDeCalendarioValida(dados.dataNascimento)) {
      throw new Error('Informe a data de nascimento no formato DD/MM/AAAA.');
    }
    await this.repository.cadastrar({ ...dados, nome: dados.nome.trim(), email: dados.email.trim() });
  }
}
