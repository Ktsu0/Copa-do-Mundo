# Graph Report - .  (2026-07-06)

## Corpus Check
- 157 files · ~73,669 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 522 nodes · 960 edges · 45 communities (18 shown, 27 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

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

## God Nodes (most connected - your core abstractions)
1. `theme` - 40 edges
2. `localDb` - 14 edges
3. `expo` - 13 edges
4. `TimeDetalhe` - 12 edges
5. `Screen()` - 12 edges
6. `Match` - 11 edges
7. `MatchFilter` - 10 edges
8. `Reward` - 10 edges
9. `TimeResumo` - 10 edges
10. `Bet` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Expo App Project (create-expo-app)` --conceptually_related_to--> `Expo HAS CHANGED - Read Versioned Docs Directive`  [INFERRED]
  README.md → AGENTS.md
- `AlbumScreen()` --references--> `react`  [EXTRACTED]
  src/features/album-page/presentation/screens/AlbumScreen.tsx → package.json
- `CLAUDE.md (includes AGENTS.md)` --references--> `Expo HAS CHANGED - Read Versioned Docs Directive`  [EXTRACTED]
  CLAUDE.md → AGENTS.md
- `AlbumScreen()` --calls--> `useAlbum()`  [EXTRACTED]
  src/features/album-page/presentation/screens/AlbumScreen.tsx → src/features/album-page/presentation/hooks/useAlbum.ts
- `MatchFilterChipsProps` --references--> `MatchFilter`  [EXTRACTED]
  src/features/betting-page/presentation/components/MatchFilterChips.tsx → src/features/betting-page/domain/entities/Match.ts

## Import Cycles
- None detected.

## Communities (45 total, 27 thin omitted)

### Community 0 - "Shared UI Kit & Mixed Feature Widgets"
Cohesion: 0.06
Nodes (36): AlbumActionsRow(), AlbumActionsRowProps, styles, AlbumProgressCard(), AlbumProgressCardProps, styles, styles, GanhaFigurinha (+28 more)

### Community 1 - "Package Config & Dependencies"
Cohesion: 0.04
Nodes (44): dependencies, axios, expo, expo-constants, expo-device, expo-font, expo-glass-effect, expo-image (+36 more)

### Community 2 - "Bet Detail Feature"
Cohesion: 0.09
Nodes (24): GetMatchForBetUseCase, SaveBetUseCase, Bet, BET_REWARDS, BetChoice, MatchDetail, IBetRepository, BetRepository (+16 more)

### Community 3 - "Rewards Feature"
Cohesion: 0.10
Nodes (17): ClaimRewardUseCase, GetRewardsUseCase, Reward, IRewardRepository, RewardRepository, RewardCard(), RewardCardProps, styles (+9 more)

### Community 4 - "Home Screen Feature"
Cohesion: 0.12
Nodes (20): GetHomeDataUseCase, DailyReward, FeaturedMatch, HomeData, IHomeRepository, countryCodeMap, getDailyCountdown(), getFlagUrl() (+12 more)

### Community 5 - "Team Detail Feature"
Cohesion: 0.12
Nodes (19): GetTeamDetailUseCase, Jogador, TimeDetalhe, ITeamDetailRepository, mockTeamDetailRepository, TeamDetailRepository, SquadList(), SquadListProps (+11 more)

### Community 6 - "Match Schedule & Group Standings"
Cohesion: 0.12
Nodes (19): MatchCard(), GetGroupScheduleUseCase, GroupSchedule, ScheduleGame, Standing, IMatchScheduleRepository, countryCodeMap, getFlagUrl() (+11 more)

### Community 7 - "Betting (Match List) Feature"
Cohesion: 0.14
Nodes (19): GetMatchesUseCase, Match, MatchFase, MatchFilter, MatchStatus, IBettingRepository, BettingRepository, getFlagUrl() (+11 more)

### Community 8 - "Teams List Feature"
Cohesion: 0.11
Nodes (18): GetTeamsUseCase, TimeResumo, ITeamRepository, mockTeamRepository, TeamRepository, FilterChips(), FilterChipsProps, styles (+10 more)

### Community 9 - "Expo App Configuration (app.json)"
Cohesion: 0.08
Nodes (25): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, reactCompiler (+17 more)

### Community 10 - "Sticker Album Overview Feature"
Cohesion: 0.16
Nodes (13): GetAlbumOverviewUseCase, AlbumGroup, AlbumOverview, GroupTeam, AlbumRepository, AlbumGroupCard(), AlbumGroupCardProps, GroupTeam (+5 more)

### Community 11 - "Sticker Packet Opening & Shared Infra"
Cohesion: 0.19
Nodes (8): OpenPacketUseCase, PacketOpenResult, IPacketRepository, PacketRepository, httpClient, TODO: Implementar lógica de refresh token se 401, localCache, localDb

### Community 12 - "Team Sticker Album Feature"
Cohesion: 0.21
Nodes (9): AlbumProgress, GetTeamAlbumUseCase, Sticker, StickerTeam, TeamAlbum, StickerRepository, useTeamAlbum(), AlbumStickerScreen() (+1 more)

### Community 13 - "Ranking Feature"
Cohesion: 0.24
Nodes (7): GetRankDataUseCase, PlayerRank, RankData, RankRepository, useRank(), RankScreen(), styles

### Community 14 - "TypeScript Config"
Cohesion: 0.18
Nodes (10): compilerOptions, paths, strict, extends, include, @/*, @/assets/*, @/components/* (+2 more)

### Community 15 - "Reset Project Script"
Cohesion: 0.22
Nodes (7): exampleDirPath, fs, oldDirs, path, readline, rl, root

### Community 17 - "Project Docs & Agent Directives"
Cohesion: 0.33
Nodes (6): Expo HAS CHANGED - Read Versioned Docs Directive, CLAUDE.md (includes AGENTS.md), create-expo-app (npm package), Expo App Project (create-expo-app), File-based Routing (Expo Router), npm run reset-project

## Knowledge Gaps
- **176 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+171 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `theme` connect `Shared UI Kit & Mixed Feature Widgets` to `Bet Detail Feature`, `Rewards Feature`, `Home Screen Feature`, `Team Detail Feature`, `Match Schedule & Group Standings`, `Betting (Match List) Feature`, `Teams List Feature`, `Sticker Album Overview Feature`, `Team Sticker Album Feature`, `Ranking Feature`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **Why does `AlbumScreen()` connect `Package Config & Dependencies` to `Shared UI Kit & Mixed Feature Widgets`, `Sticker Album Overview Feature`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _177 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Shared UI Kit & Mixed Feature Widgets` be split into smaller, more focused modules?**
  _Cohesion score 0.06196078431372549 - nodes in this community are weakly interconnected._
- **Should `Package Config & Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `Bet Detail Feature` be split into smaller, more focused modules?**
  _Cohesion score 0.09468599033816426 - nodes in this community are weakly interconnected._
- **Should `Rewards Feature` be split into smaller, more focused modules?**
  _Cohesion score 0.1036036036036036 - nodes in this community are weakly interconnected._