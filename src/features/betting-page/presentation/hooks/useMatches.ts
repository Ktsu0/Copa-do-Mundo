import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { Match, MatchFilter } from '../../domain/entities/Match';
import { BettingRepository } from '../../infrastructure/repositories/BettingRepository';
import { GetMatchesUseCase } from '../../application/usecases/GetMatchesUseCase';

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<MatchFilter>('hoje');
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchMatches = useCallback(async (f: MatchFilter) => {
    const requestId = ++requestIdRef.current;
    try {
      setIsLoading(true);
      const repo = new BettingRepository();
      const useCase = new GetMatchesUseCase(repo);
      const result = await useCase.execute(f);
      // Trocar de filtro rapido pode fazer um fetch antigo resolver depois
      // de um mais novo -- so aplica se ainda for o pedido mais recente.
      if (requestId !== requestIdRef.current) return;
      setMatches(result);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err : new Error('Erro ao carregar partidas'));
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  // O efeito de foco abaixo ja busca de novo sempre que `filter` muda --
  // muda so o estado aqui, sem tambem chamar fetchMatches, senao cada troca
  // de filtro disparava duas buscas identicas concorrentes.
  useFocusEffect(
    useCallback(() => {
      fetchMatches(filter);
    }, [filter, fetchMatches])
  );

  const changeFilter = (f: MatchFilter) => {
    setFilter(f);
  };

  return { matches, isLoading, error, filter, changeFilter };
}
