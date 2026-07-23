import { collection, deleteDoc, doc, getDoc, getDocFromServer, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebaseClient';

export interface PalpiteFirestore {
  id_palpite: string;
  ganhador_empate: string;
  primeiro_time_marcar: string;
  placar_time_1: number;
  placar_time_2: number;
  status: string;
}

export interface UsuarioFirestore {
  nome: string;
  email: string;
  data_nascimento: string;
  maior_idade: boolean;
  pontos: number;
  qtd_pacote_aberto: number;
  qtd_pacotes: number;
  conquistas: number[];
  album_jogador: string[];
  palpites: PalpiteFirestore[];
  foto_url?: string;
}

export interface UsuarioComId extends UsuarioFirestore {
  id: string;
}

function usuarioDocRef() {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Nenhum usuário autenticado.');
  }
  return doc(db, 'usuario', uid);
}

export const UsuarioRepository = {
  // Visitante (sem login real, so sessao anonima) ou sessao ainda nao
  // resolvida: retorna null em vez de lancar, para as telas publicas
  // (Home, Times, Palpite, Ranking) nao ficarem presas no loading.
  async getUsuario(): Promise<UsuarioFirestore | null> {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.isAnonymous) {
      return null;
    }
    const ref = doc(db, 'usuario', currentUser.uid);
    // getDocFromServer em vez de getDoc: logo apos o login, o heartbeat
    // (useAuthHeartbeat) dispara quase no mesmo instante um setDoc/merge
    // no mesmo documento, e o getDoc "default" pode devolver a view local
    // (cache + mutacao pendente) antes do documento completo ter sido
    // buscado do servidor nessa sessao -- isso fazia o perfil aparecer
    // zerado logo apos o login, voltando ao normal so ao reabrir a tela.
    // Cai para getDoc (cache) apenas se realmente estiver offline.
    try {
      const snapshot = await getDocFromServer(ref);
      return snapshot.exists() ? (snapshot.data() as UsuarioFirestore) : null;
    } catch {
      const snapshot = await getDoc(ref);
      return snapshot.exists() ? (snapshot.data() as UsuarioFirestore) : null;
    }
  },

  async updateUsuario(partial: Partial<UsuarioFirestore>): Promise<void> {
    await updateDoc(usuarioDocRef(), partial as Record<string, unknown>);
  },

  // Usado pelo rank: todos os usuarios da colecao, do maior para o menor pontos.
  async listarUsuariosPorPontos(): Promise<UsuarioComId[]> {
    const snapshot = await getDocs(query(collection(db, 'usuario'), orderBy('pontos', 'desc')));
    return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as UsuarioFirestore) }));
  },

  async deleteUsuario(): Promise<void> {
    await deleteDoc(usuarioDocRef());
  },
};

export function usuarioAtualDocId(): string | undefined {
  return auth.currentUser?.uid;
}
