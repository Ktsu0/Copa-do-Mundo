import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAsyncDataResult<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Padrao "isLoading/error/try-catch-finally" que varios hooks de feature
// reimplementavam cada um do seu jeito -- e, na maioria, o erro acabava
// nunca chegando na tela. Tem protecao contra resposta desatualizada: se as
// `deps` mudarem (ex.: troca de id) enquanto uma busca anterior ainda esta
// em voo, a resposta antiga e descartada em vez de sobrescrever a mais nova.
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[], initialData: T): UseAsyncDataResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(() => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        if (requestId !== requestIdRef.current) return;
        setData(result);
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return;
        setError(err instanceof Error ? err : new Error('Falha ao carregar dados.'));
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `deps` e repassado pelo chamador de proposito, como em useCallback/useEffect normais.
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
