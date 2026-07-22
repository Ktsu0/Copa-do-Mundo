import defaultFigurinhas from '../../../infra/figurinhas.json';
import defaultRecompensas from '../../../infra/recompensas.json';
import defaultJogos from '../../../infra/jogos.json';
import defaultFaseGrupo from '../../../infra/fase_grupo.json';

// Dados de referencia estaticos do app (times, figurinhas, recompensas,
// jogos, fases de grupo) -- ja vem embutidos no bundle via os JSONs, entao
// nao ha motivo pra cachear em MMKV (isso so causaria dados desatualizados
// sempre que o JSON mudasse entre versoes do app, sem nunca re-sincronizar).
// Dados do usuario (pontos, palpites, album, conquistas, pacotes) vivem so
// no Firestore -- ver @/shareds/infrastructure/firebase/UsuarioRepository.
export const localDb = {
  getFigurinhas: () => defaultFigurinhas,
  getRecompensas: () => defaultRecompensas,
  getJogos: () => defaultJogos,
  getFaseGrupo: () => defaultFaseGrupo,
};
