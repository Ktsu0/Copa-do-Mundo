# Autenticação Firebase + Gating de Login — Design

Data: 2026-07-14

## Contexto

Hoje o app "Copa do Mundo" (ArenaX) não tem login real. Todo mundo usa uma sessão
anônima do Firebase (`ensureAnonymousAuth`) e todas as leituras/escritas de usuário
apontam para um único documento fixo (`usuario/{EXPO_PUBLIC_DEV_USER_DOC_ID}`).

Objetivo: substituir isso por autenticação real (e-mail/senha) via Firebase Auth,
com sessão persistente, um heartbeat de atividade, telas de Login/Cadastro/Esqueci
minha senha seguindo o visual enviado, e bloqueio de acesso (gating) para features
que exigem estar logado.

## Decisões já validadas com o usuário

- Campo "e-mail ou usuário" no login **sempre recebe e-mail** (não existe username
  real / tabela de mapeamento).
- Cadastro ganha um campo extra **Data de nascimento** (fora do mockup original),
  usado para calcular `maior_idade`.
- Heartbeat de 10 min grava `ultima_atividade` (timestamp) no doc do usuário —
  não é só renovação de token.
- Documento de teste fixo (`EXPO_PUBLIC_DEV_USER_DOC_ID`) é abandonado — cada
  cadastro novo começa do zero. Sem migração automática.
- Visitante continua com uma **sessão anônima do Firebase rodando por baixo**
  (não removida), só para satisfazer as regras do Firestore (leitura do ranking).
  Login/cadastro real não reaproveita/vincula essa sessão anônima — cria uma
  sessão nova.
- **Sem verificação de e-mail obrigatória** no MVP.
- Reset de senha usa a **página padrão hospedada pelo Firebase** (sem domínio/deep
  link customizado).
- Recompensas (`rewards.tsx` / `ClaimRewardUseCase`) também exigem login, mesma
  lógica de "abrir pacotes".

## Arquitetura

### 1. Estado global de sessão — `useAuthStore` (zustand)

Novo arquivo `src/shareds/infrastructure/auth/authStore.ts`:

```ts
type AuthStatus = 'loading' | 'guest' | 'authenticated';

interface AuthState {
  status: AuthStatus;
  firebaseUser: FirebaseUser | null; // inclui usuários anônimos
  isAnonymous: boolean;
}
```

- `status: 'guest'` = sem sessão real (inclui o caso "só tem sessão anônima").
- `status: 'authenticated'` = usuário logado via e-mail/senha (`isAnonymous === false`).
- `status: 'loading'` = ainda não resolvido o primeiro `onAuthStateChanged`.

Populado por um único listener `onAuthStateChanged` registrado no `_layout.tsx`
raiz, substituindo a chamada solta `ensureAnonymousAuth()` atual:

- Se `onAuthStateChanged` disparar sem usuário → chama `signInAnonymously` (igual
  hoje) e mantém `status: 'guest'`.
- Se disparar com usuário anônimo → `status: 'guest'`.
- Se disparar com usuário não-anônimo → `status: 'authenticated'`, dispara
  `apurarPalpitesPendentes()` (mantém comportamento atual) e inicia o heartbeat.

### 2. `firebaseClient.ts` — novas funções

- `cadastrar(email, senha, nome, dataNascimento)`: `createUserWithEmailAndPassword`
  + cria o documento `usuario/{uid}` no Firestore (ver modelo de dados abaixo).
- `entrar(email, senha)`: `signInWithEmailAndPassword`.
- `sair()`: `signOut` (o listener re-cai para sessão anônima automaticamente).
- `redefinirSenha(email)`: `sendPasswordResetEmail` (sem `actionCodeSettings`
  customizado — usa a página padrão do Firebase).

### 3. Gating — dois padrões

**A) Redirecionamento** — usado quando a tela inteira não faz sentido sem login,
ou quando uma ação de escrita é disparada:

- Componente `src/shareds/presentation/components/RequireAuthScreen.tsx`: se
  `status !== 'authenticated'`, chama `router.push('/login')` num `useEffect` e
  renderiza `null`/loader; senão renderiza `children`.
  - Usado em: `src/app/(tabs)/album.tsx`, `src/app/small-packet.tsx`,
    `src/app/rewards.tsx`.
- Hook `src/shareds/presentation/hooks/useRequireAuth.ts`: expõe
  `requireAuth(fn: () => void)` — se autenticado, executa `fn`; senão
  `router.push('/login')`.
  - Usado no botão de enviar palpite (`BetDetailScreen.handleSave`) e no botão
    "resgatar figurinha" (`SmallPacketScreen`, ainda que a tela já esteja
    protegida por `RequireAuthScreen` — checagem redundante e barata na ação
    em si) e no botão de resgatar recompensa (`RewardCard`/`RewardsScreen`).
- Login bem-sucedido chama `router.back()` para devolver o usuário à tela de
  origem.

**B) Inline** — a tela carrega normalmente, mas troca o conteúdo por um convite
de login, sem navegar:

- `ProfileScreen`: se `status !== 'authenticated'`, renderiza um componente novo
  `GuestProfilePrompt` (mensagem + botão "Fazer login" → `router.push('/login')`)
  no lugar de `ProfileHeaderCard`/`ProfileStatsGrid`/`DangerZoneCard`.
- `RankScreen`: o card "Sua posição" (hoje montado a partir de
  `RankData.currentUser`) vira um card "Faça login para ver sua posição" com
  CTA quando `status !== 'authenticated'`. O pódio e a lista geral continuam
  públicos e inalterados — `RankRepository` só calcula/retorna `currentUser`
  quando autenticado.

### 4. `HeaderWidget` — fonte única de verdade

Hoje 4 telas (`HomeScreen`, `TeamScreen`, `AlbumScreen`, `BettingScreen`) buscam
o mesmo "usuário atual" separadamente e passam `userName`/`points`/`avatarUrl`
como props para `HeaderWidget`. Isso duplica a mesma busca 4 vezes e não reage
a mudança de sessão. `HeaderWidget` passa a ler diretamente do `useAuthStore`
(+ `usuarioDoc` quando autenticado):

- Visitante: nome "Visitante", 0 pts, avatar = ícone `Ionicons name="person-circle-outline"`
  (sem asset novo).
- Autenticado: nome/pontos/foto reais do documento do usuário.

Os 4 call-sites removem as props `userName`/`points`/`avatarUrl` (prop duplicada
vira responsabilidade interna do componente).

### 5. `UsuarioRepository.ts`

- `usuarioDocRef()` passa a usar `auth.currentUser?.uid` em vez de
  `EXPO_PUBLIC_DEV_USER_DOC_ID`. Chamado apenas quando `status === 'authenticated'`
  (protegido pelos gates acima), então `auth.currentUser` nunca é o anônimo aqui.
- Nova função `criarUsuario(uid, dados)` usada no cadastro.
- `EXPO_PUBLIC_DEV_USER_DOC_ID` removido do `.env.example` e do código.

### 6. Novo feature `auth-page` (clean architecture, mesmo padrão das demais)

```
src/features/auth-page/
  domain/entities/Credenciais.ts
  application/usecases/{LoginUseCase,CadastroUseCase,RedefinirSenhaUseCase}.ts
  infrastructure/repositories/AuthRepository.ts   (encapsula firebaseClient)
  presentation/hooks/useAuth.ts
  presentation/screens/{LoginScreen,SignupScreen,ForgotPasswordScreen}.tsx
  presentation/components/{AuthTextField,AuthPrimaryButton}.tsx
```

Rotas: `src/app/login.tsx`, `src/app/signup.tsx`, `src/app/forgot-password.tsx`,
registradas no `Stack` raiz (push normal, não modal — é uma tela de "portão").

Visual: segue exatamente os dois mockups enviados (logo ArenaX, campos com ícone,
botão verde "Entrar"/"Cadastrar", botão azul "Criar Conta", link "Esqueceu sua
senha?"), usando `Screen`, `theme.colors/spacing/radius/typography`, `Ionicons`,
`StyleSheet.create` — sem bibliotecas novas de UI.

### 7. Heartbeat

Hook `useAuthHeartbeat()` chamado uma vez no `_layout.tsx`: quando
`status === 'authenticated'`, `setInterval(() => updateDoc(ref, { ultima_atividade: serverTimestamp() }), 10 * 60 * 1000)`,
limpo no cleanup do efeito ou quando o status muda para `guest`. Não roda em
background (app fechado) — apenas enquanto o app está em primeiro plano, que é
o que foi pedido.

## Modelo de dados Firestore

Documento `usuario/{uid}` (uid = `auth.currentUser.uid` do Firebase Auth), criado
no cadastro:

```json
{
  "nome": "string",
  "email": "string",
  "data_nascimento": "YYYY-MM-DD",
  "maior_idade": true,
  "pontos": 0,
  "qtd_pacote_aberto": 0,
  "qtd_pacotes": 0,
  "conquistas": [],
  "album_jogador": [],
  "palpites": [],
  "foto_url": null,
  "ultima_atividade": "<serverTimestamp>",
  "criado_em": "<serverTimestamp>"
}
```

Mesmo shape de `UsuarioFirestore` hoje, com dois campos novos
(`ultima_atividade`, `criado_em`) e `data_nascimento`/`maior_idade` agora
efetivamente preenchidos.

## O que precisa ser configurado no Firebase Console (feito pelo usuário)

1. **Authentication → Sign-in method**: ativar o provedor "E-mail/senha".
2. **Firestore → Rules**: atualizar a coleção `usuario` para:
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
   (leitura liberada pra qualquer autenticado, inclusive anônimo — necessário
   pro ranking listar todo mundo; escrita só pelo dono, e criação só por conta
   não-anônima.)
3. Nenhuma mudança de índice necessária (a query de ranking já ordena por
   `pontos`, campo único).
4. Nenhuma configuração de domínio/Dynamic Links necessária (reset de senha usa
   página padrão do Firebase).

Vou te avisar esses passos de novo, de forma isolada, quando a implementação
chegar nessa parte.

## Fora de escopo (YAGNI por enquanto)

- Login social (Google/Apple/Facebook).
- Verificação de e-mail obrigatória.
- Deep link customizado para reset de senha.
- Migração dos dados do documento de teste fixo.
- Retomar automaticamente a ação pendente (ex: reenviar o palpite sozinho)
  depois do login — usuário refaz a ação manualmente ao voltar.
- Heartbeat em background (app fechado/minimizado).

## Testes / verificação

- Fluxo manual: cadastro → cria doc no Firestore com uid correto → logout →
  login → sessão persiste após fechar/reabrir o app (Expo Go / dev build).
- Visitante: abre o app sem logar → Ranking mostra lista pública normalmente,
  card "sua posição" pede login → tenta abrir Álbum → cai em `/login` → tenta
  enviar palpite → cai em `/login` → Perfil mostra prompt de login.
- Após login em qualquer um desses pontos, `router.back()` devolve à tela de
  origem.
- Heartbeat: `ultima_atividade` atualiza no Firestore a cada 10 min com o app
  aberto (verificação manual observando o documento no console, sem esperar
  10 min de verdade — pode reduzir o intervalo temporariamente durante o teste
  manual e reverter antes de commitar).
