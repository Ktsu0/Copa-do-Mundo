import { CadastroUseCase } from '@/features/auth-page/application/usecases/CadastroUseCase';
import { IAuthRepository } from '@/features/auth-page/domain/repositories/IAuthRepository';
import { DadosCadastro } from '@/features/auth-page/domain/entities/Credenciais';

function makeRepository(overrides: Partial<IAuthRepository> = {}): jest.Mocked<IAuthRepository> {
  return {
    entrar: jest.fn(),
    cadastrar: jest.fn().mockResolvedValue(undefined),
    sair: jest.fn(),
    redefinirSenha: jest.fn(),
    ...overrides,
  } as jest.Mocked<IAuthRepository>;
}

function makeDados(overrides: Partial<DadosCadastro> = {}): DadosCadastro {
  return {
    nome: 'Fulano de Tal',
    email: 'fulano@teste.com',
    senha: '123456',
    dataNascimento: '01/01/2000',
    ...overrides,
  };
}

describe('CadastroUseCase', () => {
  it('rejeita nome vazio ou só com espaços', async () => {
    const repository = makeRepository();
    const useCase = new CadastroUseCase(repository);

    await expect(useCase.execute(makeDados({ nome: '   ' }))).rejects.toThrow('Informe seu nome completo.');
    expect(repository.cadastrar).not.toHaveBeenCalled();
  });

  it('rejeita e-mail vazio', async () => {
    const useCase = new CadastroUseCase(makeRepository());
    await expect(useCase.execute(makeDados({ email: '' }))).rejects.toThrow('Informe seu e-mail.');
  });

  it('rejeita senha com menos de 6 caracteres', async () => {
    const useCase = new CadastroUseCase(makeRepository());
    await expect(useCase.execute(makeDados({ senha: '12345' }))).rejects.toThrow(
      'A senha precisa ter pelo menos 6 caracteres.'
    );
  });

  it('rejeita data de nascimento fora do formato DD/MM/AAAA', async () => {
    const useCase = new CadastroUseCase(makeRepository());
    await expect(useCase.execute(makeDados({ dataNascimento: '2000-01-01' }))).rejects.toThrow(
      'Informe a data de nascimento no formato DD/MM/AAAA.'
    );
  });

  it('cadastra com nome e e-mail sem espaços nas pontas', async () => {
    const repository = makeRepository();
    const useCase = new CadastroUseCase(repository);

    await useCase.execute(makeDados({ nome: '  Fulano de Tal  ', email: '  fulano@teste.com  ' }));

    expect(repository.cadastrar).toHaveBeenCalledWith({
      nome: 'Fulano de Tal',
      email: 'fulano@teste.com',
      senha: '123456',
      dataNascimento: '01/01/2000',
    });
  });
});
