import { getAllJogos, JogoRow } from '@/shareds/infrastructure/sqlite/jogosQueries';
import { PalpiteFirestore, UsuarioRepository } from './UsuarioRepository';
import { getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';

const PONTOS_PLACAR_EXATO = 500;
const PONTOS_VENCEDOR = 200;

// Observacao: os jogos (tabela sqlite `jogos`) nao guardam quem marcou o
// primeiro gol, entao nao ha como apurar o palpite de "primeiro time a
// marcar" (BET_REWARDS.primeiroMarcar fica sem uso ate essa informacao
// existir em algum lugar).

function resultadoReal(jogo: JogoRow): 'casa' | 'fora' | 'empate' {
  if ((jogo.placar_casa ?? 0) > (jogo.placar_fora ?? 0)) return 'casa';
  if ((jogo.placar_casa ?? 0) < (jogo.placar_fora ?? 0)) return 'fora';
  return 'empate';
}

function apurarPalpite(palpite: PalpiteFirestore, jogo: JogoRow): number {
  let pontos = 0;

  if (palpite.placar_time_1 === jogo.placar_casa && palpite.placar_time_2 === jogo.placar_fora) {
    pontos += PONTOS_PLACAR_EXATO;
  }

  const resultado = resultadoReal(jogo);
  const nomeVencedor = resultado === 'empate'
    ? 'Empate'
    : getTeamName(resultado === 'casa' ? jogo.time_casa_id : jogo.time_fora_id);

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

  const jogos = getAllJogos();
  let pontosGanhos = 0;
  let mudou = false;

  const palpitesAtualizados = usuario.palpites.map((palpite) => {
    if (palpite.status.trim() !== 'Pendente') return palpite;

    const jogo = jogos.find((j) => j.id === palpite.id_palpite);
    if (!jogo || jogo.status !== 'finalizado' || jogo.placar_casa == null || jogo.placar_fora == null) {
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
