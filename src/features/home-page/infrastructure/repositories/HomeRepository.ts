import { IHomeRepository } from '../../domain/repositories/IHomeRepository';
import { HomeData, FeaturedMatch } from '../../domain/entities/HomeData';
import { getAllJogos } from '@/shareds/infrastructure/sqlite/jogosQueries';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';

// Returns seconds remaining until next day at 09:00 for daily reward countdown
function getDailyCountdown(): number {
  const now = new Date();
  const next = new Date(now);
  next.setDate(next.getDate() + (now.getHours() >= 9 ? 1 : 0));
  next.setHours(9, 0, 0, 0);
  return Math.floor((next.getTime() - now.getTime()) / 1000);
}

export class HomeRepository implements IHomeRepository {
  async getHomeData(): Promise<HomeData> {
    const usuario = await UsuarioRepository.getUsuario();

    return new Promise((resolve) => {
      setTimeout(() => {
        const jogos = getAllJogos();

        // Find featured match: prefer live, then first upcoming
        const live = jogos.find((j) => j.status === 'ao_vivo' && j.time_casa_id && j.time_fora_id);
        const upcoming = jogos.find((j) => j.status === 'agendado' && j.time_casa_id && j.time_fora_id);
        const raw = live ?? upcoming;

        let featuredMatch: FeaturedMatch | null = null;
        if (raw) {
          featuredMatch = {
            id: raw.id,
            timeCasaId: raw.time_casa_id!,
            timeForaId: raw.time_fora_id!,
            timeCasaNome: getTeamName(raw.time_casa_id),
            timeForaNome: getTeamName(raw.time_fora_id),
            flagCasa: getFlagUrl(raw.time_casa_id),
            flagFora: getFlagUrl(raw.time_fora_id),
            placarCasa: raw.placar_casa,
            placarFora: raw.placar_fora,
            status: raw.status,
            minuto: null,
          };
        }

        resolve({
          userName: usuario?.nome ?? 'Usuário',
          userPoints: usuario?.pontos ?? 0,
          pacotinhosDisponiveis: usuario?.qtd_pacotes ?? 0,
          dailyReward: {
            available: true,
            countdownSeconds: getDailyCountdown(),
            packetType: 'Pacote de Ouro',
            cardsCount: 3,
          },
          featuredMatch,
        });
      }, 250);
    });
  }
}
