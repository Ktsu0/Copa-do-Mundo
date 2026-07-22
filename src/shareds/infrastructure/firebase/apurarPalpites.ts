import { localDb } from '@/shareds/infrastructure/storage/localDb';
import { PalpiteFirestore, UsuarioRepository } from './UsuarioRepository';
import timesDetalhesData from '../../../infra/times_detalhes.json';

const PONTOS_PLACAR_EXATO = 500;
const PONTOS_VENCEDOR = 200;

// Observacao: os jogos (src/infra/jogos.json) nao guardam quem marcou o
// primeiro gol, entao nao ha como apurar o palpite de "primeiro time a
// marcar" (BET_REWARDS.primeiroMarcar fica sem uso ate essa informacao
// existir em algum lugar).

function getTeamName(timeId: string): string {
  const found = (timesDetalhesData as any[]).find((t) => t.id === timeId);
  return found ? found.nome : timeId;
}

function resultadoReal(jogo: any): 'casa' | 'fora' | 'empate' {
  if (jogo.placarCasa > jogo.placarFora) return 'casa';
  if (jogo.placarCasa < jogo.placarFora) return 'fora';
  return 'empate';
}

function apurarPalpite(palpite: PalpiteFirestore, jogo: any): number {
  let pontos = 0;

  if (palpite.placar_time_1 === jogo.placarCasa && palpite.placar_time_2 === jogo.placarFora) {
    pontos += PONTOS_PLACAR_EXATO;
  }

  const resultado = resultadoReal(jogo);
  const nomeVencedor = resultado === 'empate'
    ? 'Empate'
    : getTeamName(resultado === 'casa' ? jogo.timeCasaId : jogo.timeForaId);

  if (palpite.ganhador_empate === nomeVencedor) {
    pontos += PONTOS_VENCEDOR;
  }

  return pontos;
}

// Roda no boot do app: credita pontos dos palpites cujo jogo ja terminou e
// que ainda estao com status "Pendente", e marca cada um como
// "Acertou"/"Errou" no Firestore.
export async function apurarPalpitesPendentes(): Promise<void> {
  const usuario = await UsuarioRepository.getUsuario();
  if (!usuario?.palpites?.length) return;

  const jogos = localDb.getJogos() as any[];
  let pontosGanhos = 0;
  let mudou = false;

  const palpitesAtualizados = usuario.palpites.map((palpite) => {
    if (palpite.status.trim() !== 'Pendente') return palpite;

    const jogo = jogos.find((j) => j.id === palpite.id_palpite);
    if (!jogo || jogo.status !== 'finalizado' || jogo.placarCasa == null || jogo.placarFora == null) {
      return palpite;
    }

    const pontos = apurarPalpite(palpite, jogo);
    pontosGanhos += pontos;
    mudou = true;

    return { ...palpite, status: pontos > 0 ? 'Acertou' : 'Errou' };
  });

  if (!mudou) return;

  await UsuarioRepository.updateUsuario({
    palpites: palpitesAtualizados,
    pontos: (usuario.pontos ?? 0) + pontosGanhos,
  });
}
