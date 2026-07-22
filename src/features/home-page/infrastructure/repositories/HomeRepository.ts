import { IHomeRepository } from '../../domain/repositories/IHomeRepository';
import { HomeData, FeaturedMatch } from '../../domain/entities/HomeData';
import { localDb } from '@/shareds/infrastructure/storage/localDb';
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
        const jogos = localDb.getJogos() as any[];

        // Find featured match: prefer live, then first upcoming
        const live = jogos.find((j: any) => j.status === 'ao_vivo' && j.timeCasaId && j.timeForaId);
        const upcoming = jogos.find((j: any) => j.status === 'agendado' && j.timeCasaId && j.timeForaId);
        const raw = live ?? upcoming;

        let featuredMatch: FeaturedMatch | null = null;
        if (raw) {
          featuredMatch = {
            id: raw.id,
            timeCasaId: raw.timeCasaId,
            timeForaId: raw.timeForaId,
            timeCasaNome: getTeamName(raw.timeCasaId),
            timeForaNome: getTeamName(raw.timeForaId),
            flagCasa: getFlagUrl(raw.timeCasaId),
            flagFora: getFlagUrl(raw.timeForaId),
            placarCasa: raw.placarCasa,
            placarFora: raw.placarFora,
            status: raw.status,
            minuto: raw.minuto ?? null,
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
