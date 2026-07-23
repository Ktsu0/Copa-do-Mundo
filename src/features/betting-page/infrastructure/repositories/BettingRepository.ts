import { IBettingRepository } from '../../domain/repositories/IBettingRepository';
import { Match, MatchFilter } from '../../domain/entities/Match';
import { getAllJogos } from '@/shareds/infrastructure/sqlite/jogosQueries';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';

export class BettingRepository implements IBettingRepository {
  async getMatches(filtro: MatchFilter): Promise<Match[]> {
    const usuario = await UsuarioRepository.getUsuario();
    const palpiteIds = new Set((usuario?.palpites ?? []).map((p) => p.id_palpite));

    return new Promise((resolve) => {
      setTimeout(() => {
        const jogos = getAllJogos();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const filtered = jogos.filter((j) => {
          if (j.status === 'aguardando_definicao') return false;
          if (!j.time_casa_id || !j.time_fora_id) return false;

          if (filtro === 'hoje') {
            if (!j.data) return false;
            const jDate = new Date(j.data);
            return jDate >= today && jDate < tomorrow;
          }
          return j.fase === filtro;
        });

        // If "hoje" has no matches, fallback to showing all agendado + ao_vivo
        const source = (filtro === 'hoje' && filtered.length === 0)
          ? jogos.filter((j) => (j.status === 'agendado' || j.status === 'ao_vivo') && j.time_casa_id && j.time_fora_id).slice(0, 6)
          : filtered;

        const matches: Match[] = source.map((j) => ({
          id: j.id,
          // JogoRow.fase/status sao `string` (a tabela SQLite nao restringe
          // valores) -- o dominio Match usa unions literais mais estreitas;
          // o JSON original passava por esse mesmo cast implicitamente via
          // `any`, aqui e explicito.
          fase: j.fase as Match['fase'],
          data: j.data,
          status: j.status as Match['status'],
          timeCasaId: j.time_casa_id,
          timeForaId: j.time_fora_id,
          timeCasaNome: getTeamName(j.time_casa_id),
          timeForaNome: getTeamName(j.time_fora_id),
          timeCasaFlagUrl: getFlagUrl(j.time_casa_id),
          timeForaFlagUrl: getFlagUrl(j.time_fora_id),
          placarCasa: j.placar_casa,
          placarFora: j.placar_fora,
          temPalpite: palpiteIds.has(j.id),
        }));

        resolve(matches);
      }, 300);
    });
  }
}
