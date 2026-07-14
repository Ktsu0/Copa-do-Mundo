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
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { CredenciaisLogin, DadosCadastro } from '../../domain/entities/Credenciais';

function calcularMaiorIdade(dataNascimento: string): boolean {
  const [dia, mes, ano] = dataNascimento.split('/').map(Number);
  const nascimento = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade--;
  return idade >= 18;
}

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

    const novoUsuario: UsuarioFirestore = {
      nome,
      email,
      data_nascimento: dataParaISO(dataNascimento),
      maior_idade: calcularMaiorIdade(dataNascimento),
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
