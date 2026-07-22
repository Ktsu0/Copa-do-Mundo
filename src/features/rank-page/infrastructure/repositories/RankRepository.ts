import { RankData, PlayerRank } from '../../domain/entities/Rank';
import { UsuarioComId, UsuarioRepository, usuarioAtualDocId } from '@/shareds/infrastructure/firebase/UsuarioRepository';

// Avatar padrao do HeaderWidget -- usado aqui sempre que a entrada do rank
// for o proprio usuario logado, pra foto/nome/pontos baterem com o header
// em qualquer lugar que ele apareça (podio, lista ou card de destaque).
const AVATAR_PADRAO = 'https://i.pravatar.cc/150?img=11';

function toPlayerRank(usuario: UsuarioComId, posicao: number, meuDocId?: string): PlayerRank {
  const souEu = usuario.id === meuDocId;
  return {
    id: posicao,
    name: usuario.nome,
    points: `${(usuario.pontos ?? 0).toLocaleString('pt-BR')} PTS`,
    position: posicao,
    avatar: souEu ? AVATAR_PADRAO : `https://i.pravatar.cc/150?u=${encodeURIComponent(usuario.nome)}`,
    color: posicao === 1 ? '#FFD700' : posicao === 2 ? '#D3D3D3' : posicao === 3 ? '#CD7F32' : undefined,
  };
}

export class RankRepository {
  async getRankData(): Promise<RankData> {
    const usuarios = await UsuarioRepository.listarUsuariosPorPontos();
    const meuDocId = usuarioAtualDocId();

    // A posicao real (1, 2, 3, 4...) precisa vir do indice no array
    // completo, nao do indice dentro do slice -- senao a lista de "outros"
    // reinicia a contagem em 1 em vez de continuar em 4.
    const topPlayers = usuarios.slice(0, 3).map((u, i) => toPlayerRank(u, i + 1, meuDocId));
    const otherPlayers = usuarios.slice(3, 53).map((u, i) => toPlayerRank(u, i + 4, meuDocId));

    const minhaPosicao = usuarios.findIndex((u) => u.id === meuDocId);
    const meuUsuario = minhaPosicao >= 0 ? usuarios[minhaPosicao] : null;

    const currentUser: PlayerRank = {
      id: 999,
      name: 'Você',
      points: `${(meuUsuario?.pontos ?? 0).toLocaleString('pt-BR')} PTS`,
      position: minhaPosicao >= 0 ? minhaPosicao + 1 : usuarios.length + 1,
      avatar: AVATAR_PADRAO,
    };

    return { topPlayers, currentUser, otherPlayers };
  }
}
