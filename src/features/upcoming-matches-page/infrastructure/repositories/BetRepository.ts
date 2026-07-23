import { IBetRepository } from '../../domain/repositories/IBetRepository';
import { Bet, BetChoice, MatchDetail } from '../../domain/entities/Bet';
import { getJogoById } from '@/shareds/infrastructure/sqlite/jogosQueries';
import { PalpiteFirestore, UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';

export class BetRepository implements IBetRepository {
  async getMatchForBet(jogoId: string): Promise<MatchDetail | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const jogo = getJogoById(jogoId);
        if (!jogo || !jogo.time_casa_id || !jogo.time_fora_id) {
          resolve(null);
          return;
        }
        resolve({
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
        });
      }, 200);
    });
  }

  async getBetForMatch(jogoId: string): Promise<Bet | null> {
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
    return usuario?.maior_idade !== false;
  }

  async saveBet(bet: Bet): Promise<boolean> {
    const jogo = getJogoById(bet.jogoId);
    if (!jogo || jogo.status !== 'agendado') {
      return false;
    }

    const usuario = await UsuarioRepository.getUsuario();
    if (!usuario) return false;

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

    const palpites = usuario.palpites ? [...usuario.palpites] : [];
    const idx = palpites.findIndex((p) => p.id_palpite === bet.jogoId);
    if (idx >= 0) {
      palpites[idx] = novoPalpite;
    } else {
      palpites.push(novoPalpite);
    }

    await UsuarioRepository.updateUsuario({ palpites });
    return true;
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
