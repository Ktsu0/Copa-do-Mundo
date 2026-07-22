import { TimeDetalhe } from '../../domain/entities/TimeDetalhe';
import { ITeamDetailRepository } from '../../domain/repositories/ITeamDetailRepository';
import { getFlagUrl } from '@/shareds/infrastructure/teams/timeHelpers';
import timesDetalhesData from '../../../../infra/times_detalhes.json';
import faseGrupoData from '../../../../infra/fase_grupo.json';
import figurinhasData from '../../../../infra/figurinhas.json';

class TeamDetailRepository implements ITeamDetailRepository {
  async getTeamDetail(id: string): Promise<TimeDetalhe | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const upperId = id.toUpperCase();
        const teamData = timesDetalhesData.find(t => t.id === upperId);
        
        if (!teamData) {
          resolve(null);
          return;
        }

        const fase = faseGrupoData.find(f => f.timeId === upperId);
        
        const bandeiraUrl = teamData.escudoUrl || getFlagUrl(upperId, 640);
        
        let titulosInfo = `${teamData.titulosCopaDoMundo} Títulos Mundiais`;
        if (teamData.titulosCopaDoMundo === 1) titulosInfo = `1 Título Mundial`;
        
        const elenco = figurinhasData
          .filter(f => f.timeId === upperId)
          .map((f, index) => ({
            id: f.id,
            nome: f.jogadorNome,
            posicao: f.posicao === 'GOL' ? 'Goleiro' : f.posicao === 'ZAG' ? 'Zagueiro' : f.posicao === 'LAT' ? 'Lateral' : f.posicao === 'MEI' ? 'Meio-Campo' : 'Atacante',
            numero: String(index + 1).padStart(2, '0'),
            fotoUrl: `https://i.pravatar.cc/150?u=${f.id}`,
          }));

        const detail: TimeDetalhe = {
          id: id.toLowerCase(),
          nome: teamData.nome,
          bandeiraUrl,
          titulosInfo,
          federacao: teamData.confederacao,
          isFavorito: upperId === 'BRA',
          estatisticas: {
            jogadores: teamData.jogadoresConvocados,
            rankingFifa: 'N/A', // Mocking FIFA ranking as N/A since it's not in the JSON
            grupo: fase ? `Grupo ${fase.grupo}` : 'N/A',
          },
          elenco,
        };

        resolve(detail);
      }, 500);
    });
  }
}

export const mockTeamDetailRepository = new TeamDetailRepository();
