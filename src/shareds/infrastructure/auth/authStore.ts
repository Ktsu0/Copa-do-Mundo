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
