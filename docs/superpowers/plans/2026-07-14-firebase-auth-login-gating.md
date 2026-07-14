# Autenticação Firebase + Gating de Login — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a sessão anônima fixa por autenticação real (e-mail/senha) via Firebase Auth, com sessão persistente, heartbeat de atividade, telas de Login/Cadastro/Esqueci minha senha, e bloqueio de acesso (gating) para Álbum, Abrir Pacotes, Recompensas, Enviar Palpite e Perfil.

**Architecture:** Um `useAuthStore` (zustand) alimentado por um único listener `onAuthStateChanged` é a fonte única de verdade sobre a sessão (`loading` / `guest` / `authenticated`). Um componente `RequireAuthScreen` bloqueia telas inteiras redirecionando para `/login`; um hook `useRequireAuth` bloqueia ações pontuais (enviar palpite). Um novo feature `auth-page` (clean architecture, mesmo padrão dos demais features) implementa cadastro/login/logout/reset de senha. `UsuarioRepository` passa a usar `auth.currentUser.uid` em vez do documento fixo de dev.

**Tech Stack:** React Native (Expo SDK 57) + Expo Router, Firebase JS SDK 12 (`firebase/auth`, `firebase/firestore`), zustand 5, TypeScript strict.

## Global Constraints

- Ler a documentação versionada exata em https://docs.expo.dev/versions/v57.0.0/ antes de usar qualquer API do Expo (regra do `AGENTS.md` do projeto).
- **Não adicionar nenhuma dependência nova** ao `package.json` — tudo é implementável com `firebase`, `zustand`, `expo-router` e React Native puro já instalados (inclusive o campo de data de nascimento, sem date-picker nativo).
- Seguir exatamente os tokens de `src/shareds/presentation/constants/theme.ts` (`colors`, `spacing`, `radius`, `typography`) e o wrapper `Screen` em todas as telas novas. `StyleSheet.create` — sem NativeWind/Tailwind.
- Nomenclatura de domínio em português, igual ao resto do código (`nome`, `senha`, `cadastrar`, `entrar`, `sair`, `redefinirSenha`, `usuario`).
- **Este projeto não tem framework de testes configurado** (sem Jest, sem Testing Library — confirmado, `package.json` não tem `test` script nem essas dependências). Introduzir um framework de testes está fora de escopo. Cada task usa **TypeScript (`npx tsc --noEmit`) + ESLint (`npm run lint`)** como verificação automática, e a Task final faz um roteiro de verificação manual completo (via Expo Go / `expo start`), no espírito de `superpowers:verification-before-completion`.
- Import paths usam o alias `@/*` → `./src/*` (já configurado em `tsconfig.json` e funcionando em todo o projeto).

## Ação manual no Firebase (fora deste plano — feita por você)

Antes de testar o fluxo de cadastro/login de verdade, configure no Console do Firebase:

1. **Authentication → Sign-in method** → ativar o provedor **E-mail/senha**.
2. **Firestore → Rules** → para a coleção `usuario`:
   ```
   match /usuario/{userId} {
     allow read: if request.auth != null;
     allow create: if request.auth != null
                   && request.auth.uid == userId
                   && request.auth.token.firebase.sign_in_provider != 'anonymous';
     allow update, delete: if request.auth != null
                   && request.auth.uid == userId;
   }
   ```

Sem isso, o cadastro e o login vão falhar com erro de permissão/provedor desabilitado — o resto do plano assume que isso já foi feito antes da Task 20 (verificação manual).

---

### Task 1: `UsuarioRepository` — usar o UID autenticado

**Files:**
- Modify: `src/shareds/infrastructure/firebase/UsuarioRepository.ts`

**Interfaces:**
- Produces: `usuarioAtualDocId(): string | undefined` (agora retorna `auth.currentUser?.uid`, usado por `RankRepository` sem nenhuma mudança nele — o "não encontrado" já era tratado de forma graciosa).

- [ ] **Step 1: Editar o arquivo**

Substituir todo o conteúdo de `src/shareds/infrastructure/firebase/UsuarioRepository.ts` por:

```ts
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
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem novos erros relacionados a este arquivo (outros erros pré-existentes, se houver, não fazem parte desta task).

- [ ] **Step 3: Commit**

```bash
git add src/shareds/infrastructure/firebase/UsuarioRepository.ts
git commit -m "refactor: UsuarioRepository usa uid autenticado em vez do doc fixo de dev"
```

---

### Task 2: Store global de sessão (`useAuthStore`) + limpeza do `firebaseClient`

**Files:**
- Create: `src/shareds/infrastructure/auth/authStore.ts`
- Modify: `src/shareds/infrastructure/firebase/firebaseClient.ts`

**Interfaces:**
- Produces: `useAuthStore` (zustand hook) com estado `{ status: 'loading' | 'guest' | 'authenticated', firebaseUser: FirebaseUser | null }` e ação `initAuth(): void`.
- Consumes: `auth` exportado de `src/shareds/infrastructure/firebase/firebaseClient.ts`.

- [ ] **Step 1: Criar `authStore.ts`**

```ts
import { create } from 'zustand';
import { onAuthStateChanged, signInAnonymously, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/shareds/infrastructure/firebase/firebaseClient';

export type AuthStatus = 'loading' | 'guest' | 'authenticated';

interface AuthState {
  status: AuthStatus;
  firebaseUser: FirebaseUser | null;
  listenerStarted: boolean;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  firebaseUser: null,
  listenerStarted: false,

  initAuth: () => {
    if (get().listenerStarted) return;
    set({ listenerStarted: true });

    onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).catch((err) => {
          console.error('Erro no login anônimo', err);
        });
        return;
      }
      set({
        firebaseUser: user,
        status: user.isAnonymous ? 'guest' : 'authenticated',
      });
    });
  },
}));
```

- [ ] **Step 2: Remover `ensureAnonymousAuth` do `firebaseClient.ts` (a lógica agora vive no store)**

Substituir todo o conteúdo de `src/shareds/infrastructure/firebase/firebaseClient.ts` por:

```ts
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// initializeAuth so lida com persistencia (AsyncStorage) e so pode ser chamado
// uma vez por app; em Fast Refresh ele ja vai estar inicializado, entao caimos
// para getAuth.
export const auth: Auth = (() => {
  try {
    return Platform.OS === 'web'
      ? getAuth(firebaseApp)
      : initializeAuth(firebaseApp, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return getAuth(firebaseApp);
  }
})();

export const db: Firestore = getFirestore(firebaseApp);
```

- [ ] **Step 3: Buscar por usos remanescentes de `ensureAnonymousAuth`**

Run: `grep -rn "ensureAnonymousAuth" src/`
Expected: nenhum resultado (será religado na Task 13, que também remove a chamada antiga do `_layout.tsx`) — se aparecer algo além de `src/app/_layout.tsx`, pare e investigue antes de continuar.

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: o único erro esperado neste ponto é em `src/app/_layout.tsx` (ainda chama `ensureAnonymousAuth`, que não existe mais) — será corrigido na Task 13. Nenhum outro arquivo deve quebrar.

- [ ] **Step 5: Commit**

```bash
git add src/shareds/infrastructure/auth/authStore.ts src/shareds/infrastructure/firebase/firebaseClient.ts
git commit -m "feat: adiciona useAuthStore (zustand) e move o login anônimo para o listener de sessão"
```

---

### Task 3: Heartbeat de atividade (10 em 10 minutos)

**Files:**
- Create: `src/shareds/presentation/hooks/useAuthHeartbeat.ts`

**Interfaces:**
- Consumes: `useAuthStore` (Task 2), `auth`/`db` de `firebaseClient.ts`.
- Produces: hook `useAuthHeartbeat(): void`, chamado uma vez no `_layout.tsx` raiz (Task 13).

- [ ] **Step 1: Criar o hook**

```ts
import { useEffect, useRef } from 'react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/shareds/infrastructure/firebase/firebaseClient';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';

const INTERVALO_HEARTBEAT_MS = 10 * 60 * 1000;

export function useAuthHeartbeat(): void {
  const status = useAuthStore((s) => s.status);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const registrarAtividade = () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      updateDoc(doc(db, 'usuario', uid), { ultima_atividade: serverTimestamp() }).catch((err) => {
        console.error('Erro ao registrar heartbeat', err);
      });
    };

    registrarAtividade();
    intervalRef.current = setInterval(registrarAtividade, INTERVALO_HEARTBEAT_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: nenhum novo erro neste arquivo.

- [ ] **Step 3: Commit**

```bash
git add src/shareds/presentation/hooks/useAuthHeartbeat.ts
git commit -m "feat: adiciona heartbeat de atividade a cada 10 minutos para usuários logados"
```

---

### Task 4: Componentes de gating (`RequireAuthScreen` + `useRequireAuth`)

**Files:**
- Create: `src/shareds/presentation/components/RequireAuthScreen.tsx`
- Create: `src/shareds/presentation/hooks/useRequireAuth.ts`

**Interfaces:**
- Consumes: `useAuthStore` (Task 2).
- Produces: `<RequireAuthScreen>{children}</RequireAuthScreen>` (Task 15) e `useRequireAuth(): { isAuthenticated: boolean; requireAuth: (action: () => void) => void }` (Task 16).

- [ ] **Step 1: Criar `RequireAuthScreen.tsx`**

```tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';
import { theme } from '../constants/theme';

interface RequireAuthScreenProps {
  children: React.ReactNode;
}

export function RequireAuthScreen({ children }: RequireAuthScreenProps) {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === 'guest') {
      router.push('/login');
    }
  }, [status]);

  if (status !== 'authenticated') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

- [ ] **Step 2: Criar `useRequireAuth.ts`**

```ts
import { router } from 'expo-router';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';

export function useRequireAuth() {
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = status === 'authenticated';

  const requireAuth = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      router.push('/login');
    }
  };

  return { isAuthenticated, requireAuth };
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: nenhum novo erro nestes dois arquivos.

- [ ] **Step 4: Commit**

```bash
git add src/shareds/presentation/components/RequireAuthScreen.tsx src/shareds/presentation/hooks/useRequireAuth.ts
git commit -m "feat: adiciona RequireAuthScreen e useRequireAuth para bloquear telas e ações sem login"
```

---

### Task 5: Feature `auth-page` — domínio

**Files:**
- Create: `src/features/auth-page/domain/entities/Credenciais.ts`
- Create: `src/features/auth-page/domain/repositories/IAuthRepository.ts`

**Interfaces:**
- Produces: `CredenciaisLogin { email: string; senha: string }`, `DadosCadastro { nome: string; email: string; senha: string; dataNascimento: string }`, interface `IAuthRepository`.

- [ ] **Step 1: Criar `Credenciais.ts`**

```ts
export interface CredenciaisLogin {
  email: string;
  senha: string;
}

// dataNascimento no formato DD/MM/AAAA (como digitado no formulário).
export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
  dataNascimento: string;
}
```

- [ ] **Step 2: Criar `IAuthRepository.ts`**

```ts
import { CredenciaisLogin, DadosCadastro } from '../entities/Credenciais';

export interface IAuthRepository {
  entrar(credenciais: CredenciaisLogin): Promise<void>;
  cadastrar(dados: DadosCadastro): Promise<void>;
  sair(): Promise<void>;
  redefinirSenha(email: string): Promise<void>;
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: nenhum novo erro.

- [ ] **Step 4: Commit**

```bash
git add src/features/auth-page/domain
git commit -m "feat: entidades e contrato de domínio do feature auth-page"
```

---

### Task 6: Feature `auth-page` — infraestrutura (`AuthRepository` + mensagens de erro)

**Files:**
- Create: `src/features/auth-page/infrastructure/authErrorMessages.ts`
- Create: `src/features/auth-page/infrastructure/repositories/AuthRepository.ts`

**Interfaces:**
- Consumes: `auth`, `db` de `firebaseClient.ts`; `UsuarioFirestore` de `UsuarioRepository.ts`; `IAuthRepository`, `CredenciaisLogin`, `DadosCadastro` da Task 5.
- Produces: `class AuthRepository implements IAuthRepository`, função `mensagemErroAuth(err: unknown): string`.

- [ ] **Step 1: Criar `authErrorMessages.ts`**

```ts
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Esse e-mail já está cadastrado.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
  'auth/operation-not-allowed': 'Cadastro por e-mail/senha não está habilitado. Fale com o suporte.',
};

export function mensagemErroAuth(err: unknown): string {
  const code = (err as { code?: string } | undefined)?.code;
  if (code && FIREBASE_ERROR_MESSAGES[code]) {
    return FIREBASE_ERROR_MESSAGES[code];
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return 'Não foi possível completar a operação. Tente novamente.';
}
```

- [ ] **Step 2: Criar `AuthRepository.ts`**

```ts
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
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: nenhum novo erro.

- [ ] **Step 4: Commit**

```bash
git add src/features/auth-page/infrastructure
git commit -m "feat: AuthRepository (cadastro, login, logout, reset de senha) e tradução de erros do Firebase"
```

---

### Task 7: Feature `auth-page` — casos de uso

**Files:**
- Create: `src/features/auth-page/application/usecases/LoginUseCase.ts`
- Create: `src/features/auth-page/application/usecases/CadastroUseCase.ts`
- Create: `src/features/auth-page/application/usecases/RedefinirSenhaUseCase.ts`

**Interfaces:**
- Consumes: `IAuthRepository`, `CredenciaisLogin`, `DadosCadastro` (Task 5).
- Produces: `class LoginUseCase { execute(c: CredenciaisLogin): Promise<void> }`, `class CadastroUseCase { execute(d: DadosCadastro): Promise<void> }`, `class RedefinirSenhaUseCase { execute(email: string): Promise<void> }`.

- [ ] **Step 1: Criar `LoginUseCase.ts`**

```ts
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { CredenciaisLogin } from '../../domain/entities/Credenciais';

export class LoginUseCase {
  constructor(private repository: IAuthRepository) {}

  async execute(credenciais: CredenciaisLogin): Promise<void> {
    const email = credenciais.email.trim();
    if (!email || !credenciais.senha) {
      throw new Error('Preencha e-mail e senha.');
    }
    await this.repository.entrar({ email, senha: credenciais.senha });
  }
}
```

- [ ] **Step 2: Criar `CadastroUseCase.ts`**

```ts
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { DadosCadastro } from '../../domain/entities/Credenciais';

const DATA_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;

export class CadastroUseCase {
  constructor(private repository: IAuthRepository) {}

  async execute(dados: DadosCadastro): Promise<void> {
    if (!dados.nome.trim()) {
      throw new Error('Informe seu nome completo.');
    }
    if (!dados.email.trim()) {
      throw new Error('Informe seu e-mail.');
    }
    if (dados.senha.length < 6) {
      throw new Error('A senha precisa ter pelo menos 6 caracteres.');
    }
    if (!DATA_REGEX.test(dados.dataNascimento)) {
      throw new Error('Informe a data de nascimento no formato DD/MM/AAAA.');
    }
    await this.repository.cadastrar({ ...dados, nome: dados.nome.trim(), email: dados.email.trim() });
  }
}
```

- [ ] **Step 3: Criar `RedefinirSenhaUseCase.ts`**

```ts
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class RedefinirSenhaUseCase {
  constructor(private repository: IAuthRepository) {}

  async execute(email: string): Promise<void> {
    const emailLimpo = email.trim();
    if (!emailLimpo) {
      throw new Error('Informe seu e-mail.');
    }
    await this.repository.redefinirSenha(emailLimpo);
  }
}
```

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: nenhum novo erro.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth-page/application
git commit -m "feat: casos de uso de login, cadastro e redefinição de senha"
```

---

### Task 8: Feature `auth-page` — hook `useAuth`

**Files:**
- Create: `src/features/auth-page/presentation/hooks/useAuth.ts`

**Interfaces:**
- Consumes: `AuthRepository` (Task 6), `LoginUseCase`/`CadastroUseCase`/`RedefinirSenhaUseCase` (Task 7), `mensagemErroAuth` (Task 6).
- Produces: `useAuth(): { isSubmitting: boolean; error: string | null; login(email: string, senha: string): Promise<boolean>; cadastrar(dados: DadosCadastro): Promise<boolean>; redefinirSenha(email: string): Promise<boolean> }` — usado pelas Tasks 10, 11 e 12.

- [ ] **Step 1: Criar `useAuth.ts`**

```ts
import { useState } from 'react';
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository';
import { LoginUseCase } from '../../application/usecases/LoginUseCase';
import { CadastroUseCase } from '../../application/usecases/CadastroUseCase';
import { RedefinirSenhaUseCase } from '../../application/usecases/RedefinirSenhaUseCase';
import { mensagemErroAuth } from '../../infrastructure/authErrorMessages';
import { DadosCadastro } from '../../domain/entities/Credenciais';

export function useAuth() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, senha: string): Promise<boolean> => {
    setError(null);
    setIsSubmitting(true);
    try {
      const repo = new AuthRepository();
      await new LoginUseCase(repo).execute({ email, senha });
      return true;
    } catch (err) {
      setError(mensagemErroAuth(err));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const cadastrar = async (dados: DadosCadastro): Promise<boolean> => {
    setError(null);
    setIsSubmitting(true);
    try {
      const repo = new AuthRepository();
      await new CadastroUseCase(repo).execute(dados);
      return true;
    } catch (err) {
      setError(mensagemErroAuth(err));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const redefinirSenha = async (email: string): Promise<boolean> => {
    setError(null);
    setIsSubmitting(true);
    try {
      const repo = new AuthRepository();
      await new RedefinirSenhaUseCase(repo).execute(email);
      return true;
    } catch (err) {
      setError(mensagemErroAuth(err));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, error, login, cadastrar, redefinirSenha };
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: nenhum novo erro.

- [ ] **Step 3: Commit**

```bash
git add src/features/auth-page/presentation/hooks/useAuth.ts
git commit -m "feat: hook useAuth orquestrando login, cadastro e reset de senha"
```

---

### Task 9: Componentes visuais compartilhados do auth (`AuthTextField`, `AuthPrimaryButton`)

**Files:**
- Create: `src/features/auth-page/presentation/components/AuthTextField.tsx`
- Create: `src/features/auth-page/presentation/components/AuthPrimaryButton.tsx`

**Interfaces:**
- Produces: `<AuthTextField label icon value onChangeText ...TextInputProps />`, `<AuthPrimaryButton label onPress loading? disabled? variant?="primary"|"secondary" />` — usados pelas Tasks 10, 11, 12.

- [ ] **Step 1: Criar `AuthTextField.tsx`**

```tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/shareds/presentation/constants/theme';

interface AuthTextFieldProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export function AuthTextField({ label, icon, style, ...props }: AuthTextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <Ionicons name={icon} size={18} color={theme.colors.textMuted} style={styles.icon} />
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={theme.colors.textMuted}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: theme.colors.text,
    fontSize: 16,
  },
});
```

- [ ] **Step 2: Criar `AuthPrimaryButton.tsx`**

```tsx
import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '@/shareds/presentation/constants/theme';

interface AuthPrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function AuthPrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: AuthPrimaryButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.button, variant === 'secondary' && styles.buttonSecondary, isDisabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#FFFFFF' : '#0B1221'} />
      ) : (
        <Text style={[styles.buttonText, variant === 'secondary' && styles.buttonTextSecondary]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#3B6FE0',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...theme.typography.body,
    fontWeight: '800',
    color: '#0B1221',
    letterSpacing: 0.5,
  },
  buttonTextSecondary: {
    color: '#FFFFFF',
  },
});
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: nenhum novo erro.

- [ ] **Step 4: Commit**

```bash
git add src/features/auth-page/presentation/components
git commit -m "feat: componentes visuais AuthTextField e AuthPrimaryButton"
```

---

### Task 10: Tela de Login + rota

**Files:**
- Create: `src/features/auth-page/presentation/screens/LoginScreen.tsx`
- Create: `src/app/login.tsx`

**Interfaces:**
- Consumes: `useAuth` (Task 8), `AuthTextField`/`AuthPrimaryButton` (Task 9), `Screen` (existente), `assets/images/logo-glow.png` (existente).

- [ ] **Step 1: Criar `LoginScreen.tsx`**

```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/shareds/presentation/components/Screen';
import { theme } from '@/shareds/presentation/constants/theme';
import { useAuth } from '../hooks/useAuth';
import { AuthTextField } from '../components/AuthTextField';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';

export function LoginScreen() {
  const { isSubmitting, error, login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    const sucesso = await login(email, senha);
    if (sucesso) {
      router.back();
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../../../../assets/images/logo-glow.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.subtitle}>
          Vivencie a emoção do futebol de alto nível. Junte-se ao ArenaX hoje.
        </Text>

        <AuthTextField
          label="E-MAIL OU USUÁRIO"
          icon="mail-outline"
          placeholder="E-mail ou usuário"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <AuthTextField
          label="SENHA"
          icon="lock-closed-outline"
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <AuthPrimaryButton label="Entrar" onPress={handleLogin} loading={isSubmitting} />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OU</Text>
          <View style={styles.dividerLine} />
        </View>

        <AuthPrimaryButton label="Criar Conta" variant="secondary" onPress={() => router.push('/signup')} />

        <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotLink}>
          <Text style={styles.forgotLinkText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logo: {
    width: 160,
    height: 160,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    ...theme.typography.caption,
    marginHorizontal: theme.spacing.md,
  },
  forgotLink: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  forgotLinkText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },
});
```

- [ ] **Step 2: Criar a rota `src/app/login.tsx`**

```tsx
import { LoginScreen } from '@/features/auth-page/presentation/screens/LoginScreen';

export default function LoginRoute() {
  return <LoginScreen />;
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: nenhum novo erro (a rota só é registrada no `Stack` na Task 13, mas o arquivo em si já deve compilar).

- [ ] **Step 4: Commit**

```bash
git add src/features/auth-page/presentation/screens/LoginScreen.tsx src/app/login.tsx
git commit -m "feat: tela de Login seguindo o mockup do ArenaX"
```

---

### Task 11: Tela de Cadastro + rota

**Files:**
- Create: `src/features/auth-page/presentation/screens/SignupScreen.tsx`
- Create: `src/app/signup.tsx`

**Interfaces:**
- Consumes: `useAuth` (Task 8), `AuthTextField`/`AuthPrimaryButton` (Task 9).

- [ ] **Step 1: Criar `SignupScreen.tsx`**

```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/shareds/presentation/components/Screen';
import { theme } from '@/shareds/presentation/constants/theme';
import { useAuth } from '../hooks/useAuth';
import { AuthTextField } from '../components/AuthTextField';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';

function formatarDataNascimento(texto: string): string {
  const digits = texto.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function SignupScreen() {
  const { isSubmitting, error, cadastrar } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [senha, setSenha] = useState('');

  const handleCadastrar = async () => {
    const sucesso = await cadastrar({ nome, email, senha, dataNascimento });
    if (sucesso) {
      router.back();
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Criar Conta</Text>

        <AuthTextField
          label="NOME COMPLETO"
          icon="person-outline"
          placeholder="Nome completo"
          value={nome}
          onChangeText={setNome}
        />
        <AuthTextField
          label="E-MAIL OU USUÁRIO"
          icon="mail-outline"
          placeholder="E-mail ou usuário"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <AuthTextField
          label="DATA DE NASCIMENTO"
          icon="calendar-outline"
          placeholder="DD/MM/AAAA"
          keyboardType="number-pad"
          maxLength={10}
          value={dataNascimento}
          onChangeText={(t) => setDataNascimento(formatarDataNascimento(t))}
        />
        <AuthTextField
          label="SENHA"
          icon="lock-closed-outline"
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <AuthPrimaryButton label="Cadastrar" onPress={handleCadastrar} loading={isSubmitting} />

        <View style={styles.loginLinkRow}>
          <Text style={styles.loginLinkText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.accent,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  loginLinkText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },
  loginLink: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
```

- [ ] **Step 2: Criar a rota `src/app/signup.tsx`**

```tsx
import { SignupScreen } from '@/features/auth-page/presentation/screens/SignupScreen';

export default function SignupRoute() {
  return <SignupScreen />;
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: nenhum novo erro.

- [ ] **Step 4: Commit**

```bash
git add src/features/auth-page/presentation/screens/SignupScreen.tsx src/app/signup.tsx
git commit -m "feat: tela de Cadastro com data de nascimento seguindo o mockup"
```

---

### Task 12: Tela de "Esqueci minha senha" + rota

**Files:**
- Create: `src/features/auth-page/presentation/screens/ForgotPasswordScreen.tsx`
- Create: `src/app/forgot-password.tsx`

**Interfaces:**
- Consumes: `useAuth` (Task 8), `AuthTextField`/`AuthPrimaryButton` (Task 9).

- [ ] **Step 1: Criar `ForgotPasswordScreen.tsx`**

```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/shareds/presentation/components/Screen';
import { theme } from '@/shareds/presentation/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { AuthTextField } from '../components/AuthTextField';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';

export function ForgotPasswordScreen() {
  const { isSubmitting, error, redefinirSenha } = useAuth();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = async () => {
    const sucesso = await redefinirSenha(email);
    if (sucesso) {
      setEnviado(true);
    }
  };

  return (
    <Screen>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Esqueceu sua senha?</Text>

        {enviado ? (
          <Text style={styles.successText}>
            Enviamos um link de redefinição de senha para {email}. Verifique sua caixa de entrada e clique no link para criar uma nova senha.
          </Text>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Informe o e-mail da sua conta. Vamos te enviar um link para redefinir a senha.
            </Text>
            <AuthTextField
              label="E-MAIL"
              icon="mail-outline"
              placeholder="Seu e-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <AuthPrimaryButton label="Enviar link de redefinição" onPress={handleEnviar} loading={isSubmitting} />
          </>
        )}

        <TouchableOpacity onPress={() => router.back()} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>Voltar para o login</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: theme.spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xl,
  },
  successText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xl,
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  loginLink: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  loginLinkText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
```

- [ ] **Step 2: Criar a rota `src/app/forgot-password.tsx`**

```tsx
import { ForgotPasswordScreen } from '@/features/auth-page/presentation/screens/ForgotPasswordScreen';

export default function ForgotPasswordRoute() {
  return <ForgotPasswordScreen />;
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: nenhum novo erro.

- [ ] **Step 4: Commit**

```bash
git add src/features/auth-page/presentation/screens/ForgotPasswordScreen.tsx src/app/forgot-password.tsx
git commit -m "feat: tela de redefinição de senha"
```

---

### Task 13: Religar o `_layout.tsx` raiz (sessão, heartbeat, apuração, novas rotas)

**Files:**
- Modify: `src/app/_layout.tsx`

**Interfaces:**
- Consumes: `useAuthStore` (Task 2), `useAuthHeartbeat` (Task 3), `apurarPalpitesPendentes` (existente, sem mudanças).

- [ ] **Step 1: Substituir o conteúdo de `src/app/_layout.tsx`**

```tsx
import { useEffect } from 'react';
import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shareds/infrastructure/http/queryClient';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';
import { useAuthHeartbeat } from '@/shareds/presentation/hooks/useAuthHeartbeat';
import { apurarPalpitesPendentes } from '@/shareds/infrastructure/firebase/apurarPalpites';
import { Stack } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const status = useAuthStore((s) => s.status);
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (status === 'loading') return;
    SplashScreen.hideAsync();
    if (status === 'authenticated') {
      apurarPalpitesPendentes().catch((err) => console.error('Erro na apuração de palpites', err));
    }
  }, [status]);

  useAuthHeartbeat();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="team/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="small-packet" options={{ presentation: 'modal' }} />
          <Stack.Screen name="rewards" />
          <Stack.Screen name="bet/[jogoId]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="match-schedule" options={{ presentation: 'card' }} />
          <Stack.Screen name="album-sticker" options={{ presentation: 'card' }} />
          <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="forgot-password" />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: zero erros em todo o projeto neste ponto (este era o único arquivo com o erro pendente da Task 2).

- [ ] **Step 3: Rodar o app e confirmar que ele abre sem crash**

Run: `npm run start` (ou `npm run android` / `npm run ios` / `npm run web`, conforme seu ambiente)
Expected: app abre, splash some, cai na tab Início sem erro no console relacionado a auth.

- [ ] **Step 4: Commit**

```bash
git add src/app/_layout.tsx
git commit -m "feat: inicializa sessão de auth, heartbeat e registra rotas de login/cadastro/reset de senha"
```

---

### Task 14: `HeaderWidget` como fonte única de verdade da sessão

**Files:**
- Modify: `src/shareds/presentation/hooks/useUsuarioAtual.ts`
- Modify: `src/shareds/presentation/components/HeaderWidget.tsx`
- Modify: `src/features/home-page/presentation/screens/HomeScreen.tsx:25-29`
- Modify: `src/features/team-page/presentation/screens/TeamScreen.tsx:16,36`
- Modify: `src/features/album-page/presentation/screens/AlbumScreen.tsx:16-17,43-47`
- Modify: `src/features/betting-page/presentation/screens/BettingScreen.tsx:15,24-28`

**Interfaces:**
- Consumes: `useAuthStore` (Task 2), `useUsuarioAtual` (existente, ganha guard de auth nesta task).
- Produces: `<HeaderWidget />` sem props (a versão anterior aceitava `userName`/`points`/`avatarUrl`; os 4 call-sites deixam de passá-los).

- [ ] **Step 1: Adicionar guard de auth em `useUsuarioAtual.ts`**

Para não gastar uma leitura no Firestore toda vez que um visitante focar uma tela (o doc do usuário só existe para contas autenticadas — visitante só tem sessão anônima). Substituir todo o conteúdo de `src/shareds/presentation/hooks/useUsuarioAtual.ts` por:

```ts
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { UsuarioFirestore, UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';

export function useUsuarioAtual() {
  const [usuario, setUsuario] = useState<UsuarioFirestore | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsuario = useCallback(async () => {
    if (useAuthStore.getState().status !== 'authenticated') {
      setUsuario(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await UsuarioRepository.getUsuario();
      setUsuario(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUsuario();
    }, [fetchUsuario])
  );

  return { usuario, isLoading, refetch: fetchUsuario };
}
```

- [ ] **Step 2: Reescrever `HeaderWidget.tsx` para buscar o próprio usuário via `useUsuarioAtual`**

```tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';
import { useUsuarioAtual } from '../hooks/useUsuarioAtual';

export function HeaderWidget() {
  const status = useAuthStore((s) => s.status);
  const { usuario } = useUsuarioAtual();
  const isAuthenticated = status === 'authenticated';

  const userName = isAuthenticated ? usuario?.nome ?? 'Jogador' : 'Visitante';
  const points = isAuthenticated ? usuario?.pontos ?? 0 : 0;
  const avatarUrl = isAuthenticated ? usuario?.foto_url : undefined;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.leftSection} onPress={() => router.push('/profile')}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <Ionicons
            name="person-circle-outline"
            size={40}
            color={theme.colors.textMuted}
            style={styles.avatarIcon}
          />
        )}
        <Text style={styles.userName}>{userName}</Text>
      </TouchableOpacity>
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsText}>{points.toLocaleString('en-US')} pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    marginRight: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  avatarIcon: {
    marginRight: theme.spacing.sm,
  },
  userName: {
    ...theme.typography.h2,
    color: theme.colors.accent,
    textTransform: 'uppercase',
  },
  pointsBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  pointsText: {
    ...theme.typography.bodySmall,
    color: theme.colors.accent,
    fontWeight: '600',
  },
});
```

Nota: `userName`/`points`/`avatarUrl` vêm do documento Firestore (`usuario.nome`, `usuario.pontos`, `usuario.foto_url`), não do `displayName`/`photoURL` do Firebase Auth — porque a tela de Perfil (`updateNome`/`updateAvatar`) só grava no Firestore, então o Firebase Auth ficaria desatualizado se fosse usado como fonte aqui.

- [ ] **Step 3: Atualizar `HomeScreen.tsx` (linhas 25-29)**

Trocar:
```tsx
          <HeaderWidget
            userName={data.userName}
            points={data.userPoints}
            avatarUrl="https://i.pravatar.cc/150?img=11"
          />
```
Por:
```tsx
          <HeaderWidget />
```

- [ ] **Step 4: Atualizar `TeamScreen.tsx`**

Remover a linha 16 (`const { usuario } = useUsuarioAtual();`) e o import de `useUsuarioAtual` na linha 10 (`import { useUsuarioAtual } from '@/shareds/presentation/hooks/useUsuarioAtual';`) — não sobra nenhum outro uso de `usuario` neste arquivo.

Trocar a linha 36:
```tsx
      <HeaderWidget userName={usuario?.nome} points={usuario?.pontos} />
```
Por:
```tsx
      <HeaderWidget />
```

- [ ] **Step 5: Atualizar `AlbumScreen.tsx`**

Trocar as linhas 16-17:
```tsx
  const userName = usuario?.nome ?? 'BTO DAI DAI';
  const userPoints = usuario?.pontos ?? 1250;
```
Remover essas duas linhas por completo (a linha 15, `const pacotinhos = usuario?.qtd_pacotes ?? 0;`, continua — ainda é usada por `AlbumActionsRow` — e a linha 14, `const { usuario } = useUsuarioAtual();`, também continua por causa dela).

Trocar as linhas 43-47:
```tsx
          <HeaderWidget
            userName={userName}
            points={userPoints}
            avatarUrl="https://i.pravatar.cc/150?img=11"
          />
```
Por:
```tsx
          <HeaderWidget />
```

- [ ] **Step 6: Atualizar `BettingScreen.tsx`**

Remover a linha 15 (`const { usuario } = useUsuarioAtual();`) e o import de `useUsuarioAtual` na linha 11 — não sobra nenhum outro uso de `usuario` neste arquivo.

Trocar as linhas 24-28:
```tsx
        <HeaderWidget
          userName={usuario?.nome ?? 'BTO DAI DAI'}
          points={usuario?.pontos ?? 0}
          avatarUrl="https://i.pravatar.cc/150?img=11"
        />
```
Por:
```tsx
        <HeaderWidget />
```

- [ ] **Step 7: Verificar tipos e lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: zero erros novos, incluindo zero `no-unused-vars` nos 3 arquivos editados nos Steps 4-6.

- [ ] **Step 8: Commit**

```bash
git add src/shareds/presentation/hooks/useUsuarioAtual.ts src/shareds/presentation/components/HeaderWidget.tsx src/features/home-page/presentation/screens/HomeScreen.tsx src/features/team-page/presentation/screens/TeamScreen.tsx src/features/album-page/presentation/screens/AlbumScreen.tsx src/features/betting-page/presentation/screens/BettingScreen.tsx
git commit -m "refactor: HeaderWidget busca o proprio usuario (visitante vs autenticado), remove props duplicadas"
```

---

### Task 15: Gating de tela inteira — Álbum, Abrir Pacotes, Recompensas

**Files:**
- Modify: `src/app/(tabs)/album.tsx`
- Modify: `src/app/small-packet.tsx`
- Modify: `src/app/rewards.tsx`

**Interfaces:**
- Consumes: `RequireAuthScreen` (Task 4).

- [ ] **Step 1: Editar `src/app/(tabs)/album.tsx`**

```tsx
import { AlbumScreen } from '@/features/album-page/presentation/screens/AlbumScreen';
import { RequireAuthScreen } from '@/shareds/presentation/components/RequireAuthScreen';

export default function AlbumRoute() {
  return (
    <RequireAuthScreen>
      <AlbumScreen />
    </RequireAuthScreen>
  );
}
```

- [ ] **Step 2: Editar `src/app/small-packet.tsx`**

```tsx
import { SmallPacketScreen } from '@/features/small-packet-page/presentation/screens/SmallPacketScreen';
import { RequireAuthScreen } from '@/shareds/presentation/components/RequireAuthScreen';

export default function SmallPacketRoute() {
  return (
    <RequireAuthScreen>
      <SmallPacketScreen />
    </RequireAuthScreen>
  );
}
```

- [ ] **Step 3: Editar `src/app/rewards.tsx`**

```tsx
import { RewardsScreen } from '@/features/rewards-page/presentation/screens/RewardsScreen';
import { RequireAuthScreen } from '@/shareds/presentation/components/RequireAuthScreen';

export default function RewardsRoute() {
  return (
    <RequireAuthScreen>
      <RewardsScreen />
    </RequireAuthScreen>
  );
}
```

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: nenhum novo erro.

- [ ] **Step 5: Verificação manual**

Com o app rodando e **sem estar logado**: tocar na tab "Álbum" deve levar para `/login` em vez de mostrar o álbum. Navegar manualmente para `/small-packet` e `/rewards` (ex.: via botão que os abre) também deve cair em `/login`.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(tabs)/album.tsx" src/app/small-packet.tsx src/app/rewards.tsx
git commit -m "feat: bloqueia Álbum, Abrir Pacotes e Recompensas para visitantes"
```

---

### Task 16: Gating da ação "Enviar Palpite"

**Files:**
- Modify: `src/features/upcoming-matches-page/presentation/screens/BetDetailScreen.tsx`

**Interfaces:**
- Consumes: `useRequireAuth` (Task 4).

- [ ] **Step 1: Editar `BetDetailScreen.tsx`**

Adicionar o import (junto aos outros imports, após a linha `import { useBetDetail } from '../hooks/useBetDetail';`):

```tsx
import { useRequireAuth } from '@/shareds/presentation/hooks/useRequireAuth';
```

Dentro do componente, logo após a desestruturação de `useBetDetail`, adicionar:

```tsx
  const { requireAuth } = useRequireAuth();
```

Substituir a função `handleSave` inteira por:

```tsx
  const handleSave = async () => {
    if (isSaved && !hasChanges) {
      router.back();
      return;
    }
    if (!primeiroMarcar || !vencedor) {
      Alert.alert('Palpite incompleto', 'Por favor, selecione todas as opções antes de salvar.');
      return;
    }
    requireAuth(async () => {
      const success = await saveBet();
      if (success) {
        Alert.alert('✅ Palpite Salvo!', 'Seu palpite foi registrado com sucesso. Boa sorte!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Erro', 'Não foi possível salvar o palpite. Verifique se o jogo ainda está disponível.');
      }
    });
  };
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: nenhum novo erro.

- [ ] **Step 3: Verificação manual**

Sem estar logado, abrir um jogo agendado, selecionar placar/primeiro a marcar/vencedor, tocar em "SALVAR PALPITE" → deve ir para `/login` (a tela de detalhe do jogo continua acessível e navegável antes disso, só o salvar é bloqueado). Depois de logar, `router.back()` deve devolver para a tela do jogo.

- [ ] **Step 4: Commit**

```bash
git add src/features/upcoming-matches-page/presentation/screens/BetDetailScreen.tsx
git commit -m "feat: exige login apenas para salvar o palpite (visualização do jogo continua pública)"
```

---

### Task 17: Perfil bloqueado para visitante, botão Sair, exclusão real da conta

**Files:**
- Create: `src/features/profile-page/presentation/components/GuestProfilePrompt.tsx`
- Create: `src/features/profile-page/presentation/components/SignOutButton.tsx`
- Modify: `src/features/profile-page/presentation/screens/ProfileScreen.tsx`
- Modify: `src/features/profile-page/presentation/hooks/useProfile.ts`
- Modify: `src/features/profile-page/infrastructure/repositories/ProfileRepository.ts`

**Interfaces:**
- Consumes: `useAuthStore` (Task 2).
- Produces: `<GuestProfilePrompt />`, `<SignOutButton />`.

- [ ] **Step 1: Criar `GuestProfilePrompt.tsx`**

```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '@/shareds/presentation/constants/theme';

export function GuestProfilePrompt() {
  return (
    <View style={styles.container}>
      <Ionicons name="person-circle-outline" size={72} color={theme.colors.textMuted} />
      <Text style={styles.title}>Você não está logado</Text>
      <Text style={styles.subtitle}>Faça login para ver seus pontos, álbum e conquistas.</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
        <Text style={styles.buttonText}>Fazer login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h2,
    marginTop: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.xl,
  },
  buttonText: {
    ...theme.typography.body,
    fontWeight: '800',
    color: '#0B1221',
  },
});
```

- [ ] **Step 2: Criar `SignOutButton.tsx`**

```tsx
import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '@/shareds/infrastructure/firebase/firebaseClient';
import { theme } from '@/shareds/presentation/constants/theme';

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut(auth);
    router.replace('/(tabs)');
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleSignOut}>
      <Ionicons name="log-out-outline" size={18} color={theme.colors.textMuted} />
      <Text style={styles.buttonText}>Sair</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.xl,
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
});
```

- [ ] **Step 3: Editar `useProfile.ts` para não buscar perfil quando não autenticado**

Adicionar o import no topo:
```ts
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';
```

Substituir o corpo de `fetchProfile` por:
```ts
  const fetchProfile = useCallback(async () => {
    if (useAuthStore.getState().status !== 'authenticated') {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const repo = new ProfileRepository();
      const useCase = new GetProfileUseCase(repo);
      const result = await useCase.execute();
      setProfile(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar perfil.'));
    } finally {
      setIsLoading(false);
    }
  }, []);
```

- [ ] **Step 4: Editar `ProfileScreen.tsx`**

Adicionar os imports:
```tsx
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';
import { GuestProfilePrompt } from '../components/GuestProfilePrompt';
import { SignOutButton } from '../components/SignOutButton';
```

No topo do componente, adicionar:
```tsx
  const status = useAuthStore((s) => s.status);
```

Substituir o bloco de renderização condicional (a partir de `{isLoading || !profile ? (`) por:

```tsx
      {status !== 'authenticated' ? (
        <GuestProfilePrompt />
      ) : isLoading || !profile ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ProfileHeaderCard
            nome={profile.nome}
            email={profile.email}
            avatarUrl={profile.avatarUrl}
            isSaving={isSaving}
            onPressAvatar={() => setAvatarModalVisible(true)}
            onSaveNome={updateNome}
          />

          <ProfileStatsGrid
            pontos={profile.pontos}
            percentualFigurinhas={profile.percentualFigurinhas}
            figurinhasColetadas={profile.figurinhasColetadas}
            figurinhasTotal={profile.figurinhasTotal}
            estatisticasApostas={profile.estatisticasApostas}
          />

          <SignOutButton />

          <DangerZoneCard isSaving={isSaving} onConfirmDelete={handleDeleteAccount} />

          <AvatarPickerModal
            visible={avatarModalVisible}
            avatarAtual={profile.avatarUrl}
            onSelect={handleSelectAvatar}
            onClose={() => setAvatarModalVisible(false)}
          />
        </ScrollView>
      )}
```

- [ ] **Step 5: Editar `ProfileRepository.ts` para apagar também o usuário do Firebase Auth**

Adicionar os imports no topo:
```ts
import { deleteUser } from 'firebase/auth';
import { auth } from '@/shareds/infrastructure/firebase/firebaseClient';
```

Substituir `deleteAccount`:
```ts
  async deleteAccount(): Promise<void> {
    await UsuarioRepository.deleteUsuario();
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
  }
```

- [ ] **Step 6: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: nenhum novo erro.

- [ ] **Step 7: Verificação manual**

Sem login: abrir `/profile` deve mostrar "Você não está logado" com botão "Fazer login". Logado: mostrar o perfil normal + botão "Sair" (que devolve para a tab inicial e o header volta a mostrar "Visitante") + "Excluir conta" (que agora também remove o usuário do Firebase Auth, não só o documento do Firestore).

- [ ] **Step 8: Commit**

```bash
git add src/features/profile-page
git commit -m "feat: perfil pede login para visitante, adiciona botão Sair e exclusão real da conta"
```

---

### Task 18: Ranking — card "Sua posição" pede login para visitante

**Files:**
- Modify: `src/features/rank-page/presentation/screens/RankScreen.tsx`

**Interfaces:**
- Consumes: `useAuthStore` (Task 2).

- [ ] **Step 1: Editar `RankScreen.tsx`**

Adicionar o import:
```tsx
import { useAuthStore } from '@/shareds/infrastructure/auth/authStore';
```

Dentro do componente, após `const { data, isLoading, error } = useRank();`, adicionar:
```tsx
  const status = useAuthStore((s) => s.status);
```

Substituir o bloco `{/* Current User Card */}` inteiro:

```tsx
        {/* Current User Card */}
        {status === 'authenticated' ? (
          <View style={styles.currentUserCard}>
            <View style={styles.currentUserPositionInfo}>
              <Text style={styles.currentUserLabel}>SUA POSIÇÃO</Text>
              <Text style={styles.currentUserPositionText}>#{data.currentUser.position.toLocaleString('pt-BR')}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.currentUserInfo}>
              <Image source={{ uri: data.currentUser.avatar }} style={styles.currentUserAvatar} />
              <Text style={styles.currentUserName}>{data.currentUser.name}</Text>
            </View>
            <Text style={styles.currentUserPoints}>{data.currentUser.points}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.guestCard} onPress={() => router.push('/login')}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.guestCardText}>Faça login para ver sua posição</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
```

Adicionar `router` como import (a tela já usa `useRouter()`; adicionar também `router` do `expo-router` para o `onPress` acima — ou trocar `router.push` por `router.push` usando a instância já existente `const router = useRouter();` que já está no topo do componente. Usar essa instância existente, sem importar `router` separadamente).

Corrigir o `onPress` acima para usar a instância já existente:
```tsx
          <TouchableOpacity style={styles.guestCard} onPress={() => router.push('/login')}>
```
(`router` aqui é o retornado por `useRouter()` já declarado na primeira linha do componente — nenhum import novo necessário.)

Adicionar os estilos novos ao final do `StyleSheet.create`, antes do fechamento `});`:

```ts
  guestCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  guestCardText: {
    ...theme.typography.body,
    flex: 1,
    color: theme.colors.text,
    fontWeight: '600',
  },
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: nenhum novo erro.

- [ ] **Step 3: Verificação manual**

Sem login: abrir o Ranking mostra o pódio e a lista normalmente (dados públicos), mas o card "Sua posição" vira "Faça login para ver sua posição" e leva para `/login` ao tocar. Logado: card volta a mostrar a posição real.

- [ ] **Step 4: Commit**

```bash
git add src/features/rank-page/presentation/screens/RankScreen.tsx
git commit -m "feat: ranking pede login apenas no card de posição pessoal, lista continua pública"
```

---

### Task 19: Remover a variável de ambiente de dev

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Editar `.env.example`**

Remover as duas últimas linhas (comentário + `EXPO_PUBLIC_DEV_USER_DOC_ID=`), deixando:

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

- [ ] **Step 2: Confirmar que nada mais referencia a variável**

Run: `grep -rn "EXPO_PUBLIC_DEV_USER_DOC_ID" src/ .env.example`
Expected: nenhum resultado.

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: remove a variável de ambiente do usuário fixo de dev, não usada mais"
```

---

### Task 20: Verificação final

**Files:** nenhum (task só de verificação).

- [ ] **Step 1: Typecheck completo**

Run: `npx tsc --noEmit`
Expected: zero erros.

- [ ] **Step 2: Lint completo**

Run: `npm run lint`
Expected: zero erros (warnings pré-existentes não relacionados a este trabalho podem ser ignorados, mas nada novo introduzido pelas Tasks 1-19).

- [ ] **Step 3: Roteiro de verificação manual (app rodando via `npm run start`, depois de você ter aplicado as regras do Firestore e ativado o provedor de e-mail/senha conforme a seção "Ação manual no Firebase" no topo deste plano)**

Marque cada item ao confirmar:

- [ ] Abrir o app sem login: header mostra avatar de visitante + "Visitante" + "0 pts".
- [ ] Tab Ranking: pódio e lista aparecem normalmente; card de posição pessoal pede login.
- [ ] Tocar na tab Álbum sem login → cai em `/login`.
- [ ] Abrir um jogo (Palpite), preencher placar/opções, tocar "SALVAR PALPITE" sem login → cai em `/login`.
- [ ] Abrir `/profile` sem login → mostra "Você não está logado" com botão "Fazer login".
- [ ] Em `/signup`: cadastrar com nome, e-mail, data de nascimento (DD/MM/AAAA) e senha (6+ caracteres) → volta para a tela anterior logado. Conferir no Console do Firebase que o documento `usuario/{uid}` foi criado com os campos esperados (`pontos: 0`, `data_nascimento`, `maior_idade`, `ultima_atividade`, `criado_em`).
- [ ] Header agora mostra o nome real cadastrado.
- [ ] Tab Álbum abre normalmente agora.
- [ ] Enviar um palpite agora salva com sucesso.
- [ ] `/profile`: mostra os dados reais, botão "Sair" leva de volta para a tab inicial e o header volta a "Visitante".
- [ ] Logar de novo (`/login` com o e-mail/senha cadastrados) → funciona e mantém a sessão.
- [ ] Fechar e reabrir o app (matar o processo) → continua logado, sem precisar logar de novo.
- [ ] `/forgot-password`: enviar e-mail de redefinição não gera erro (não precisa concluir a troca de senha de fato para validar este plano, só confirmar que a chamada não falha).
- [ ] Heartbeat: reduzir temporariamente `INTERVALO_HEARTBEAT_MS` em `useAuthHeartbeat.ts` para `10 * 1000` (10 segundos) só para este teste, deixar o app aberto e logado, observar no Console do Firebase que `ultima_atividade` do documento do usuário muda a cada ~10s. **Depois reverter para `10 * 60 * 1000` antes de finalizar.**
- [ ] `/profile` → "Excluir conta": confirma exclusão, remove o documento do Firestore **e** o usuário some da lista em Authentication → Users no console.

- [ ] **Step 4: Reverter o intervalo do heartbeat se foi alterado para teste**

Run: `git diff src/shareds/presentation/hooks/useAuthHeartbeat.ts`
Expected: sem diferenças (arquivo já está com `10 * 60 * 1000`, valor de produção). Se houver diferença, reverta antes de seguir.

- [ ] **Step 5: Commit final (se algo precisou de ajuste durante a verificação manual)**

```bash
git add -A
git commit -m "chore: ajustes finais pós-verificação manual do fluxo de autenticação"
```

(Pule este commit se nada precisou ser alterado durante a Task 20.)
