jest.mock('@/shareds/infrastructure/sqlite/db', () => ({
  initDb: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/shareds/infrastructure/firebase/UsuarioRepository', () => ({
  UsuarioRepository: {
    getUsuario: jest.fn(),
    updateUsuario: jest.fn().mockResolvedValue(undefined),
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
const mockUpdateUsuario = UsuarioRepository.updateUsuario as jest.Mock;
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

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.spyOn(global.Math, 'random').mockReturnValue(0);
  mockGetAllJogadores.mockReturnValue(jogadores);
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
  it('lança erro quando o usuário não existe', async () => {
    mockGetUsuario.mockResolvedValue(null);
    await expect(new PacketRepository().openPackets(1)).rejects.toThrow('Usuário não encontrado.');
    expect(mockUpdateUsuario).not.toHaveBeenCalled();
  });

  it('lança erro quando a quantidade pedida é zero ou negativa', async () => {
    mockGetUsuario.mockResolvedValue(usuario({ qtd_pacotes: 5 }));
    await expect(new PacketRepository().openPackets(0)).rejects.toThrow('Quantidade de pacotinhos inválida.');
  });

  it('lança erro quando a quantidade pedida excede o disponível', async () => {
    mockGetUsuario.mockResolvedValue(usuario({ qtd_pacotes: 2 }));
    await expect(new PacketRepository().openPackets(3)).rejects.toThrow('Quantidade de pacotinhos inválida.');
    expect(mockUpdateUsuario).not.toHaveBeenCalled();
  });

  it('lança erro quando não há figurinhas cadastradas no sistema', async () => {
    mockGetUsuario.mockResolvedValue(usuario({ qtd_pacotes: 5 }));
    mockGetAllJogadores.mockReturnValue([]);

    await expect(new PacketRepository().openPackets(1)).rejects.toThrow('Nenhuma figurinha cadastrada no sistema.');
  });

  it('abre 1 pacote com 3 figurinhas e calcula o progresso acumulado do álbum', async () => {
    mockGetUsuario.mockResolvedValue(usuario({ qtd_pacotes: 5, album_jogador: [] }));

    const resultados = await openPackets(new PacketRepository(), 1);

    expect(resultados).toHaveLength(1);
    expect(resultados[0].figurinhasGanhas).toHaveLength(3);
    // Math.random mockado para 0 -> sempre sorteia jogadores[0] ('j1')
    expect(resultados[0].figurinhasGanhas.every((f) => f.id === 'j1')).toBe(true);
    expect(resultados[0].novosProgressos).toEqual({ collected: 1, total: 2, percentage: 50 });
  });

  it('marca isNew=false quando a figurinha sorteada já está no álbum', async () => {
    mockGetUsuario.mockResolvedValue(usuario({ qtd_pacotes: 5, album_jogador: ['j1'] }));

    const resultados = await openPackets(new PacketRepository(), 1);

    expect(resultados[0].figurinhasGanhas.every((f) => f.isNew === false)).toBe(true);
    expect(resultados[0].novosProgressos.collected).toBe(1);
  });

  it('atualiza qtd_pacotes, qtd_pacote_aberto e album_jogador no usuário ao final', async () => {
    mockGetUsuario.mockResolvedValue(usuario({ qtd_pacotes: 5, qtd_pacote_aberto: 2, album_jogador: [] }));

    await openPackets(new PacketRepository(), 3);

    expect(mockUpdateUsuario).toHaveBeenCalledWith({
      qtd_pacotes: 2,
      qtd_pacote_aberto: 5,
      album_jogador: ['j1'],
    });
  });

  it('permite abrir exatamente a quantidade disponível (limite igual não é insuficiente)', async () => {
    mockGetUsuario.mockResolvedValue(usuario({ qtd_pacotes: 2 }));

    const resultados = await openPackets(new PacketRepository(), 2);

    expect(resultados).toHaveLength(2);
  });
});
