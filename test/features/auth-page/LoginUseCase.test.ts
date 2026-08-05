// Testa validações e fluxo de login do LoginUseCase (e-mail/senha vazios, trim de e-mail).
import { LoginUseCase } from '@/features/auth-page/application/usecases/LoginUseCase';
import { IAuthRepository } from '@/features/auth-page/domain/repositories/IAuthRepository';

function makeRepository(overrides: Partial<IAuthRepository> = {}): jest.Mocked<IAuthRepository> {
  return {
    entrar: jest.fn().mockResolvedValue(undefined),
    cadastrar: jest.fn(),
    sair: jest.fn(),
    redefinirSenha: jest.fn(),
    ...overrides,
  } as jest.Mocked<IAuthRepository>;
}

describe('LoginUseCase', () => {
  it('rejeita quando e-mail está vazio', async () => {
    const repository = makeRepository();
    const useCase = new LoginUseCase(repository);

    await expect(useCase.execute({ email: '   ', senha: '123456' })).rejects.toThrow(
      'Preencha e-mail e senha.'
    );
    expect(repository.entrar).not.toHaveBeenCalled();
  });

  it('rejeita quando senha está vazia', async () => {
    const useCase = new LoginUseCase(makeRepository());

    await expect(useCase.execute({ email: 'a@b.com', senha: '' })).rejects.toThrow(
      'Preencha e-mail e senha.'
    );
  });

  it('faz login com e-mail sem espaços nas pontas', async () => {
    const repository = makeRepository();
    const useCase = new LoginUseCase(repository);

    await useCase.execute({ email: '  a@b.com  ', senha: '123456' });

    expect(repository.entrar).toHaveBeenCalledWith({ email: 'a@b.com', senha: '123456' });
  });
});
