// Cria 3 contas ficticias ("bots") na colecao "usuario" do Firestore, so
// para ter comparativos no rank enquanto nao existe login/registro de
// verdade. Rodar com: node --env-file=.env scripts/seed-bots-firestore.mjs
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { addDoc, collection, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const bots = [
  {
    nome: 'Bot Ana Torcedora',
    email: 'bot.ana@teste.local',
    data_nascimento: '',
    maior_idade: true,
    pontos: 4200,
    qtd_pacote_aberto: 8,
    qtd_pacotes: 1,
    conquistas: [1, 2, 5],
    album_jogador: [1, 2, 3, 5, 9, 13, 15, 17, 18, 20],
    palpites: [],
  },
  {
    nome: 'Bot Carlos Palpiteiro',
    email: 'bot.carlos@teste.local',
    data_nascimento: '',
    maior_idade: true,
    pontos: 1800,
    qtd_pacote_aberto: 3,
    qtd_pacotes: 0,
    conquistas: [1],
    album_jogador: [2, 4, 6],
    palpites: [],
  },
  {
    nome: 'Bot Julia Craque',
    email: 'bot.julia@teste.local',
    data_nascimento: '',
    maior_idade: true,
    pontos: 650,
    qtd_pacote_aberto: 1,
    qtd_pacotes: 2,
    conquistas: [],
    album_jogador: [7],
    palpites: [],
  },
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

try {
  await signInAnonymously(auth);

  for (const bot of bots) {
    const ref = await addDoc(collection(db, 'usuario'), bot);
    console.log(`Criado: ${bot.nome} (${bot.pontos} pts) -> id ${ref.id}`);
  }

  console.log('\nPronto! 3 bots criados na colecao "usuario".');
  process.exit(0);
} catch (err) {
  console.error('ERRO:', err.code || err.message);
  process.exit(1);
}
