# Copa do Mundo App

Aplicativo mobile (React Native / Expo) para acompanhar a Copa do Mundo: times, jogos, apostas com amigos, ranking de pontos, album de figurinhas e recompensas diarias.

## Funcionalidades

- **Autenticacao** - login, cadastro e recuperacao de senha (Firebase Auth)
- **Times** - lista e detalhes de selecoes, elenco e titulos
- **Calendario de jogos** - jogos organizados por grupo/fase
- **Apostas** - palpites de placar, vencedor e artilheiro, com pontuacao automatica
- **Ranking** - classificacao dos usuarios por pontos
- **Album de figurinhas** - colecao de times por grupo, com progresso
- **Pacotes e recompensas** - abertura de pacotes e recompensa diaria
- **Perfil** - edicao de dados, avatar e exclusao de conta

## Tecnologias

- React Native + Expo (expo-router)
- TypeScript
- Firebase (Auth + Firestore)
- SQLite local (dados de times/jogos)
- Zustand (estado global) + React Query
- Jest para testes

## Como rodar localmente

```bash
npm install
npx expo start
```

Na saida do Expo voce escolhe abrir o app em emulador Android, simulador iOS, ou no Expo Go.

```bash
npm run android   # emulador/dispositivo Android
npm run ios       # simulador iOS
npm run web       # versao web
npm test          # suite de testes
npm run lint      # lint do projeto
```

Crie um arquivo `.env` a partir de `.env.example` com as credenciais do Firebase antes de rodar.

## Estrutura do projeto

Organizado por features (Clean Architecture simplificada), cada uma com camadas de dominio, aplicacao, infraestrutura e apresentacao:

- `src/features/` - telas e logica de cada funcionalidade (auth, home, times, apostas, ranking, album, recompensas, pacotes, perfil)
- `src/shareds/` - codigo compartilhado (Firebase, SQLite, componentes e hooks comuns)
- `src/app/` - rotas (expo-router)
- `docs/` - documentacao tecnica e relatorios de auditoria do projeto

## Autor

Desenvolvido por [Ktsu0](https://github.com/Ktsu0).
