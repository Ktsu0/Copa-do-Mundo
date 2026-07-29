# Graph Report - Copa-do-Mundo  (2026-07-28)

## Corpus Check
- 184 files · ~124,997 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 834 nodes · 1663 edges · 71 communities (37 shown, 34 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9f967b2e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Shared UI Kit & Mixed Feature Widgets|Shared UI Kit & Mixed Feature Widgets]]
- [[_COMMUNITY_Package Config & Dependencies|Package Config & Dependencies]]
- [[_COMMUNITY_Bet Detail Feature|Bet Detail Feature]]
- [[_COMMUNITY_Rewards Feature|Rewards Feature]]
- [[_COMMUNITY_Home Screen Feature|Home Screen Feature]]
- [[_COMMUNITY_Team Detail Feature|Team Detail Feature]]
- [[_COMMUNITY_Match Schedule & Group Standings|Match Schedule & Group Standings]]
- [[_COMMUNITY_Betting (Match List) Feature|Betting (Match List) Feature]]
- [[_COMMUNITY_Teams List Feature|Teams List Feature]]
- [[_COMMUNITY_Expo App Configuration (app.json)|Expo App Configuration (app.json)]]
- [[_COMMUNITY_Sticker Album Overview Feature|Sticker Album Overview Feature]]
- [[_COMMUNITY_Sticker Packet Opening & Shared Infra|Sticker Packet Opening & Shared Infra]]
- [[_COMMUNITY_Team Sticker Album Feature|Team Sticker Album Feature]]
- [[_COMMUNITY_Ranking Feature|Ranking Feature]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Reset Project Script|Reset Project Script]]
- [[_COMMUNITY_User Domain Entity|User Domain Entity]]
- [[_COMMUNITY_Project Docs & Agent Directives|Project Docs & Agent Directives]]
- [[_COMMUNITY_Root App Layout & Query Client|Root App Layout & Query Client]]
- [[_COMMUNITY_App Entry Route|App Entry Route]]
- [[_COMMUNITY_Global Type Declarations|Global Type Declarations]]
- [[_COMMUNITY_Tournament Phase Value Object|Tournament Phase Value Object]]
- [[_COMMUNITY_Session Status Value Object|Session Status Value Object]]
- [[_COMMUNITY_Expo Symbol Icon (SVG)|Expo Symbol Icon (SVG)]]
- [[_COMMUNITY_Adaptive Icon Grid Guide|Adaptive Icon Grid Guide]]
- [[_COMMUNITY_Android Icon Background Layer|Android Icon Background Layer]]
- [[_COMMUNITY_Android Icon Foreground Layer|Android Icon Foreground Layer]]
- [[_COMMUNITY_Android Icon Monochrome Layer|Android Icon Monochrome Layer]]
- [[_COMMUNITY_Expo Badge (Dark)|Expo Badge (Dark)]]
- [[_COMMUNITY_Expo Badge (White)|Expo Badge (White)]]
- [[_COMMUNITY_Expo Logo Asset|Expo Logo Asset]]
- [[_COMMUNITY_App Favicon|App Favicon]]
- [[_COMMUNITY_Main App Icon|Main App Icon]]
- [[_COMMUNITY_Logo Glow Graphic|Logo Glow Graphic]]
- [[_COMMUNITY_React Logo (2x)|React Logo (2x)]]
- [[_COMMUNITY_React Logo (3x)|React Logo (3x)]]
- [[_COMMUNITY_React Logo (1x)|React Logo (1x)]]
- [[_COMMUNITY_Splash Screen Icon|Splash Screen Icon]]
- [[_COMMUNITY_Explore Tab Icon (1x)|Explore Tab Icon (1x)]]
- [[_COMMUNITY_Explore Tab Icon (2x)|Explore Tab Icon (2x)]]
- [[_COMMUNITY_Explore Tab Icon (3x)|Explore Tab Icon (3x)]]
- [[_COMMUNITY_Home Tab Icon (1x)|Home Tab Icon (1x)]]
- [[_COMMUNITY_Home Tab Icon (2x)|Home Tab Icon (2x)]]
- [[_COMMUNITY_Home Tab Icon (3x)|Home Tab Icon (3x)]]
- [[_COMMUNITY_Web Tutorial Screenshot|Web Tutorial Screenshot]]
- [[_COMMUNITY_useAuth.ts|useAuth.ts]]
- [[_COMMUNITY_Screen.tsx|Screen.tsx]]
- [[_COMMUNITY_Ação manual no Firebase (fora deste plano — feita por você)|Ação manual no Firebase (fora deste plano — feita por você)]]
- [[_COMMUNITY_Arquitetura|Arquitetura]]
- [[_COMMUNITY_ProfileScreen.tsx|ProfileScreen.tsx]]
- [[_COMMUNITY_SQLite Integration (Plan 1 of 2) Implementation Plan|SQLite Integration (Plan 1 of 2) Implementation Plan]]
- [[_COMMUNITY_Arquivo por arquivo|Arquivo por arquivo]]
- [[_COMMUNITY_theme.ts|theme.ts]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_build-sqlite-db.mjs|build-sqlite-db.mjs]]
- [[_COMMUNITY_HomeScreen.tsx|HomeScreen.tsx]]
- [[_COMMUNITY_AlbumGroupList.tsx|AlbumGroupList.tsx]]
- [[_COMMUNITY_Status Integração SQLite (Planos 1 e 2) — refeita do zero neste computador|Status: Integração SQLite (Planos 1 e 2) — refeita do zero neste computador]]
- [[_COMMUNITY_scripts|scripts]]
- [[_COMMUNITY_Welcome to your Expo app 👋|Welcome to your Expo app 👋]]
- [[_COMMUNITY_seed-bots-firestore.mjs|seed-bots-firestore.mjs]]
- [[_COMMUNITY_ProfileStatsGrid.tsx|ProfileStatsGrid.tsx]]
- [[_COMMUNITY_eslint.config.js|eslint.config.js]]
- [[_COMMUNITY_AGENTS|AGENTS.md]]
- [[_COMMUNITY_firebase-auth.d.ts|firebase-auth.d.ts]]
- [[_COMMUNITY_CLAUDE.md (includes AGENTS.md)|CLAUDE.md (includes AGENTS.md)]]
- [[_COMMUNITY_create-expo-app (npm package)|create-expo-app (npm package)]]
- [[_COMMUNITY_Expo App Project (create-expo-app)|Expo App Project (create-expo-app)]]
- [[_COMMUNITY_File-based Routing (Expo Router)|File-based Routing (Expo Router)]]
- [[_COMMUNITY_npm run reset-project|npm run reset-project]]

## God Nodes (most connected - your core abstractions)
1. `theme` - 56 edges
2. `UsuarioRepository` - 32 edges
3. `initDb()` - 27 edges
4. `getDbSync()` - 23 edges
5. `Ação manual no Firebase (fora deste plano — feita por você)` - 21 edges
6. `useAuthStore` - 19 edges
7. `Screen()` - 16 edges
8. `IProfileRepository` - 15 edges
9. `getFlagUrl()` - 15 edges
10. `getTeamName()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `apurarPalpitesPendentes()`  [EXTRACTED]
  src/app/_layout.tsx → src/shareds/infrastructure/firebase/apurarPalpites.ts
- `RootLayout()` --calls--> `initDb()`  [EXTRACTED]
  src/app/_layout.tsx → src/shareds/infrastructure/sqlite/db.ts
- `AlbumProgressHeaderProps` --references--> `AlbumProgress`  [EXTRACTED]
  src/features/album-sticker-page/presentation/components/AlbumProgressHeader.tsx → src/features/album-page/domain/entities/Album.ts
- `useAuth()` --calls--> `mensagemErroAuth()`  [EXTRACTED]
  src/features/auth-page/presentation/hooks/useAuth.ts → src/features/auth-page/infrastructure/authErrorMessages.ts
- `MatchFilterChipsProps` --references--> `MatchFilter`  [EXTRACTED]
  src/features/betting-page/presentation/components/MatchFilterChips.tsx → src/features/betting-page/domain/entities/Match.ts

## Import Cycles
- None detected.

## Communities (71 total, 34 thin omitted)

### Community 0 - "Shared UI Kit & Mixed Feature Widgets"
Cohesion: 0.11
Nodes (20): OpenPacketUseCase, GanhaFigurinha, PacketOpenResult, QUANTIDADES_ABERTURA, IPacketRepository, delay(), PacketRepository, PacketCard() (+12 more)

### Community 1 - "Package Config & Dependencies"
Cohesion: 0.06
Nodes (35): dependencies, axios, expo, expo-asset, expo-constants, expo-device, expo-file-system, expo-font (+27 more)

### Community 2 - "Bet Detail Feature"
Cohesion: 0.09
Nodes (24): GetMatchForBetUseCase, SaveBetUseCase, Bet, BET_REWARDS, BetChoice, MatchDetail, IBetRepository, FASE_LABEL (+16 more)

### Community 3 - "Rewards Feature"
Cohesion: 0.10
Nodes (21): ClaimRewardUseCase, GetRewardsUseCase, Reward, IRewardRepository, calcularProgresso(), getRecompensas(), recompensaNumero(), RecompensaRow (+13 more)

### Community 4 - "Home Screen Feature"
Cohesion: 0.20
Nodes (11): GetHomeDataUseCase, DailyReward, HomeData, PacotePreviewCard, IHomeRepository, HomeRepository, DailyRewardBanner(), DailyRewardBannerProps (+3 more)

### Community 5 - "Team Detail Feature"
Cohesion: 0.12
Nodes (18): GetTeamDetailUseCase, Jogador, TimeDetalhe, ITeamDetailRepository, mockTeamDetailRepository, SquadList(), SquadListProps, styles (+10 more)

### Community 6 - "Match Schedule & Group Standings"
Cohesion: 0.14
Nodes (14): GetGroupScheduleUseCase, GroupSchedule, ScheduleGame, Standing, IMatchScheduleRepository, GroupStandingsTable(), GroupStandingsTableProps, styles (+6 more)

### Community 7 - "Betting (Match List) Feature"
Cohesion: 0.14
Nodes (18): GetMatchesUseCase, Match, MatchFase, MatchFilter, MatchStatus, IBettingRepository, BettingRepository, FASE_LABEL (+10 more)

### Community 8 - "Teams List Feature"
Cohesion: 0.11
Nodes (17): GetTeamsUseCase, TimeResumo, ITeamRepository, mockTeamRepository, FilterChips(), FilterChipsProps, styles, styles (+9 more)

### Community 9 - "Expo App Configuration (app.json)"
Cohesion: 0.08
Nodes (25): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, reactCompiler (+17 more)

### Community 10 - "Sticker Album Overview Feature"
Cohesion: 0.09
Nodes (40): GetAlbumOverviewUseCase, AlbumOverview, GroupTeam, AlbumRepository, FaseGrupoRow, TimeRow, TimeRow, getDailyCountdown() (+32 more)

### Community 11 - "Sticker Packet Opening & Shared Infra"
Cohesion: 0.50
Nodes (3): httpClient, TODO: Implementar lógica de refresh token se 401, localCache

### Community 12 - "Team Sticker Album Feature"
Cohesion: 0.11
Nodes (18): AlbumProgress, GetTeamAlbumUseCase, Sticker, StickerTeam, TeamAlbum, StickerRepository, AlbumProgressHeader(), AlbumProgressHeaderProps (+10 more)

### Community 13 - "Ranking Feature"
Cohesion: 0.22
Nodes (9): GetRankDataUseCase, PlayerRank, RankData, RankRepository, toPlayerRank(), useRank(), RankScreen(), styles (+1 more)

### Community 14 - "TypeScript Config"
Cohesion: 0.18
Nodes (10): compilerOptions, paths, strict, extends, include, @/*, @/assets/*, @/components/* (+2 more)

### Community 15 - "Reset Project Script"
Cohesion: 0.22
Nodes (7): exampleDirPath, fs, oldDirs, path, readline, rl, root

### Community 18 - "Root App Layout & Query Client"
Cohesion: 0.08
Nodes (27): RootLayout(), AlbumActionsRow(), AlbumActionsRowProps, styles, AlbumProgressCard(), AlbumProgressCardProps, ringStyles, styles (+19 more)

### Community 19 - "App Entry Route"
Cohesion: 0.11
Nodes (12): DeleteAccountUseCase, GetProfileUseCase, UpdateProfileAvatarUseCase, UpdateProfileNameUseCase, AVATARES_DISPONIVEIS, Profile, IProfileRepository, calcularEstatisticasApostas() (+4 more)

### Community 20 - "Global Type Declarations"
Cohesion: 0.33
Nodes (5): *.css, *.jpeg, *.jpg, *.png, *.webp

### Community 45 - "useAuth.ts"
Cohesion: 0.12
Nodes (12): CadastroUseCase, LoginUseCase, RedefinirSenhaUseCase, CredenciaisLogin, DadosCadastro, IAuthRepository, FIREBASE_ERROR_MESSAGES, mensagemErroAuth() (+4 more)

### Community 46 - "Screen.tsx"
Cohesion: 0.12
Nodes (17): AuthPrimaryButton(), AuthPrimaryButtonProps, styles, AuthTextField(), AuthTextFieldProps, styles, useAuth(), ForgotPasswordScreen() (+9 more)

### Community 47 - "Ação manual no Firebase (fora deste plano — feita por você)"
Cohesion: 0.08
Nodes (23): Autenticação Firebase + Gating de Login — Implementation Plan, Ação manual no Firebase (fora deste plano — feita por você), Global Constraints, Task 10: Tela de Login + rota, Task 11: Tela de Cadastro + rota, Task 12: Tela de "Esqueci minha senha" + rota, Task 13: Religar o `_layout.tsx` raiz (sessão, heartbeat, apuração, novas rotas), Task 14: `HeaderWidget` como fonte única de verdade da sessão (+15 more)

### Community 48 - "Arquitetura"
Cohesion: 0.12
Nodes (15): 1. Estado global de sessão — `useAuthStore` (zustand), 2. `firebaseClient.ts` — novas funções, 3. Gating — dois padrões, 4. `HeaderWidget` — fonte única de verdade, 5. `UsuarioRepository.ts`, 6. Novo feature `auth-page` (clean architecture, mesmo padrão das demais), 7. Heartbeat, Arquitetura (+7 more)

### Community 49 - "ProfileScreen.tsx"
Cohesion: 0.16
Nodes (10): AvatarPickerModal(), DangerZoneCard(), DangerZoneCardProps, styles, GuestProfilePrompt(), styles, SignOutButton(), styles (+2 more)

### Community 50 - "SQLite Integration (Plan 1 of 2) Implementation Plan"
Cohesion: 0.13
Nodes (14): File Structure, Global Constraints, Self-Review Notes (for whoever executes this plan), SQLite Integration (Plan 1 of 2) Implementation Plan, Task 10: Delete dead JSON files, full-app pass, Task 1: Add dependencies, Task 2: Build script — generate `assets/db/copa.db`, Task 3: Runtime singleton — `src/shareds/infrastructure/sqlite/db.ts` (+6 more)

### Community 51 - "Arquivo por arquivo"
Cohesion: 0.14
Nodes (13): 1. `scripts/build-sqlite-db.mjs` — gera o banco, 2. `scripts/build-sqlite-db.test.mjs` — teste do script acima, 3. `assets/db/copa.db` — o banco em si, 4. `src/shareds/infrastructure/sqlite/db.ts` — o singleton de runtime, 5. `src/app/_layout.tsx` — onde o boot acontece, 6. Helpers de consulta (uma camada fina sobre `getDbSync()`), 7. `src/shareds/infrastructure/teams/timeHelpers.ts`, Arquivo por arquivo (+5 more)

### Community 52 - "theme.ts"
Cohesion: 0.20
Nodes (8): ProfileHeaderCard(), ProfileHeaderCardProps, styles, colors, radius, spacing, theme, typography

### Community 53 - "package.json"
Cohesion: 0.20
Nodes (9): devDependencies, eslint, eslint-config-expo, @types/react, typescript, main, name, private (+1 more)

### Community 54 - "build-sqlite-db.mjs"
Cohesion: 0.27
Nodes (8): buildDatabase(), outDir, outPath, readJson(), rootDir, sourceExists(), realDbPath, rootDir

### Community 55 - "HomeScreen.tsx"
Cohesion: 0.27
Nodes (6): FeaturedMatch, FeaturedMatchCard(), FeaturedMatchCardProps, styles, HomeScreen(), styles

### Community 56 - "AlbumGroupList.tsx"
Cohesion: 0.24
Nodes (8): AlbumGroup, AlbumGroupCard(), AlbumGroupCardProps, GroupTeam, styles, AlbumGroupList(), AlbumGroupListProps, styles

### Community 57 - "Status: Integração SQLite (Planos 1 e 2) — refeita do zero neste computador"
Cohesion: 0.25
Nodes (7): Decisões já tomadas (não precisa perguntar de novo), Desvios encontrados em relação ao texto do Plano 1 (código-fonte, não histórico), O que falta, O que o Plano 2 fez, O que precisa acontecer antes de testar/mergear, Onde as coisas estão, Status: Integração SQLite (Planos 1 e 2) — refeita do zero neste computador

### Community 58 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, android, db:build, ios, lint, reset-project, start, web

### Community 59 - "Welcome to your Expo app 👋"
Cohesion: 0.29
Nodes (6): Get a fresh project, Get started, Join the community, Learn more, Other setup steps, Welcome to your Expo app 👋

### Community 60 - "seed-bots-firestore.mjs"
Cohesion: 0.33
Nodes (5): app, auth, bots, db, firebaseConfig

### Community 61 - "ProfileStatsGrid.tsx"
Cohesion: 0.40
Nodes (4): BettingStats, ProfileStatsGrid(), ProfileStatsGridProps, styles

## Knowledge Gaps
- **307 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+302 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `theme` connect `theme.ts` to `Shared UI Kit & Mixed Feature Widgets`, `Bet Detail Feature`, `Rewards Feature`, `Home Screen Feature`, `Team Detail Feature`, `Match Schedule & Group Standings`, `Betting (Match List) Feature`, `Teams List Feature`, `Team Sticker Album Feature`, `Ranking Feature`, `Screen.tsx`, `ProfileScreen.tsx`, `Root App Layout & Query Client`, `App Entry Route`, `HomeScreen.tsx`, `AlbumGroupList.tsx`, `ProfileStatsGrid.tsx`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Why does `UsuarioRepository` connect `Sticker Album Overview Feature` to `Shared UI Kit & Mixed Feature Widgets`, `Rewards Feature`, `Betting (Match List) Feature`, `Ranking Feature`, `Root App Layout & Query Client`, `App Entry Route`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `initDb()` connect `Sticker Album Overview Feature` to `Shared UI Kit & Mixed Feature Widgets`, `Root App Layout & Query Client`, `Rewards Feature`, `Betting (Match List) Feature`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _309 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Shared UI Kit & Mixed Feature Widgets` be split into smaller, more focused modules?**
  _Cohesion score 0.1092436974789916 - nodes in this community are weakly interconnected._
- **Should `Package Config & Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `Bet Detail Feature` be split into smaller, more focused modules?**
  _Cohesion score 0.08599033816425121 - nodes in this community are weakly interconnected._