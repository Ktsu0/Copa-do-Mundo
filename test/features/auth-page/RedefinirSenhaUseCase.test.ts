// Testa validação de e-mail e envio da redefinição de senha pelo RedefinirSenhaUseCase.
import { RedefinirSenhaUseCase } from '@/features/auth-page/application/usecases/RedefinirSenhaUseCase';
import { IAuthRepository } from '@/features/auth-page/domain/repositories/IAuthRepository';

function makeRepository(overrides: Partial<IAuthRepository> = {}): jest.Mocked<IAuthRepository> {
  return {
    entrar: jest.fn(),
    cadastrar: jest.fn(),
    sair: jest.fn(),
    redefinirSenha: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as jest.Mocked<IAuthRepository>;
}

describe('RedefinirSenhaUseCase', () => {
  it('rejeita e-mail vazio ou só com espaços', async () => {
    const repository = makeRepository();
    const useCase = new RedefinirSenhaUseCase(repository);

    await expect(useCase.execute('   ')).rejects.toThrow('Informe seu e-mail.');
    expect(repository.redefinirSenha).not.toHaveBeenCalled();
  });

  it('envia o e-mail sem espaços nas pontas para o repositório', async () => {
    const repository = makeRepository();
    const useCase = new RedefinirSenhaUseCase(repository);

    await useCase.execute('  a@b.com  ');

    expect(repository.redefinirSenha).toHaveBeenCalledWith('a@b.com');
  });
});
