import { deleteUser } from 'firebase/auth';
import { IProfileRepository } from '../../domain/repositories/IProfileRepository';
import { AVATARES_DISPONIVEIS, BettingStats, Profile } from '../../domain/entities/Profile';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { auth } from '@/shareds/infrastructure/firebase/firebaseClient';
import { getJogadoresTotal } from '@/shareds/infrastructure/sqlite/jogadoresQueries';

function calcularEstatisticasApostas(palpites: { status: string }[]): BettingStats {
  const stats: BettingStats = { total: palpites.length, acertos: 0, erros: 0, pendentes: 0 };
  for (const p of palpites) {
    const status = p.status.trim();
    if (status === 'Acertou') stats.acertos += 1;
    else if (status === 'Errou') stats.erros += 1;
    else stats.pendentes += 1;
  }
  return stats;
}

export class ProfileRepository implements IProfileRepository {
  async getProfile(): Promise<Profile | null> {
    const usuario = await UsuarioRepository.getUsuario();
    if (!usuario) return null;

    const total = getJogadoresTotal();
    const collected = usuario.album_jogador?.length ?? 0;

    return {
      nome: usuario.nome,
      email: usuario.email,
      avatarUrl: usuario.foto_url || AVATARES_DISPONIVEIS[0],
      pontos: usuario.pontos ?? 0,
      figurinhasColetadas: collected,
      figurinhasTotal: total,
      percentualFigurinhas: total > 0 ? parseFloat(((collected / total) * 100).toFixed(1)) : 0,
      estatisticasApostas: calcularEstatisticasApostas(usuario.palpites ?? []),
    };
  }

  async updateNome(nome: string): Promise<void> {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      throw new Error('O nome não pode ficar vazio.');
    }
    await UsuarioRepository.updateUsuario({ nome: nomeLimpo });
  }

  async updateAvatar(avatarUrl: string): Promise<void> {
    await UsuarioRepository.updateUsuario({ foto_url: avatarUrl });
  }

  async deleteAccount(): Promise<void> {
    await UsuarioRepository.deleteUsuario();
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
  }
}
