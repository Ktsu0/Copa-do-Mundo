# Relatório de Testes — Copa do Mundo

**Data:** 30/07/2026 (atualizado após adição de novos testes unitários)
**Comando:** `npm test` (Jest)
**Resultado geral:** ✅ 13 suítes / 79 testes — todos passaram (~43s)

---

## `test/features/auth-page/`

| Arquivo | O que testa | Resultado |
|---|---|---|
| **CadastroUseCase.test.ts** | Validação de cadastro: rejeita nome vazio/só espaços, e-mail vazio, senha < 6 caracteres, data fora do formato DD/MM/AAAA; confirma que nome e e-mail são "trimados" antes de chamar o repositório | ✅ 5/5 |
| **LoginUseCase.test.ts** | Rejeita login com e-mail ou senha vazios; confirma que o e-mail é trimado antes de chamar `entrar` | ✅ 3/3 |
| **RedefinirSenhaUseCase.test.ts** | Rejeita e-mail vazio/espaços; envia e-mail trimado para `redefinirSenha` | ✅ 2/2 |
| **authErrorMessages.test.ts** | Tradução de códigos de erro do Firebase (`auth/email-already-in-use`, `auth/wrong-password`) para mensagens em PT-BR; fallback para `error.message` quando código é desconhecido; mensagem genérica quando não é nem `Error` nem tem código | ✅ 4/4 |

## `test/features/small-packet-page/`

| Arquivo | O que testa | Resultado |
|---|---|---|
| **OpenPacketUseCase.test.ts** | Impede abrir mais pacotinhos do que o disponível; abre a quantidade pedida quando há saldo suficiente; permite abrir exatamente a quantidade disponível (limite igual) | ✅ 3/3 |
| **PacketRepository.test.ts** *(novo)* | `getPacotesDisponiveis`: retorna 0 para visitante, retorna saldo do usuário. `openPackets`: erro se usuário não existe, se quantidade ≤ 0, se excede o saldo, ou se não há figurinhas cadastradas; sorteia 3 figurinhas por pacote e calcula `collected/total/percentage` do álbum; marca `isNew` corretamente; grava `qtd_pacotes`, `qtd_pacote_aberto` e `album_jogador` acumulados no usuário; aceita abrir exatamente o saldo disponível | ✅ 9/9 |

## `test/features/rewards-page/` *(novo)*

| Arquivo | O que testa | Resultado |
|---|---|---|
| **RewardRepository.test.ts** *(novo)* | `getRewards`: calcula progresso do álbum e marca `resgatavel` quando bate o requisito; não marca quando não bate; marca `resgatado=true`/`resgatavel=false` para conquista já resgatada; trata usuário nulo (visitante) como progresso zero. `claimReward`: retorna `false` se a recompensa não existe, se não há usuário, se já foi resgatada, ou se o progresso é insuficiente; credita `qtd_pacotes` ou `pontos` (conforme `premio_tipo`) e registra a conquista quando tudo bate | ✅ 9/9 |

## `test/features/rank-page/` *(novo)*

| Arquivo | O que testa | Resultado |
|---|---|---|
| **RankRepository.test.ts** *(novo)* | Separa os 3 primeiros em `topPlayers` e o restante (até a posição 53) em `otherPlayers`, mantendo a numeração contínua; atribui cores de pódio (ouro/prata/bronze) só ao top 3; formata pontos em pt-BR com sufixo "PTS"; monta `currentUser` com a posição real quando o usuário logado está na lista; usa o avatar padrão quando o usuário logado aparece no top 3; usa posição além do total e "0 PTS" quando o usuário logado não está na lista (visitante); limita `otherPlayers` às posições 4–53 mesmo com mais de 50 outros jogadores | ✅ 7/7 |

## `test/features/upcoming-matches-page/`

| Arquivo | O que testa | Resultado |
|---|---|---|
| **SaveBetUseCase.test.ts** | Rejeita placar negativo (casa ou fora); bloqueia salvamento (retorna `false`) se o usuário for menor de idade; salva e retorna resultado do repositório quando maior de idade; aceita placar 0x0 | ✅ 5/5 |

## `test/shareds/domain/`

| Arquivo | O que testa | Resultado |
|---|---|---|
| **idade.test.ts** | Cálculo de maioridade (`isMaiorDeIdade`/`isMaiorDeIdadePorDataISO`): 18 anos completos, ainda não completou, exatamente no dia do aniversário, véspera, dia seguinte, mês do aniversário não alcançado, caso especial de nascido em 29/fev em ano não bissexto, parsing de data ISO | ✅ 9/9 |

## `test/shareds/infrastructure/firebase/`

| Arquivo | O que testa | Resultado |
|---|---|---|
| **apurarPalpites.test.ts** | Apuração de palpites pendentes contra jogos finalizados: não faz nada se usuário não existe ou não tem palpites; credita 500+200 pts (placar exato + vencedor); credita só 200 pts (só vencedor); marca "Errou" sem pontos; reconhece "Empate" como vencedor; ignora jogos não finalizados, palpites já apurados, ou jogos que sumiram da tabela; soma pontos de múltiplos palpites num único update | ✅ 10/10 |

## `test/shareds/infrastructure/teams/`

| Arquivo | O que testa | Resultado |
|---|---|---|
| **timeHelpers.test.ts** | `getFlagUrl`: mapeamento de siglas especiais (BRA→br, ENG→gb-eng, KSA→sa), largura customizável, fallback para 2 primeiras letras, string vazia para valores nulos. `getTeamName`: retorna "???" sem consultar banco quando id é nulo, busca nome no SQLite, retorna o próprio id quando não encontra | ✅ 7/7 |

## `test/shareds/infrastructure/sqlite/` *(novo)*

| Arquivo | O que testa | Resultado |
|---|---|---|
| **jogadoresQueries.test.ts** *(novo)* | `nomeSemClube`: remove o sufixo "(Clube - País)" do final do nome; remove espaços extras antes do sufixo; mantém nomes sem parênteses intactos; não remove parênteses que não estão no final da string | ✅ 4/4 |

---

Nenhuma falha, nenhum teste pulado. Total confere com o resumo do Jest (79 testes, 13 suítes).

## Auditoria de cobertura — pontos verificados

Revisei todos os arquivos de `src/features/**/application/usecases` e `src/features/**/infrastructure/repositories`, além de `src/shareds/**`, em busca de lógica de negócio sem teste.

**Lacunas encontradas e cobertas agora:**
- `PacketRepository.openPackets` — validações, sorteio de figurinhas e cálculo de progresso do álbum (lógica mais complexa do projeto, 0% coberta antes).
- `RewardRepository.getRewards`/`claimReward` — cálculo de progresso, elegibilidade de resgate e crédito de pacotes/pontos (0% coberta antes).
- `RankRepository.getRankData` — numeração de posições, cores de pódio, formatação pt-BR e montagem do `currentUser` (0% coberta antes).
- `nomeSemClube` — função pura usada por `PacketRepository`, `StickerRepository` e `AlbumRepository`, sem teste próprio antes.

**Casos revisados e *não* testados de propósito** (sem lógica própria — são repasses diretos para o repositório, ex.: `GetProfileUseCase`, `GetHomeDataUseCase`, `GetTeamsUseCase`, `GetMatchesUseCase`, `ClaimRewardUseCase` (a classe *use case*, que só delega — a lógica real está no `RewardRepository` já coberto), `DeleteAccountUseCase`, `UpdateProfileNameUseCase`/`UpdateProfileAvatarUseCase`, `GetRankDataUseCase`, `GetGroupScheduleUseCase`, `GetMatchForBetUseCase`, `GetAlbumOverviewUseCase`, `GetTeamAlbumUseCase`, `GetTeamDetailUseCase`): testar esses equivaleria a verificar que um mock devolve o que foi configurado nele — sem valor real.

**Candidatos que ficaram de fora por dependerem fortemente de infraestrutura externa** (Firebase Auth/Firestore, MMKV, SQLite nativo) e seriam mais adequados a testes de integração do que unitários:
- `UsuarioRepository` (wrapper direto do Firestore).
- `authStore` (listener do `onAuthStateChanged` + `signInAnonymously`).
- `localCache` (wrapper trivial do MMKV com try/catch).
- `AlbumRepository`/`StickerRepository` (montagem de dados via `getDbSync` + `setTimeout`, lógica de agrupamento simples e já indiretamente coberta pelo padrão usado em `RewardRepository`/`PacketRepository`).

Se fizer sentido, esses são os próximos candidatos caso o projeto queira ampliar a cobertura para a camada de infraestrutura mais adiante.
