import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/shareds/infrastructure/firebase/firebaseClient';
import { UsuarioFirestore } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { isMaiorDeIdadePorDataISO } from '@/shareds/domain/idade';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { CredenciaisLogin, DadosCadastro } from '../../domain/entities/Credenciais';

function dataParaISO(dataNascimento: string): string {
  const [dia, mes, ano] = dataNascimento.split('/');
  return `${ano}-${mes}-${dia}`;
}

export class AuthRepository implements IAuthRepository {
  async entrar({ email, senha }: CredenciaisLogin): Promise<void> {
    await signInWithEmailAndPassword(auth, email, senha);
  }

  async cadastrar({ nome, email, senha, dataNascimento }: DadosCadastro): Promise<void> {
    const credential = await createUserWithEmailAndPassword(auth, email, senha);
    await updateProfile(credential.user, { displayName: nome });

    const dataNascimentoISO = dataParaISO(dataNascimento);
    const novoUsuario: UsuarioFirestore = {
      nome,
      email,
      data_nascimento: dataNascimentoISO,
      maior_idade: isMaiorDeIdadePorDataISO(dataNascimentoISO),
      pontos: 0,
      qtd_pacote_aberto: 0,
      qtd_pacotes: 0,
      conquistas: [],
      album_jogador: [],
      palpites: [],
    };

    await setDoc(doc(db, 'usuario', credential.user.uid), {
      ...novoUsuario,
      ultima_atividade: serverTimestamp(),
      criado_em: serverTimestamp(),
    });
  }

  async sair(): Promise<void> {
    await signOut(auth);
  }

  async redefinirSenha(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }
}
