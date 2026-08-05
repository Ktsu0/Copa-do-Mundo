// Testa RewardRepository: cálculo de progresso e concessão de recompensas/conquistas ao usuário.
jest.mock('@/shareds/infrastructure/sqlite/db', () => ({
  initDb: jest.fn().mockResolvedValue(undefined),
  getDbSync: jest.fn(),
}));
jest.mock('@/shareds/infrastructure/firebase/UsuarioRepository', () => ({
  UsuarioRepository: {
    getUsuario: jest.fn(),
    transacao: jest.fn(),
  },
}));
jest.mock('@/shareds/infrastructure/sqlite/jogadoresQueries', () => ({
  getJogadoresTotal: jest.fn(),
}));

import { getDbSync } from '@/shareds/infrastructure/sqlite/db';
import { UsuarioRepository, UsuarioFirestore } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getJogadoresTotal } from '@/shareds/infrastructure/sqlite/jogadoresQueries';
import { RewardRepository } from '@/features/rewards-page/infrastructure/repositories/RewardRepository';

const mockGetUsuario = UsuarioRepository.getUsuario as jest.Mock;
const mockTransacao = UsuarioRepository.transacao as jest.Mock;
const mockGetJogadoresTotal = getJogadoresTotal as jest.Mock;

interface RecompensaRow {
  id: string;
  titulo: string;
  descricao: string;
  requisito_progresso: number;
  premio_tipo: string;
  premio_quantidade: number;
}

function recompensa(overrides: Partial<RecompensaRow> = {}): RecompensaRow {
  return {
    id: 'recompensa-1',
    titulo: 'Primeira conquista',
    descricao: '10% do album',
    requisito_progresso: 10,
    premio_tipo: 'pacotes',
    premio_quantidade: 2,
    ...overrides,
  };
}

function mockRecompensas(rows: RecompensaRow[]) {
  (getDbSync as jest.Mock).mockReturnValue({
    getAllSync: jest.fn().mockReturnValue(rows),
  });
}

function usuario(overrides: Partial<UsuarioFirestore> = {}): UsuarioFirestore {
  return {
    nome: 'Fulano',
    email: 'fulano@teste.com',
    data_nascimento: '2000-01-01',
    maior_idade: true,
    pontos: 0,
    qtd_pacote_aberto: 0,
    qtd_pacotes: 0,
    conquistas: [],
    album_jogador: [],
    palpites: [],
    ...overrides,
  };
}

// UsuarioRepository.transacao (Firestore) le o usuario dentro da transacao e
// chama a funcao `mutate` passada pelo repositorio. Aqui simulamos isso
// aplicando `mutate` contra um usuario fixo e capturando os `updates`
// resultantes, para continuar podendo verificar o que seria gravado.
let capturedUpdates: Partial<UsuarioFirestore> | undefined;

function mockUsuarioParaTransacao(u: UsuarioFirestore) {
  mockTransacao.mockImplementation(
    (mutate: (usuario: UsuarioFirestore) => { updates: Partial<UsuarioFirestore>; result: unknown }) => {
      const { updates, result } = mutate(u);
      capturedUpdates = updates;
      return Promise.resolve(result);
    }
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetJogadoresTotal.mockReturnValue(100);
  capturedUpdates = undefined;
});

describe('RewardRepository.getRewards', () => {
  it('calcula o progresso a partir do album do usuário e marca como resgatável quando bate o requisito', async () => {
    mockRecompensas([recompensa({ id: 'recompensa-10', requisito_progresso: 10 })]);
    mockGetUsuario.mockResolvedValue(usuario({ album_jogador: Array.from({ length: 10 }, (_, i) => `j${i}`) }));

    const rewards = await new RewardRepository().getRewards();

    expect(rewards).toEqual([
      expect.objectContaining({ id: 'recompensa-10', resgatado: false, resgatavel: true }),
    ]);
  });

  it('não marca como resgatável quando o progresso ainda não bate o requisito', async () => {
    mockRecompensas([recompensa({ id: 'recompensa-50', requisito_progresso: 50 })]);
    mockGetUsuario.mockResolvedValue(usuario({ album_jogador: ['j1'] }));

    const rewards = await new RewardRepository().getRewards();

    expect(rewards[0]).toEqual(expect.objectContaining({ resgatavel: false }));
  });

  it('marca resgatado=true e resgatavel=false para conquista já resgatada, mesmo cumprindo o requisito', async () => {
    mockRecompensas([recompensa({ id: 'recompensa-10', requisito_progresso: 10 })]);
    mockGetUsuario.mockResolvedValue(
      usuario({ conquistas: [10], album_jogador: Array.from({ length: 20 }, (_, i) => `j${i}`) })
    );

    const rewards = await new RewardRepository().getRewards();

    expect(rewards[0]).toEqual(expect.objectContaining({ resgatado: true, resgatavel: false }));
  });

  it('trata usuário nulo (visitante) como progresso zero, sem quebrar', async () => {
    mockRecompensas([recompensa({ requisito_progresso: 0 })]);
    mockGetUsuario.mockResolvedValue(null);

    const rewards = await new RewardRepository().getRewards();

    expect(rewards[0]).toEqual(expect.objectContaining({ resgatavel: true, resgatado: false }));
  });
});

describe('RewardRepository.claimReward', () => {
  it('retorna false quando a recompensa não existe', async () => {
    mockRecompensas([]);

    const resultado = await new RewardRepository().claimReward('recompensa-999');

    expect(resultado).toBe(false);
    expect(mockTransacao).not.toHaveBeenCalled();
  });

  it('retorna false quando não há usuário autenticado', async () => {
    mockRecompensas([recompensa({ id: 'recompensa-1' })]);
    mockTransacao.mockRejectedValue(new Error('Nenhum usuário autenticado.'));

    const resultado = await new RewardRepository().claimReward('recompensa-1');

    expect(resultado).toBe(false);
  });

  it('retorna false quando a recompensa já foi resgatada antes', async () => {
    mockRecompensas([recompensa({ id: 'recompensa-1', requisito_progresso: 0 })]);
    mockUsuarioParaTransacao(usuario({ conquistas: [1] }));

    const resultado = await new RewardRepository().claimReward('recompensa-1');

    expect(resultado).toBe(false);
    expect(capturedUpdates).toEqual({});
  });

  it('retorna false quando o progresso ainda não atinge o requisito', async () => {
    mockRecompensas([recompensa({ id: 'recompensa-1', requisito_progresso: 50 })]);
    mockUsuarioParaTransacao(usuario({ album_jogador: ['j1'] }));

    const resultado = await new RewardRepository().claimReward('recompensa-1');

    expect(resultado).toBe(false);
    expect(capturedUpdates).toEqual({});
  });

  it('credita pacotes e registra a conquista quando o prêmio é do tipo "pacotes"', async () => {
    mockRecompensas([recompensa({ id: 'recompensa-1', requisito_progresso: 0, premio_tipo: 'pacotes', premio_quantidade: 3 })]);
    mockUsuarioParaTransacao(usuario({ qtd_pacotes: 2, conquistas: [] }));

    const resultado = await new RewardRepository().claimReward('recompensa-1');

    expect(resultado).toBe(true);
    expect(capturedUpdates).toEqual({ conquistas: [1], qtd_pacotes: 5 });
  });

  it('credita pontos e registra a conquista quando o prêmio é do tipo "pontos"', async () => {
    mockRecompensas([recompensa({ id: 'recompensa-2', requisito_progresso: 0, premio_tipo: 'pontos', premio_quantidade: 300 })]);
    mockUsuarioParaTransacao(usuario({ pontos: 100, conquistas: [1] }));

    const resultado = await new RewardRepository().claimReward('recompensa-2');

    expect(resultado).toBe(true);
    expect(capturedUpdates).toEqual({ conquistas: [1, 2], pontos: 400 });
  });
});
