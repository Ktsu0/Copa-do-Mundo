import { IBettingRepository } from '../../domain/repositories/IBettingRepository';
import { Match, MatchFilter } from '../../domain/entities/Match';
import { localDb } from '@/shareds/infrastructure/storage/localDb';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';

export class BettingRepository implements IBettingRepository {
  async getMatches(filtro: MatchFilter): Promise<Match[]> {
    const usuario = await UsuarioRepository.getUsuario();
    const palpiteIds = new Set((usuario?.palpites ?? []).map((p) => p.id_palpite));

    return new Promise((resolve) => {
      setTimeout(() => {
        const jogos = localDb.getJogos() as any[];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const filtered = jogos.filter((j: any) => {
          if (j.status === 'aguardando_definicao') return false;
          if (!j.timeCasaId || !j.timeForaId) return false;

          if (filtro === 'hoje') {
            if (!j.data) return false;
            const jDate = new Date(j.data);
            return jDate >= today && jDate < tomorrow;
          }
          return j.fase === filtro;
        });

        // If "hoje" has no matches, fallback to showing all agendado + ao_vivo
        const source = (filtro === 'hoje' && filtered.length === 0)
          ? jogos.filter((j: any) => (j.status === 'agendado' || j.status === 'ao_vivo') && j.timeCasaId && j.timeForaId).slice(0, 6)
          : filtered;

        const matches: Match[] = source.map((j: any) => ({
          id: j.id,
          fase: j.fase,
          data: j.data,
          status: j.status,
          timeCasaId: j.timeCasaId,
          timeForaId: j.timeForaId,
          timeCasaNome: getTeamName(j.timeCasaId),
          timeForaNome: getTeamName(j.timeForaId),
          timeCasaFlagUrl: getFlagUrl(j.timeCasaId),
          timeForaFlagUrl: getFlagUrl(j.timeForaId),
          placarCasa: j.placarCasa,
          placarFora: j.placarFora,
          temPalpite: palpiteIds.has(j.id),
        }));

        resolve(matches);
      }, 300);
    });
  }
}
