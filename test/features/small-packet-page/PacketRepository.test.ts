// Testa PacketRepository: abertura de pacotinhos e sorteio/atribuição de jogadores ao usuário.
jest.mock('@/shareds/infrastructure/sqlite/db', () => ({
  initDb: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/shareds/infrastructure/firebase/UsuarioRepository', () => ({
  UsuarioRepository: {
    getUsuario: jest.fn(),
    transacao: jest.fn(),
  },
}));
jest.mock('@/shareds/infrastructure/sqlite/jogadoresQueries', () => ({
  getAllJogadores: jest.fn(),
  nomeSemClube: jest.fn((nome: string) => nome),
}));

import { UsuarioRepository, UsuarioFirestore } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getAllJogadores } from '@/shareds/infrastructure/sqlite/jogadoresQueries';
import { PacketRepository } from '@/features/small-packet-page/infrastructure/repositories/PacketRepository';

const mockGetUsuario = UsuarioRepository.getUsuario as jest.Mock;
const mockTransacao = UsuarioRepository.transacao as jest.Mock;
const mockGetAllJogadores = getAllJogadores as jest.Mock;

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

const jogadores = [
  { id: 'j1', nome: 'Jogador 1', time_id: 'BRA', posicao: 'ATA', imagem_url: null },
  { id: 'j2', nome: 'Jogador 2', time_id: 'BRA', posicao: 'MEI', imagem_url: null },
];

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
  jest.useFakeTimers();
  jest.spyOn(global.Math, 'random').mockReturnValue(0);
  mockGetAllJogadores.mockReturnValue(jogadores);
  capturedUpdates = undefined;
});

afterEach(() => {
  jest.spyOn(global.Math, 'random').mockRestore();
  jest.useRealTimers();
});

// openPackets tem um delay(500) interno (simula o tempo de abertura na UI) --
// com fake timers, o await direto trava esperando um timer que nunca dispara,
// então avançamos os timers em paralelo antes de aguardar o resultado.
async function openPackets(repo: PacketRepository, quantidade: number) {
  const promise = repo.openPackets(quantidade);
  await jest.runAllTimersAsync();
  return promise;
}

describe('PacketRepository.getPacotesDisponiveis', () => {
  it('retorna 0 quando não há usuário (visitante)', async () => {
    mockGetUsuario.mockResolvedValue(null);
    await expect(new PacketRepository().getPacotesDisponiveis()).resolves.toBe(0);
  });

  it('retorna a quantidade de pacotes do usuário', async () => {
    mockGetUsuario.mockResolvedValue(usuario({ qtd_pacotes: 7 }));
    await expect(new PacketRepository().getPacotesDisponiveis()).resolves.toBe(7);
  });
});

describe('PacketRepository.openPackets', () => {
  // A validacao roda dentro da transacao (Fase 1), que so acontece depois do
  // delay(500) simulado -- por isso essas 3 tambem precisam avancar os fake
  // timers antes de aguardar a rejeicao, como o helper `openPackets` faz.
  it('lança erro quando o usuário não existe', async () => {
    mockTransacao.mockRejectedValue(new Error('Usuário não encontrado.'));
    const promise = new PacketRepository().openPackets(1);
    // Anexa a expectativa de rejeicao antes de avancar os timers, senao a
    // promise rejeita "sem dono" nesse meio-tempo e o Jest acusa unhandled
    // rejection em vez da falha esperada.
    const expectation = expect(promise).rejects.toThrow('Usuário não encontrado.');
    await jest.runAllTimersAsync();
    await expectation;
  });

  it('lança erro quando a quantidade pedida é zero ou negativa', async () => {
    mockUsuarioParaTransacao(usuario({ qtd_pacotes: 5 }));
    const promise = new PacketRepository().openPackets(0);
    const expectation = expect(promise).rejects.toThrow('Quantidade de pacotinhos inválida.');
    await jest.runAllTimersAsync();
    await expectation;
  });

  it('lança erro quando a quantidade pedida excede o disponível', async () => {
    mockUsuarioParaTransacao(usuario({ qtd_pacotes: 2 }));
    const promise = new PacketRepository().openPackets(3);
    const expectation = expect(promise).rejects.toThrow('Quantidade de pacotinhos inválida.');
    await jest.runAllTimersAsync();
    await expectation;
    expect(capturedUpdates).toBeUndefined();
  });

  it('lança erro quando não há figurinhas cadastradas no sistema', async () => {
    mockGetAllJogadores.mockReturnValue([]);

    await expect(new PacketRepository().openPackets(1)).rejects.toThrow('Nenhuma figurinha cadastrada no sistema.');
    expect(mockTransacao).not.toHaveBeenCalled();
  });

  it('abre 1 pacote com 3 figurinhas e calcula o progresso acumulado do álbum', async () => {
    mockUsuarioParaTransacao(usuario({ qtd_pacotes: 5, album_jogador: [] }));

    const resultados = await openPackets(new PacketRepository(), 1);

    expect(resultados).toHaveLength(1);
    expect(resultados[0].figurinhasGanhas).toHaveLength(3);
    // Math.random mockado para 0 -> sempre sorteia jogadores[0] ('j1')
    expect(resultados[0].figurinhasGanhas.every((f) => f.id === 'j1')).toBe(true);
    expect(resultados[0].novosProgressos).toEqual({ collected: 1, total: 2, percentage: 50 });
  });

  it('marca isNew=false quando a figurinha sorteada já está no álbum', async () => {
    mockUsuarioParaTransacao(usuario({ qtd_pacotes: 5, album_jogador: ['j1'] }));

    const resultados = await openPackets(new PacketRepository(), 1);

    expect(resultados[0].figurinhasGanhas.every((f) => f.isNew === false)).toBe(true);
    expect(resultados[0].novosProgressos.collected).toBe(1);
  });

  it('atualiza qtd_pacotes, qtd_pacote_aberto e album_jogador no usuário ao final', async () => {
    mockUsuarioParaTransacao(usuario({ qtd_pacotes: 5, qtd_pacote_aberto: 2, album_jogador: [] }));

    await openPackets(new PacketRepository(), 3);

    expect(capturedUpdates).toEqual({
      qtd_pacotes: 2,
      qtd_pacote_aberto: 5,
      album_jogador: ['j1'],
    });
  });

  it('permite abrir exatamente a quantidade disponível (limite igual não é insuficiente)', async () => {
    mockUsuarioParaTransacao(usuario({ qtd_pacotes: 2 }));

    const resultados = await openPackets(new PacketRepository(), 2);

    expect(resultados).toHaveLength(2);
  });
});
