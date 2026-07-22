import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Match, MatchFilter } from '../../domain/entities/Match';
import { BettingRepository } from '../../infrastructure/repositories/BettingRepository';
import { GetMatchesUseCase } from '../../application/usecases/GetMatchesUseCase';

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<MatchFilter>('hoje');
  const [error, setError] = useState<Error | null>(null);

  const fetchMatches = useCallback(async (f: MatchFilter) => {
    try {
      setIsLoading(true);
      const repo = new BettingRepository();
      const useCase = new GetMatchesUseCase(repo);
      const result = await useCase.execute(f);
      setMatches(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar partidas'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMatches(filter);
    }, [filter, fetchMatches])
  );

  const changeFilter = (f: MatchFilter) => {
    setFilter(f);
    fetchMatches(f);
  };

  return { matches, isLoading, error, filter, changeFilter };
}
