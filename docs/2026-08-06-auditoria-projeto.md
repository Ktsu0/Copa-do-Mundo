# Auditoria do projeto — Copa do Mundo

**Data:** 2026-08-06
**Escopo:** app inteiro (React Native / Expo) — 13 features, camada compartilhada (`src/shareds`), Firebase, SQLite e roteamento (`src/app`).
**Método:** 5 revisões paralelas cobrindo todas as camadas (domain/application/infrastructure/presentation) de cada área. Auditoria só de leitura — nenhum arquivo foi alterado.
**Total:** 76 achados.

| Categoria | Achados |
|---|---|
| Erros graves | 8 |
| Bugs de lógica | 10 |
| Experiência (UX) | 14 |
| Design / visual | 7 |
| Código morto | 7 |
| Duplicação | 10 |

---

## Padrões sistêmicos (leia antes do resto)

Três hábitos se repetem em quase toda tela do app. Corrigir cada um **uma vez só**, de forma compartilhada, resolve boa parte dos itens listados abaixo em vez de precisar de 9-10 correções pontuais.

### 1. Nove hooks reimplementam o mesmo carregamento de dados

`useTeams`, `useTeamDetail`, `useRank`, `useMatches`, `useGroupSchedule`, `useHomeData`, `useProfile`, `usePacket`, `useRewards` — todos repetem na mão o padrão `isLoading` / `error` / `try-catch-finally`, e em quase todos o `error` é calculado mas a tela nunca chega a exibi-lo. Um hook único (`useAsyncData`) em `src/shareds` mataria de uma vez a causa da maioria dos "erro engolido" e "spinner eterno" listados abaixo.

### 2. Tela de loading que não diferencia "carregando" de "deu erro"

Home, Perfil, Detalhe de Time e Calendário de Jogos usam a mesma condição `isLoading || !data` para decidir se mostram o spinner. Quando a busca falha ou retorna vazio, `isLoading` vira `false` mas `data` continua nulo — e a tela fica girando pra sempre, sem forma de sair de lá a não ser fechar o app.

### 3. Cores fixas em vez dos tokens do `theme.ts`

Em Auth, Home, Time, Apostas, Recompensas e Pacote, o mesmo tom de fundo (`#0B1221`) e outras cores do tema aparecem digitados na mão dezenas de vezes em vez de referenciar `theme.colors` — e em dois lugares aparece um azul que não existe na paleta oficial. Qualquer ajuste de paleta no futuro exige caçar cada ocorrência manualmente.

---

## 1. Erros graves

Coisas que podem derrubar o app, vazar dado sensível, corromper informação ou quebrar uma promessa feita ao usuário.

- **[CRÍTICO][Infra]** `initDb()` guarda para sempre a promise rejeitada da abertura do SQLite. Se abrir o banco falhar uma vez (permissão, disco cheio, asset corrompido), toda tela que consulta jogos/times/jogadores passa a estourar exceção pelo resto da sessão — e o layout raiz captura o erro mas libera o app mesmo assim, escondendo o problema até ele explodir em outra tela.
  `src/shareds/infrastructure/sqlite/db.ts:29-37`, `src/app/_layout.tsx:26-28`

- **[CRÍTICO][Ranking]** A busca do ranking traz a coleção `usuario` inteira do Firestore sem `limit()` — nome, e-mail, data de nascimento e pontos de todo mundo chegam a qualquer dispositivo que abrir a aba de ranking, incluindo convidados, mesmo só 53 linhas sendo exibidas. O custo de leitura também cresce sem limite conforme a base de usuários aumenta.
  `src/shareds/infrastructure/firebase/UsuarioRepository.ts:94-97`

- **[ALTO][Apostas]** Nada compara o horário real da partida para travar apostas — só o campo `status` (atualizado manualmente/por job) é checado. Se essa atualização atrasar, dá pra apostar depois do jogo já ter começado; a leitura do status também acontece fora da transação do Firestore, alargando a janela de corrida entre checar e gravar.
  `src/features/upcoming-matches-page/infrastructure/repositories/BetRepository.ts:63-68`, `useBetDetail.ts:81`

- **[ALTO][Infra/Apostas]** `apurarPalpite()` nunca avalia o palpite de "primeiro time a marcar" — o app salva esse palpite normalmente e promete 150 pts por ele, mas os pontos nunca são creditados porque a apuração desse tipo de palpite simplesmente não existe.
  `src/shareds/infrastructure/firebase/apurarPalpites.ts:19-36`

- **[ALTO][Apostas]** `saveBet` engole qualquer erro (rede, permissão, falha de transação) e devolve só `false` — a tela trata isso de forma idêntica a "essa partida não aceita mais aposta", então uma falha real do sistema é mostrada ao usuário como se fosse uma regra do jogo.
  `src/features/upcoming-matches-page/infrastructure/repositories/BetRepository.ts:96`

- **[MÉDIO][Auth]** O botão de sair chama `signOut(auth)` direto, sem try/catch e ignorando a abstração `IAuthRepository.sair()` que o projeto já define (e que está morta — ninguém a chama). Uma falha aqui deixa o botão sem reação nenhuma.
  `src/features/profile-page/presentation/components/SignOutButton.tsx:10-13`

- **[MÉDIO][Auth]** Quando o cadastro falha depois de criar o usuário no Firebase Auth, o código tenta desfazer via rollback (`deleteUser`) — mas engole o erro desse próprio rollback. Se ele falhar também, sobra uma conta órfã no Firebase Auth sem log nem forma de detectar.
  `src/features/auth-page/infrastructure/repositories/AuthRepository.ts:51-57`

- **[MÉDIO][Recompensas]** `recompensaNumero()` faz `parseInt` num pedaço do id sem validar; um id fora do formato esperado vira `NaN` e é gravado assim mesmo, sem erro, dentro do array `conquistas` do usuário no Firestore.
  `src/features/rewards-page/infrastructure/repositories/RewardRepository.ts:16-18`

---

## 2. Bugs de lógica

- **[Home]** Se a busca dos dados da home falhar, a tela fica girando pra sempre — a condição de loading nunca considera o estado de erro.
  `src/features/home-page/presentation/screens/HomeScreen.tsx:13`, `useHomeData.ts:26-31`

- **[Perfil]** Mesmo problema: se o documento do usuário sumir do Firestore, a tela de perfil fica presa no `ActivityIndicator` para sempre.
  `src/features/profile-page/presentation/screens/ProfileScreen.tsx:45`

- **[Perfil]** Erros de atualizar nome, trocar avatar e excluir conta são capturados pelo hook mas a tela nunca os lê nem exibe — inclusive o caso de `auth/requires-recent-login` do Firebase, que passa batido.
  `src/features/profile-page/presentation/hooks/useProfile.ts:16,39,70,86,102`

- **[Jogos]** O calendário de jogos por grupo trava girando pra sempre se o grupo não existir ou a busca falhar — mesma classe de bug do Home/Perfil.
  `src/features/match-schedule-page/presentation/screens/MatchScheduleScreen.tsx:18-24`

- **[Time]** Ao navegar rápido entre dois times, não há proteção contra resposta desatualizada sobrescrever a mais nova (outros hooks do app já fazem essa proteção, esse não).
  `src/features/team-detail-page/presentation/hooks/useTeamDetail.ts:11-28`

- **[Time]** O selo de "atual campeão" é um `if (t.id === 'ARG')` fixo no código em vez de um dado — vai continuar mostrando a Argentina como campeã depois da próxima Copa, silenciosamente, até alguém lembrar de mexer no código.
  `src/features/team-page/infrastructure/repositories/mockTeamRepository.ts:35-37`

- **[Ranking]** As cores do pódio (ouro/prata/bronze) são calculadas dentro do repositório em vez da camada de apresentação — mistura de responsabilidades, e duplica a cor `accent` do tema sem reaproveitá-la.
  `src/features/rank-page/infrastructure/repositories/RankRepository.ts:16-17`

- **[Apostas]** O filtro "jogos de hoje" cai, quando não encontra nada, num fallback que pega as 6 primeiras partidas na ordem bruta do SQLite — sem ordenar por data e sem avisar o usuário que não são mais jogos de "hoje".
  `src/features/betting-page/infrastructure/repositories/BettingRepository.ts:23-38`

- **[Álbum]** A tela de figurinhas lê um parâmetro `groupId` pra saber qual time abrir, mas nenhuma navegação do app hoje passa esse parâmetro — ponto de entrada morto que sempre cai no time padrão ('BRA').
  `src/features/album-sticker-page/presentation/screens/AlbumStickerScreen.tsx:15`

- **[Infra]** O hook que busca o usuário atual não tem `catch` — se a busca rejeitar, sobra uma promise não tratada tanto no efeito de montagem quanto no de foco de tela.
  `src/shareds/presentation/hooks/useUsuarioAtual.ts:19-26`

---

## 3. Experiência (UX)

- **[Auth]** Nenhum formulário (login, cadastro, esqueci senha) valida nada no cliente — formato de e-mail, senha curta, campo vazio: tudo só é detectado depois do round-trip completo com o Firebase.
  `LoginScreen.tsx`, `SignupScreen.tsx`, `ForgotPasswordScreen.tsx`

- **[Auth]** O botão de sair é o único botão de ação do app sem estado de carregando/desabilitado durante a operação.
  `src/features/profile-page/presentation/components/SignOutButton.tsx`

- **[Home]** A flag `reward.available` nunca é checada — o botão "RESGATAR AGORA" da recompensa diária fica sempre ativo, disponível ou não.
  `src/features/home-page/presentation/components/DailyRewardBanner.tsx`

- **[Time]** Time com id inválido faz a tela de detalhe girar pra sempre em vez de mostrar "não encontrado".
  `src/features/team-detail-page/presentation/screens/TeamDetailScreen.tsx:27`

- **[Time]** Erro de busca e filtro sem resultado mostram a mesma mensagem ("Nenhuma seleção encontrada") — o usuário não consegue saber se é falha do sistema ou se realmente não existe.
  `src/features/team-page/presentation/screens/TeamScreen.tsx:12,64-66`

- **[Time]** Botão "VER TODOS" do elenco não tem nenhum `onPress` — parece clicável, não faz nada.
  `src/features/team-detail-page/presentation/components/SquadList.tsx:15`

- **[Apostas]** Não existe prazo/contagem regressiva visível para o usuário — só aparece um selo depois que o jogo já começou ou terminou.
  `MatchHeader.tsx`, `BetDetailScreen.tsx`

- **[Apostas]** Se salvar uma aposta exigir login, o app redireciona pra tela de login mas perde as seleções (placar/vencedor/artilheiro) já preenchidas — o usuário monta tudo de novo.
  `src/features/upcoming-matches-page/presentation/screens/BetDetailScreen.tsx:32-45`

- **[Apostas/Jogos]** Sem pull-to-refresh em nenhuma das duas telas; o spinner de tela cheia bloqueia tudo e, somado a erros engolidos, fica indistinguível de "não tem nada para mostrar".
  `MatchScheduleScreen.tsx`, `BettingScreen.tsx`

- **[Infra]** O cabeçalho com pontos do usuário ignora o estado de carregamento e mostra rapidamente "Jogador / 0 pts" antes do dado real chegar — um flash de informação errada em praticamente toda tela logada.
  `src/shareds/presentation/components/HeaderWidget.tsx:9-16`

- **[Infra]** Login anônimo com falha (ex: sem internet) é tratado de forma idêntica a "sessão de convidado normal" — sem mensagem que diferencie as duas situações.
  `src/shareds/infrastructure/auth/authStore.ts:28-31`

- **[Álbum]** Botão "Filtrar" da lista de grupos do álbum não tem handler.
  `src/features/album-page/presentation/components/AlbumGroupList.tsx:17-20`

- **[Pacote]** Falha ao abrir um pacote (ex: saldo insuficiente) é 100% silenciosa — o botão simplesmente não faz nada, sem alerta.
  `src/features/small-packet-page/presentation/screens/SmallPacketScreen.tsx:12-15`

- **[Recompensas]** Falha ao resgatar uma recompensa também não mostra nada — só o caminho de sucesso tem um Alert.
  `src/features/rewards-page/presentation/hooks/useRewards.ts:35-38`, `RewardsScreen.tsx:29-32`

---

## 4. Design / visual

- **[Auth]** Botão secundário usa `#3B6FE0`, um azul que não existe em nenhum lugar da paleta do tema.
  `src/features/auth-page/presentation/components/AuthPrimaryButton.tsx:45`

- **[Pacote]** O CTA principal da tela de revelação do pacote usa `#3b82f6` — mesmo problema, outro azul fora da paleta, num dos botões mais visíveis do app.
  `src/features/small-packet-page/presentation/components/PacketRevealCards.tsx:149`

- **[Home]** O banner de recompensa diária usa `#0F1B30` como fundo do card — quase igual ao `card` oficial (`#161F33`), mas diferente, sem motivo aparente.
  `src/features/home-page/presentation/components/DailyRewardBanner.tsx:86`

- **[Vários]** Cor de destaque (verde) e cor de pontos (dourado) são reimplementadas como `rgba()` cruas em vários componentes em vez de um helper único de "variante com transparência" derivado do tema.
  `DailyRewardBanner.tsx:91,98,104`, `FeaturedMatchCard.tsx:109,111`

- **[Config nativa]** A cor de fundo do splash/ícone Android (`#10234C`) não bate com o `background` do tema do app (`#0B1221`) — o app abre num tom de azul e troca visivelmente pra outro assim que carrega.
  `app.json:16,24`

- **[Ranking]** Texto do selo do pódio usa preto fixo — funciona por contraste, mas é uma exceção à paleta que não está documentada em lugar nenhum.
  `src/features/rank-page/presentation/screens/RankScreen.tsx:191`

- **[Time]** Cor de fallback do ícone de favorito usa `#FFFFFF` fixo em vez do token `theme.colors.text` — mesmo valor, mas não referenciado.
  `src/features/team-page/presentation/components/TeamCard.tsx:41`

---

## 5. Código morto / não utilizado

- **[Auth]** `IAuthRepository.sair()` e sua implementação nunca são chamados — a saída de sessão real usa outro caminho direto (ver Erros graves).
  `src/features/auth-page/infrastructure/repositories/AuthRepository.ts:60-62`

- **[Home]** `HomeData.dailyReward.available` e `FeaturedMatch.minuto` nunca são preenchidos de verdade — vêm sempre hardcoded (`true` / `null`) do repositório, então a UI de "minuto ao vivo" nunca pode aparecer de fato.
  `src/features/home-page/domain/entities/HomeData.ts:8,26`, `HomeRepository.ts:55,64`

- **[Domínio compartilhado]** A classe de domínio `Usuario` (com `adicionarPontos`, `removerPontos`, `zerarPontos`, `isPerfilCompleto` etc.) não tem nenhum import em todo o projeto — o app usa só a interface `UsuarioFirestore`.
  `src/shareds/domain/entities/Usuario.ts`

- **[Domínio compartilhado]** `SessaoStatus` e `FaseDaCopa` (value objects) são declarados e nunca referenciados fora do próprio arquivo.
  `src/shareds/domain/value-objects/SessaoStatus.ts`, `FaseDaCopa.ts`

- **[Infra]** O wrapper de cache local via MMKV (`get`/`set`/`remove`/`clear`) não tem nenhum call site no projeto — parece scaffolding que sobrou de uma versão anterior.
  `src/shareds/infrastructure/storage/localCache.ts`

- **[Álbum]** O parâmetro `groupId` e o botão "Filtrar" do álbum (já citados em Bugs/UX) são, na prática, código morto — presentes mas inalcançáveis/sem efeito.
  `AlbumStickerScreen.tsx:15`, `AlbumGroupList.tsx:17-20`

- **[Jogos]** `useMatches` e `useGroupSchedule` expõem um `error` que nenhuma tela chega a ler — efetivamente uma saída morta, que também esconde os bugs reais listados em UX.
  `useMatches.ts`, `useGroupSchedule.ts`

---

## 6. Duplicação — candidatos a arquivo compartilhado

- **→ hook** Padrão `isLoading` / `error` / `try-catch-finally` reimplementado em **9 hooks diferentes** — o principal item da lista, já detalhado nos padrões sistêmicos acima.
  `useTeams`, `useTeamDetail`, `useRank`, `useMatches`, `useGroupSchedule`, `useHomeData`, `useProfile`, `usePacket`, `useRewards`

- **→ componente** Estilo de card (fundo `card` + `radius.lg` + borda de 1px) copiado em 5+ componentes — um `<Card>` compartilhado elimina a repetição.
  `TeamCard.tsx`, `StatsGrid.tsx`, `TeamHeaderCard.tsx`, `SquadList.tsx`, `RankScreen.tsx`

- **→ componente** Botão de voltar (36×36 + ícone `arrow-back`) copiado idêntico em 3 telas.
  `LoginScreen.tsx:47-49`, `ForgotPasswordScreen.tsx:26-28`, `ProfileScreen.tsx:36-38`

- **→ componente** Estilo de texto de erro de formulário redefinido de forma idêntica em 3 telas de auth.
  `LoginScreen.tsx:126-131`, `SignupScreen.tsx:100-105`, `ForgotPasswordScreen.tsx:88-93`

- **→ padrão** Duas formas diferentes e inconsistentes de proteger tela logada — uma bloqueia a tela inteira, outra só uma ação — escolhidas ad hoc por tela, sem critério de produto aparente.
  `useRequireAuth.ts` vs `RequireAuthScreen.tsx`

- **→ util** Mapeamento de linha do SQLite (`JogoRow`) para o modelo de partida da UI duplicado quase igual entre dois repositórios diferentes.
  `BettingRepository.ts:40-58`, `MatchScheduleRepository.ts:66-80`

- **→ constante** Mapa de rótulos de fase da competição (`FASE_LABEL`) duplicado igual em dois componentes.
  `MatchCard.tsx:12-18`, `MatchHeader.tsx:12-18`

- **→ util** Fórmula de progresso `(coletado/total)*100` reescrita em 4 lugares diferentes.
  `RewardRepository.ts:20-24`, `AlbumRepository.ts:25-29`, `StickerRepository.ts:19-24`, `RewardsScreen.tsx:17-19`

- **→ componente** Barra de progresso (trilho + preenchimento) montada à mão 3 vezes com estrutura quase idêntica.
  `RewardCard.tsx:123-134`, `RewardsSummaryCard.tsx:72-82`, `AlbumProgressHeader.tsx:63-73`

- **→ util** Lógica de pluralização de "Título(s)" reimplementada de forma independente em dois repositórios — já divergiu: um usa maiúsculas, o outro não.
  `mockTeamRepository.ts:34`, `mockTeamDetailRepository.ts:44-45`
