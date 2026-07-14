import { CredenciaisLogin, DadosCadastro } from '../entities/Credenciais';

export interface IAuthRepository {
  entrar(credenciais: CredenciaisLogin): Promise<void>;
  cadastrar(dados: DadosCadastro): Promise<void>;
  sair(): Promise<void>;
  redefinirSenha(email: string): Promise<void>;
}
