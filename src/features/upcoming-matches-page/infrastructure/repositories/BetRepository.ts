import { IBetRepository } from '../../domain/repositories/IBetRepository';
import { Bet, BetChoice, MatchDetail } from '../../domain/entities/Bet';
import { localDb } from '@/shareds/infrastructure/storage/localDb';
import { PalpiteFirestore, UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';

export class BetRepository implements IBetRepository {
  async getMatchForBet(jogoId: string): Promise<MatchDetail | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const jogos = localDb.getJogos() as any[];
        const jogo = jogos.find((j: any) => j.id === jogoId);
        if (!jogo || !jogo.timeCasaId || !jogo.timeForaId) {
          resolve(null);
          return;
        }
        resolve({
          id: jogo.id,
          fase: jogo.fase,
          data: jogo.data,
          status: jogo.status,
          timeCasaId: jogo.timeCasaId,
          timeForaId: jogo.timeForaId,
          timeCasaNome: getTeamName(jogo.timeCasaId),
          timeForaNome: getTeamName(jogo.timeForaId),
          timeCasaFlagUrl: getFlagUrl(jogo.timeCasaId),
          timeForaFlagUrl: getFlagUrl(jogo.timeForaId),
          placarCasa: jogo.placarCasa,
          placarFora: jogo.placarFora,
        });
      }, 200);
    });
  }

  async getBetForMatch(jogoId: string): Promise<Bet | null> {
    const jogos = localDb.getJogos() as any[];
    const jogo = jogos.find((j: any) => j.id === jogoId);
    if (!jogo) return null;

    const usuario = await UsuarioRepository.getUsuario();
    const palpite = usuario?.palpites?.find((p) => p.id_palpite === jogoId);
    if (!palpite) return null;

    const timeCasaNome = getTeamName(jogo.timeCasaId);
    const timeForaNome = getTeamName(jogo.timeForaId);

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
    const jogos = localDb.getJogos() as any[];
    const jogo = jogos.find((j: any) => j.id === bet.jogoId);
    if (!jogo || jogo.status !== 'agendado') {
      return false;
    }

    const usuario = await UsuarioRepository.getUsuario();
    if (!usuario) return false;

    const timeCasaNome = getTeamName(jogo.timeCasaId);
    const timeForaNome = getTeamName(jogo.timeForaId);

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
