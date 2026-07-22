import { useState, useEffect } from 'react';
import { TeamAlbum } from '../../domain/entities/Sticker';
import { StickerRepository } from '../../infrastructure/repositories/StickerRepository';
import { GetTeamAlbumUseCase } from '../../application/usecases/GetTeamAlbumUseCase';

export function useTeamAlbum(initialTeamId?: string) {
  const [data, setData] = useState<TeamAlbum | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId || 'BRA');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const repo = new StickerRepository();
        const useCase = new GetTeamAlbumUseCase(repo);
        const result = await useCase.execute(selectedTeamId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load stickers'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedTeamId]);

  return { data, isLoading, error, selectedTeamId, setSelectedTeamId };
}
