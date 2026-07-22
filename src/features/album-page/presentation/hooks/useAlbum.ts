import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { AlbumOverview } from '../../domain/entities/Album';
import { AlbumRepository } from '../../infrastructure/repositories/AlbumRepository';
import { GetAlbumOverviewUseCase } from '../../application/usecases/GetAlbumOverviewUseCase';

export function useAlbum() {
  const [data, setData] = useState<AlbumOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const repo = new AlbumRepository();
      const useCase = new GetAlbumOverviewUseCase(repo);
      const result = await useCase.execute();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load album data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  return { data, isLoading, error, refetch: fetchData };
}
