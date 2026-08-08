import { JogoRow } from '@/shareds/infrastructure/sqlite/jogosQueries';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';
import { Match } from '../../domain/entities/Match';

// JogoRow.fase/status sao `string` (a tabela SQLite nao restringe valores) --
// o dominio Match usa unions literais mais estreitas; o cast aqui e
// explicito (era implicito via `any` no JSON original).
//
// Compartilhado entre BettingRepository (betting-page) e
// MatchScheduleRepository (match-schedule-page), que mapeiam a mesma linha
// SQLite pro mesmo shape `Match` (ver GroupSchedule.ts).
export function mapJogoToMatch(j: JogoRow, palpiteIds: Set<string>): Match {
  return {
    id: j.id,
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
  };
}
