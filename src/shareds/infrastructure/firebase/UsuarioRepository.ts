import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
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
  album_jogador: number[];
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
  async getUsuario(): Promise<UsuarioFirestore | null> {
    const snapshot = await getDoc(usuarioDocRef());
    return snapshot.exists() ? (snapshot.data() as UsuarioFirestore) : null;
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
