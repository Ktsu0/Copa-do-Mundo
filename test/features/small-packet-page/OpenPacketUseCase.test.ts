// Testa a regra de quantidade suficiente de pacotinhos ao abrir pacotes no OpenPacketUseCase.
import { OpenPacketUseCase } from '@/features/small-packet-page/application/usecases/OpenPacketUseCase';
import { IPacketRepository } from '@/features/small-packet-page/domain/repositories/IPacketRepository';

function makeRepository(overrides: Partial<IPacketRepository> = {}): jest.Mocked<IPacketRepository> {
  return {
    getPacotesDisponiveis: jest.fn(),
    openPackets: jest.fn(),
    ...overrides,
  } as jest.Mocked<IPacketRepository>;
}

describe('OpenPacketUseCase', () => {
  it('lança erro e não abre nada quando não há pacotinhos suficientes', async () => {
    const repository = makeRepository({
      getPacotesDisponiveis: jest.fn().mockResolvedValue(2),
      openPackets: jest.fn(),
    });
    const useCase = new OpenPacketUseCase(repository);

    await expect(useCase.execute(3)).rejects.toThrow('Você não tem pacotinhos suficientes.');
    expect(repository.openPackets).not.toHaveBeenCalled();
  });

  it('abre a quantidade pedida quando há pacotinhos suficientes', async () => {
    const resultado = [{ id: 'p1' }];
    const repository = makeRepository({
      getPacotesDisponiveis: jest.fn().mockResolvedValue(5),
      openPackets: jest.fn().mockResolvedValue(resultado),
    });
    const useCase = new OpenPacketUseCase(repository);

    const abertos = await useCase.execute(3);

    expect(repository.openPackets).toHaveBeenCalledWith(3);
    expect(abertos).toBe(resultado);
  });

  it('permite abrir exatamente a quantidade disponível (limite igual não é insuficiente)', async () => {
    const repository = makeRepository({
      getPacotesDisponiveis: jest.fn().mockResolvedValue(3),
      openPackets: jest.fn().mockResolvedValue([]),
    });
    const useCase = new OpenPacketUseCase(repository);

    await useCase.execute(3);

    expect(repository.openPackets).toHaveBeenCalledWith(3);
  });
});
