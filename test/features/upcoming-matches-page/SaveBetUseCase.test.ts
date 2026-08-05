// Testa validações de placar e regras de negócio ao salvar um palpite no SaveBetUseCase.
import { SaveBetUseCase } from '@/features/upcoming-matches-page/application/usecases/SaveBetUseCase';
import { IBetRepository } from '@/features/upcoming-matches-page/domain/repositories/IBetRepository';
import { Bet } from '@/features/upcoming-matches-page/domain/entities/Bet';

function makeRepository(overrides: Partial<IBetRepository> = {}): jest.Mocked<IBetRepository> {
  return {
    getMatchForBet: jest.fn(),
    getBetForMatch: jest.fn(),
    isUsuarioMaiorDeIdade: jest.fn().mockResolvedValue(true),
    saveBet: jest.fn().mockResolvedValue(true),
    ...overrides,
  } as jest.Mocked<IBetRepository>;
}

function makeBet(overrides: Partial<Bet> = {}): Bet {
  return {
    jogoId: 'jogo-1',
    placarCasa: 2,
    placarFora: 1,
    primeiroMarcar: null,
    vencedor: null,
    ...overrides,
  };
}

describe('SaveBetUseCase', () => {
  it('rejeita placar negativo do time da casa sem chamar o repositório', async () => {
    const repository = makeRepository();
    const useCase = new SaveBetUseCase(repository);

    await expect(useCase.execute(makeBet({ placarCasa: -1 }))).rejects.toThrow('Placar inválido.');
    expect(repository.isUsuarioMaiorDeIdade).not.toHaveBeenCalled();
    expect(repository.saveBet).not.toHaveBeenCalled();
  });

  it('rejeita placar negativo do time visitante', async () => {
    const repository = makeRepository();
    const useCase = new SaveBetUseCase(repository);

    await expect(useCase.execute(makeBet({ placarFora: -1 }))).rejects.toThrow('Placar inválido.');
  });

  it('retorna false sem salvar quando o usuário é menor de idade', async () => {
    const repository = makeRepository({ isUsuarioMaiorDeIdade: jest.fn().mockResolvedValue(false) });
    const useCase = new SaveBetUseCase(repository);

    const resultado = await useCase.execute(makeBet());

    expect(resultado).toBe(false);
    expect(repository.saveBet).not.toHaveBeenCalled();
  });

  it('salva a aposta e retorna o resultado do repositório quando maior de idade', async () => {
    const repository = makeRepository({ saveBet: jest.fn().mockResolvedValue(true) });
    const useCase = new SaveBetUseCase(repository);
    const bet = makeBet();

    const resultado = await useCase.execute(bet);

    expect(resultado).toBe(true);
    expect(repository.saveBet).toHaveBeenCalledWith(bet);
  });

  it('aceita placar 0 x 0 (não é negativo)', async () => {
    const repository = makeRepository();
    const useCase = new SaveBetUseCase(repository);

    await useCase.execute(makeBet({ placarCasa: 0, placarFora: 0 }));

    expect(repository.saveBet).toHaveBeenCalled();
  });
});
