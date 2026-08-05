import { IBetRepository } from '../../domain/repositories/IBetRepository';
import { Bet, BetChoice, MatchDetail } from '../../domain/entities/Bet';
import { getJogoById } from '@/shareds/infrastructure/sqlite/jogosQueries';
import { initDb } from '@/shareds/infrastructure/sqlite/db';
import { PalpiteFirestore, UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';
import { isMaiorDeIdadePorDataISO } from '@/shareds/domain/idade';
import { delay } from '@/shareds/infrastructure/utils/delay';

export class BetRepository implements IBetRepository {
  async getMatchForBet(jogoId: string): Promise<MatchDetail | null> {
    await delay(200);
    await initDb();
    const jogo = getJogoById(jogoId);
    if (!jogo || !jogo.time_casa_id || !jogo.time_fora_id) {
      return null;
    }
    return {
      id: jogo.id,
      fase: jogo.fase,
      data: jogo.data,
      status: jogo.status,
      timeCasaId: jogo.time_casa_id,
      timeForaId: jogo.time_fora_id,
      timeCasaNome: getTeamName(jogo.time_casa_id),
      timeForaNome: getTeamName(jogo.time_fora_id),
      timeCasaFlagUrl: getFlagUrl(jogo.time_casa_id),
      timeForaFlagUrl: getFlagUrl(jogo.time_fora_id),
      placarCasa: jogo.placar_casa,
      placarFora: jogo.placar_fora,
    };
  }

  async getBetForMatch(jogoId: string): Promise<Bet | null> {
    await initDb();
    const jogo = getJogoById(jogoId);
    if (!jogo) return null;

    const usuario = await UsuarioRepository.getUsuario();
    const palpite = usuario?.palpites?.find((p) => p.id_palpite === jogoId);
    if (!palpite) return null;

    const timeCasaNome = getTeamName(jogo.time_casa_id);
    const timeForaNome = getTeamName(jogo.time_fora_id);

    return {
      jogoId,
      placarCasa: palpite.placar_time_1,
      placarFora: palpite.placar_time_2,
      primeiroMarcar: teamNameToChoice(palpite.primeiro_time_marcar, timeCasaNome, timeForaNome),
      vencedor: teamNameToChoice(palpite.ganhador_empate, timeCasaNome, timeForaNome),
    };
  }

  // Consulta pura de dado -- quem decide se isso bloqueia o palpite e o
  // caso de uso (SaveBetUseCase), nao o repositorio.
  async isUsuarioMaiorDeIdade(): Promise<boolean> {
    const usuario = await UsuarioRepository.getUsuario();
    if (!usuario?.data_nascimento) return true;
    return isMaiorDeIdadePorDataISO(usuario.data_nascimento);
  }

  async saveBet(bet: Bet): Promise<boolean> {
    await initDb();
    const jogo = getJogoById(bet.jogoId);
    if (!jogo || jogo.status !== 'agendado') {
      return false;
    }

    const timeCasaNome = getTeamName(jogo.time_casa_id);
    const timeForaNome = getTeamName(jogo.time_fora_id);

    const novoPalpite: PalpiteFirestore = {
      id_palpite: bet.jogoId,
      ganhador_empate: choiceToTeamName(bet.vencedor, timeCasaNome, timeForaNome),
      primeiro_time_marcar: choiceToTeamName(bet.primeiroMarcar, timeCasaNome, timeForaNome),
      placar_time_1: bet.placarCasa,
      placar_time_2: bet.placarFora,
      status: 'Pendente',
    };

    // Ler e regravar `palpites` dentro da transacao evita que salvar duas
    // apostas em sequencia rapida (ou uma apuracao concorrente) faca uma
    // escrita apagar a outra.
    try {
      return await UsuarioRepository.transacao((usuario) => {
        const palpites = usuario.palpites ? [...usuario.palpites] : [];
        const idx = palpites.findIndex((p) => p.id_palpite === bet.jogoId);
        if (idx >= 0) {
          palpites[idx] = novoPalpite;
        } else {
          palpites.push(novoPalpite);
        }
        return { result: true, updates: { palpites } };
      });
    } catch {
      return false;
    }
  }
}

function choiceToTeamName(choice: BetChoice | null, timeCasaNome: string, timeForaNome: string): string {
  if (choice === 'casa') return timeCasaNome;
  if (choice === 'fora') return timeForaNome;
  return 'Empate';
}

function teamNameToChoice(value: string | undefined, timeCasaNome: string, timeForaNome: string): BetChoice | null {
  if (!value) return null;
  if (value === timeCasaNome) return 'casa';
  if (value === timeForaNome) return 'fora';
  return 'empate';
}
