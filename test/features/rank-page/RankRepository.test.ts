// Testa RankRepository: separação do ranking em top 3 e demais colocados por pontuação.
jest.mock('@/shareds/infrastructure/firebase/UsuarioRepository', () => ({
  UsuarioRepository: {
    listarTopUsuariosPorPontos: jest.fn(),
    getUsuario: jest.fn(),
    contarUsuariosComMaisPontosQue: jest.fn(),
  },
  usuarioAtualDocId: jest.fn(),
}));

import { UsuarioRepository, UsuarioComId, UsuarioFirestore, usuarioAtualDocId } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { RankRepository } from '@/features/rank-page/infrastructure/repositories/RankRepository';

const mockListarTopUsuarios = UsuarioRepository.listarTopUsuariosPorPontos as jest.Mock;
const mockGetUsuario = UsuarioRepository.getUsuario as jest.Mock;
const mockContarComMaisPontos = UsuarioRepository.contarUsuariosComMaisPontosQue as jest.Mock;
const mockUsuarioAtualDocId = usuarioAtualDocId as jest.Mock;

function usuario(overrides: Partial<UsuarioComId> = {}): UsuarioComId {
  return {
    id: 'id-1',
    nome: 'Jogador 1',
    email: 'j1@teste.com',
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

beforeEach(() => {
  jest.clearAllMocks();
  // Por padrao, sem usuario logado (visitante) e sem ninguem "acima" na
  // contagem -- cada teste sobrescreve o que precisar.
  mockGetUsuario.mockResolvedValue(null);
  mockContarComMaisPontos.mockResolvedValue(0);
});

describe('RankRepository.getRankData', () => {
  it('separa os 3 primeiros colocados em topPlayers e os demais (até 53) em otherPlayers', async () => {
    const usuarios = Array.from({ length: 6 }, (_, i) =>
      usuario({ id: `id-${i}`, nome: `Jogador ${i}`, pontos: 100 - i })
    );
    mockListarTopUsuarios.mockResolvedValue(usuarios);
    mockUsuarioAtualDocId.mockReturnValue('id-nao-listado');

    const rank = await new RankRepository().getRankData();

    expect(mockListarTopUsuarios).toHaveBeenCalledWith(53);
    expect(rank.topPlayers).toHaveLength(3);
    expect(rank.topPlayers.map((p) => p.position)).toEqual([1, 2, 3]);
    expect(rank.otherPlayers).toHaveLength(3);
    // A posição dos "outros" continua a contagem (4, 5, 6) em vez de reiniciar em 1
    expect(rank.otherPlayers.map((p) => p.position)).toEqual([4, 5, 6]);
  });

  it('formata os pontos no padrão pt-BR com sufixo "PTS"', async () => {
    mockListarTopUsuarios.mockResolvedValue([usuario({ pontos: 12345 })]);
    mockUsuarioAtualDocId.mockReturnValue(undefined);

    const rank = await new RankRepository().getRankData();

    expect(rank.topPlayers[0].points).toBe('12.345 PTS');
  });

  it('monta o currentUser com a posição real do usuário logado quando ele está na lista', async () => {
    const usuarios = Array.from({ length: 5 }, (_, i) => usuario({ id: `id-${i}`, pontos: 100 - i }));
    mockListarTopUsuarios.mockResolvedValue(usuarios);
    mockUsuarioAtualDocId.mockReturnValue('id-3');
    mockGetUsuario.mockResolvedValue({ pontos: 100 - 3 } as UsuarioFirestore);

    const rank = await new RankRepository().getRankData();

    // Achado na propria lista top-53 -- nao deveria precisar de contagem agregada.
    expect(mockContarComMaisPontos).not.toHaveBeenCalled();
    expect(rank.currentUser).toEqual(
      expect.objectContaining({ name: 'Você', position: 4, points: `${100 - 3} PTS` })
    );
  });

  it('coloca o usuário logado no topPlayers quando ele está entre os 3 primeiros', async () => {
    const usuarios = Array.from({ length: 5 }, (_, i) => usuario({ id: `id-${i}`, pontos: 100 - i }));
    mockListarTopUsuarios.mockResolvedValue(usuarios);
    mockUsuarioAtualDocId.mockReturnValue('id-1');

    const rank = await new RankRepository().getRankData();

    expect(rank.topPlayers[1].avatar).toBe('https://i.pravatar.cc/150?img=11');
  });

  it('usa posição zero (sem rank) e pontos zerados quando ninguém está logado (visitante)', async () => {
    const usuarios = Array.from({ length: 5 }, (_, i) => usuario({ id: `id-${i}`, pontos: 100 - i }));
    mockListarTopUsuarios.mockResolvedValue(usuarios);
    mockUsuarioAtualDocId.mockReturnValue(undefined);
    // getUsuario() ja retorna null pra sessao anonima/visitante (mock padrao do beforeEach).

    const rank = await new RankRepository().getRankData();

    expect(mockContarComMaisPontos).not.toHaveBeenCalled();
    expect(rank.currentUser).toEqual(
      expect.objectContaining({ name: 'Você', position: 0, points: '0 PTS' })
    );
  });

  it('calcula a posição do usuário logado por contagem quando ele não está no top listado', async () => {
    const usuarios = Array.from({ length: 10 }, (_, i) => usuario({ id: `id-${i}`, pontos: 100 - i }));
    mockListarTopUsuarios.mockResolvedValue(usuarios);
    mockUsuarioAtualDocId.mockReturnValue('id-fora-do-top');
    mockGetUsuario.mockResolvedValue({ pontos: 42 } as UsuarioFirestore);
    mockContarComMaisPontos.mockResolvedValue(57);

    const rank = await new RankRepository().getRankData();

    expect(mockContarComMaisPontos).toHaveBeenCalledWith(42);
    expect(rank.currentUser).toEqual(
      expect.objectContaining({ name: 'Você', position: 58, points: '42 PTS' })
    );
  });

  it('limita otherPlayers aos jogadores das posições 4 a 53', async () => {
    const usuarios = Array.from({ length: 60 }, (_, i) => usuario({ id: `id-${i}`, pontos: 1000 - i }));
    mockListarTopUsuarios.mockImplementation((max: number) => Promise.resolve(usuarios.slice(0, max)));
    mockUsuarioAtualDocId.mockReturnValue(undefined);

    const rank = await new RankRepository().getRankData();

    expect(rank.otherPlayers).toHaveLength(50);
    expect(rank.otherPlayers[0].position).toBe(4);
    expect(rank.otherPlayers[rank.otherPlayers.length - 1].position).toBe(53);
  });
});
