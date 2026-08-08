import { RankData, PlayerRank } from '../../domain/entities/Rank';
import { UsuarioComId, UsuarioRepository, usuarioAtualDocId } from '@/shareds/infrastructure/firebase/UsuarioRepository';

// Avatar padrao do HeaderWidget -- usado aqui sempre que a entrada do rank
// for o proprio usuario logado, pra foto/nome/pontos baterem com o header
// em qualquer lugar que ele apareça (podio, lista ou card de destaque).
const AVATAR_PADRAO = 'https://i.pravatar.cc/150?img=11';

// Quantos jogadores aparecem na tela (podio + lista) -- a cor de cada
// posicao e decidida na apresentacao (RankScreen), nao aqui.
const MAX_LISTADOS = 53;

function toPlayerRank(usuario: UsuarioComId, posicao: number, meuDocId?: string): PlayerRank {
  const souEu = usuario.id === meuDocId;
  return {
    id: posicao,
    name: usuario.nome,
    points: `${(usuario.pontos ?? 0).toLocaleString('pt-BR')} PTS`,
    position: posicao,
    avatar: souEu ? AVATAR_PADRAO : `https://i.pravatar.cc/150?u=${encodeURIComponent(usuario.nome)}`,
  };
}

export class RankRepository {
  async getRankData(): Promise<RankData> {
    const meuDocId = usuarioAtualDocId();
    const [usuarios, meuUsuario] = await Promise.all([
      UsuarioRepository.listarTopUsuariosPorPontos(MAX_LISTADOS),
      UsuarioRepository.getUsuario(),
    ]);

    // A posicao real (1, 2, 3, 4...) precisa vir do indice no array
    // completo, nao do indice dentro do slice -- senao a lista de "outros"
    // reinicia a contagem em 1 em vez de continuar em 4.
    const topPlayers = usuarios.slice(0, 3).map((u, i) => toPlayerRank(u, i + 1, meuDocId));
    const otherPlayers = usuarios.slice(3, MAX_LISTADOS).map((u, i) => toPlayerRank(u, i + 4, meuDocId));

    // Se o usuario logado estiver fora do top listado, sua posicao vem de
    // uma contagem agregada (nao precisa baixar a colecao inteira).
    const indiceNaLista = usuarios.findIndex((u) => u.id === meuDocId);
    let minhaPosicao = 0;
    if (indiceNaLista >= 0) {
      minhaPosicao = indiceNaLista + 1;
    } else if (meuUsuario) {
      const maisPontuados = await UsuarioRepository.contarUsuariosComMaisPontosQue(meuUsuario.pontos ?? 0);
      minhaPosicao = maisPontuados + 1;
    }

    const currentUser: PlayerRank = {
      id: 999,
      name: 'Você',
      points: `${(meuUsuario?.pontos ?? 0).toLocaleString('pt-BR')} PTS`,
      position: minhaPosicao,
      avatar: AVATAR_PADRAO,
    };

    return { topPlayers, currentUser, otherPlayers };
  }
}
