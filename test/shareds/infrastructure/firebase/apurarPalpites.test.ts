// Testa a apuração de palpites pendentes (acerto/erro e atualização de pontos) em apurarPalpites.ts.
jest.mock('@/shareds/infrastructure/sqlite/jogosQueries', () => ({
  getAllJogos: jest.fn(),
}));
jest.mock('@/shareds/infrastructure/firebase/UsuarioRepository', () => ({
  UsuarioRepository: {
    getUsuario: jest.fn(),
    transacao: jest.fn(),
  },
}));
jest.mock('@/shareds/infrastructure/teams/timeHelpers', () => ({
  getTeamName: jest.fn(),
}));

import { getAllJogos } from '@/shareds/infrastructure/sqlite/jogosQueries';
import { UsuarioRepository, PalpiteFirestore, UsuarioFirestore } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';
import { apurarPalpitesPendentes } from '@/shareds/infrastructure/firebase/apurarPalpites';

const mockGetAllJogos = getAllJogos as jest.Mock;
const mockGetUsuario = UsuarioRepository.getUsuario as jest.Mock;
const mockTransacao = UsuarioRepository.transacao as jest.Mock;
const mockGetTeamName = getTeamName as jest.Mock;

function palpite(overrides: Partial<PalpiteFirestore> = {}): PalpiteFirestore {
  return {
    id_palpite: 'jogo-1',
    ganhador_empate: 'Brasil',
    primeiro_time_marcar: '',
    placar_time_1: 2,
    placar_time_2: 1,
    status: 'Pendente',
    ...overrides,
  };
}

function usuario(overrides: Partial<UsuarioFirestore> = {}): UsuarioFirestore {
  return {
    nome: 'Fulano',
    email: 'fulano@teste.com',
    data_nascimento: '2000-01-01',
    maior_idade: true,
    pontos: 100,
    qtd_pacote_aberto: 0,
    qtd_pacotes: 0,
    conquistas: [],
    album_jogador: [],
    palpites: [],
    ...overrides,
  };
}

function jogoFinalizado(overrides: Record<string, unknown> = {}) {
  return {
    id: 'jogo-1',
    fase: 'GRUPOS',
    data: null,
    status: 'finalizado',
    time_casa_id: 'BRA',
    time_fora_id: 'ARG',
    placar_casa: 2,
    placar_fora: 1,
    penaltis_casa: null,
    penaltis_fora: null,
    time_casa_origem_jogo_id: null,
    time_fora_origem_jogo_id: null,
    ...overrides,
  };
}

// UsuarioRepository.transacao (Firestore) le o usuario dentro da transacao e
// chama a funcao `mutate` passada por apurarPalpites. Aqui simulamos isso
// aplicando `mutate` contra o mesmo usuario devolvido por getUsuario() e
// capturando os `updates` resultantes.
let capturedUpdates: Partial<UsuarioFirestore> | undefined;

function mockUsuario(u: UsuarioFirestore) {
  mockGetUsuario.mockResolvedValue(u);
  mockTransacao.mockImplementation(
    (mutate: (usuario: UsuarioFirestore) => { updates: Partial<UsuarioFirestore>; result: unknown }) => {
      const { updates } = mutate(u);
      capturedUpdates = Object.keys(updates).length > 0 ? updates : undefined;
      return Promise.resolve(undefined);
    }
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetTeamName.mockImplementation((id: string) => (id === 'BRA' ? 'Brasil' : 'Argentina'));
  capturedUpdates = undefined;
});

describe('apurarPalpitesPendentes', () => {
  it('não faz nada se o usuário não existe (visitante/sessão anônima)', async () => {
    mockGetUsuario.mockResolvedValue(null);

    await apurarPalpitesPendentes();

    expect(mockGetAllJogos).not.toHaveBeenCalled();
    expect(mockTransacao).not.toHaveBeenCalled();
  });

  it('não faz nada se o usuário não tem palpites', async () => {
    mockGetUsuario.mockResolvedValue(usuario({ palpites: [] }));

    await apurarPalpitesPendentes();

    expect(mockTransacao).not.toHaveBeenCalled();
  });

  it('credita placar exato + vencedor quando o palpite acerta ambos', async () => {
    mockUsuario(usuario({ pontos: 100, palpites: [palpite()] }));
    mockGetAllJogos.mockReturnValue([jogoFinalizado()]);

    await apurarPalpitesPendentes();

    expect(capturedUpdates).toEqual({
      palpites: [expect.objectContaining({ status: 'Acertou' })],
      pontos: 100 + 500 + 200,
    });
  });

  it('credita só os pontos de vencedor quando acerta o resultado mas não o placar', async () => {
    mockUsuario(usuario({ pontos: 0, palpites: [palpite({ placar_time_1: 3, placar_time_2: 0 })] }));
    mockGetAllJogos.mockReturnValue([jogoFinalizado()]);

    await apurarPalpitesPendentes();

    expect(capturedUpdates).toEqual({
      palpites: [expect.objectContaining({ status: 'Acertou' })],
      pontos: 200,
    });
  });

  it('marca como "Errou" e não credita pontos quando erra tudo', async () => {
    mockUsuario(
      usuario({ pontos: 0, palpites: [palpite({ ganhador_empate: 'Argentina', placar_time_1: 0, placar_time_2: 0 })] })
    );
    mockGetAllJogos.mockReturnValue([jogoFinalizado()]);

    await apurarPalpitesPendentes();

    expect(capturedUpdates).toEqual({
      palpites: [expect.objectContaining({ status: 'Errou' })],
      pontos: 0,
    });
  });

  it('reconhece "Empate" como o nome do vencedor quando o jogo empata', async () => {
    mockUsuario(
      usuario({ pontos: 0, palpites: [palpite({ ganhador_empate: 'Empate', placar_time_1: 1, placar_time_2: 1 })] })
    );
    mockGetAllJogos.mockReturnValue([jogoFinalizado({ placar_casa: 1, placar_fora: 1 })]);

    await apurarPalpitesPendentes();

    expect(capturedUpdates).toEqual({
      palpites: [expect.objectContaining({ status: 'Acertou' })],
      pontos: 500 + 200,
    });
  });

  it('ignora palpites cujo jogo ainda não terminou', async () => {
    mockUsuario(usuario({ palpites: [palpite()] }));
    mockGetAllJogos.mockReturnValue([jogoFinalizado({ status: 'agendado', placar_casa: null, placar_fora: null })]);

    await apurarPalpitesPendentes();

    expect(capturedUpdates).toBeUndefined();
  });

  it('ignora palpites que já não estão mais "Pendente"', async () => {
    mockUsuario(usuario({ palpites: [palpite({ status: 'Acertou' })] }));
    mockGetAllJogos.mockReturnValue([jogoFinalizado()]);

    await apurarPalpitesPendentes();

    expect(capturedUpdates).toBeUndefined();
  });

  it('ignora palpite cujo jogo correspondente não existe mais na tabela', async () => {
    mockUsuario(usuario({ palpites: [palpite({ id_palpite: 'jogo-fantasma' })] }));
    mockGetAllJogos.mockReturnValue([jogoFinalizado()]);

    await apurarPalpitesPendentes();

    expect(capturedUpdates).toBeUndefined();
  });

  it('soma pontos de múltiplos palpites finalizados num único update', async () => {
    mockUsuario(
      usuario({
        pontos: 10,
        palpites: [
          palpite({ id_palpite: 'jogo-1' }),
          palpite({ id_palpite: 'jogo-2', ganhador_empate: 'Argentina', placar_time_1: 0, placar_time_2: 0 }),
        ],
      })
    );
    mockGetAllJogos.mockReturnValue([
      jogoFinalizado({ id: 'jogo-1' }),
      jogoFinalizado({ id: 'jogo-2', placar_casa: 2, placar_fora: 1 }),
    ]);

    await apurarPalpitesPendentes();

    expect(capturedUpdates).toEqual({
      palpites: [
        expect.objectContaining({ id_palpite: 'jogo-1', status: 'Acertou' }),
        expect.objectContaining({ id_palpite: 'jogo-2', status: 'Errou' }),
      ],
      pontos: 10 + 700,
    });
  });
});
