import { useState } from 'react';
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository';
import { LoginUseCase } from '../../application/usecases/LoginUseCase';
import { CadastroUseCase } from '../../application/usecases/CadastroUseCase';
import { RedefinirSenhaUseCase } from '../../application/usecases/RedefinirSenhaUseCase';
import { mensagemErroAuth } from '../../infrastructure/authErrorMessages';
import { DadosCadastro } from '../../domain/entities/Credenciais';

export function useAuth() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, senha: string): Promise<boolean> => {
    setError(null);
    setIsSubmitting(true);
    try {
      const repo = new AuthRepository();
      await new LoginUseCase(repo).execute({ email, senha });
      return true;
    } catch (err) {
      setError(mensagemErroAuth(err));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const cadastrar = async (dados: DadosCadastro): Promise<boolean> => {
    setError(null);
    setIsSubmitting(true);
    try {
      const repo = new AuthRepository();
      await new CadastroUseCase(repo).execute(dados);
      return true;
    } catch (err) {
      setError(mensagemErroAuth(err));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const redefinirSenha = async (email: string): Promise<boolean> => {
    setError(null);
    setIsSubmitting(true);
    try {
      const repo = new AuthRepository();
      await new RedefinirSenhaUseCase(repo).execute(email);
      return true;
    } catch (err) {
      setError(mensagemErroAuth(err));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, error, login, cadastrar, redefinirSenha };
}
