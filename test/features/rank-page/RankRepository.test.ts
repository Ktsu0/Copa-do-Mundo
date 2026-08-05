// Testa RankRepository: separação do ranking em top 3 e demais colocados por pontuação.
jest.mock('@/shareds/infrastructure/firebase/UsuarioRepository', () => ({
  UsuarioRepository: {
    listarUsuariosPorPontos: jest.fn(),
  },
  usuarioAtualDocId: jest.fn(),
}));

import { UsuarioRepository, UsuarioComId, usuarioAtualDocId } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { RankRepository } from '@/features/rank-page/infrastructure/repositories/RankRepository';

const mockListarUsuarios = UsuarioRepository.listarUsuariosPorPontos as jest.Mock;
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
});

describe('RankRepository.getRankData', () => {
  it('separa os 3 primeiros colocados em topPlayers e os demais (até 53) em otherPlayers', async () => {
    const usuarios = Array.from({ length: 6 }, (_, i) =>
      usuario({ id: `id-${i}`, nome: `Jogador ${i}`, pontos: 100 - i })
    );
    mockListarUsuarios.mockResolvedValue(usuarios);
    mockUsuarioAtualDocId.mockReturnValue('id-nao-listado');

    const rank = await new RankRepository().getRankData();

    expect(rank.topPlayers).toHaveLength(3);
    expect(rank.topPlayers.map((p) => p.position)).toEqual([1, 2, 3]);
    expect(rank.otherPlayers).toHaveLength(3);
    // A posição dos "outros" continua a contagem (4, 5, 6) em vez de reiniciar em 1
    expect(rank.otherPlayers.map((p) => p.position)).toEqual([4, 5, 6]);
  });

  it('atribui cores de pódio (ouro/prata/bronze) apenas às 3 primeiras posições', async () => {
    const usuarios = Array.from({ length: 4 }, (_, i) => usuario({ id: `id-${i}`, pontos: 100 - i }));
    mockListarUsuarios.mockResolvedValue(usuarios);
    mockUsuarioAtualDocId.mockReturnValue(undefined);

    const rank = await new RankRepository().getRankData();

    expect(rank.topPlayers.map((p) => p.color)).toEqual(['#FFD700', '#D3D3D3', '#CD7F32']);
    expect(rank.otherPlayers[0].color).toBeUndefined();
  });

  it('formata os pontos no padrão pt-BR com sufixo "PTS"', async () => {
    mockListarUsuarios.mockResolvedValue([usuario({ pontos: 12345 })]);
    mockUsuarioAtualDocId.mockReturnValue(undefined);

    const rank = await new RankRepository().getRankData();

    expect(rank.topPlayers[0].points).toBe('12.345 PTS');
  });

  it('monta o currentUser com a posição real do usuário logado quando ele está na lista', async () => {
    const usuarios = Array.from({ length: 5 }, (_, i) => usuario({ id: `id-${i}`, pontos: 100 - i }));
    mockListarUsuarios.mockResolvedValue(usuarios);
    mockUsuarioAtualDocId.mockReturnValue('id-3');

    const rank = await new RankRepository().getRankData();

    expect(rank.currentUser).toEqual(
      expect.objectContaining({ name: 'Você', position: 4, points: `${100 - 3} PTS` })
    );
  });

  it('coloca o usuário logado no topPlayers quando ele está entre os 3 primeiros', async () => {
    const usuarios = Array.from({ length: 5 }, (_, i) => usuario({ id: `id-${i}`, pontos: 100 - i }));
    mockListarUsuarios.mockResolvedValue(usuarios);
    mockUsuarioAtualDocId.mockReturnValue('id-1');

    const rank = await new RankRepository().getRankData();

    expect(rank.topPlayers[1].avatar).toBe('https://i.pravatar.cc/150?img=11');
  });

  it('usa posição além do total e pontos zerados quando o usuário logado não está na lista (visitante)', async () => {
    const usuarios = Array.from({ length: 5 }, (_, i) => usuario({ id: `id-${i}`, pontos: 100 - i }));
    mockListarUsuarios.mockResolvedValue(usuarios);
    mockUsuarioAtualDocId.mockReturnValue(undefined);

    const rank = await new RankRepository().getRankData();

    expect(rank.currentUser).toEqual(
      expect.objectContaining({ name: 'Você', position: 6, points: '0 PTS' })
    );
  });

  it('limita otherPlayers aos jogadores das posições 4 a 53', async () => {
    const usuarios = Array.from({ length: 60 }, (_, i) => usuario({ id: `id-${i}`, pontos: 1000 - i }));
    mockListarUsuarios.mockResolvedValue(usuarios);
    mockUsuarioAtualDocId.mockReturnValue(undefined);

    const rank = await new RankRepository().getRankData();

    expect(rank.otherPlayers).toHaveLength(50);
    expect(rank.otherPlayers[0].position).toBe(4);
    expect(rank.otherPlayers[rank.otherPlayers.length - 1].position).toBe(53);
  });
});
