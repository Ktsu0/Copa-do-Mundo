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
