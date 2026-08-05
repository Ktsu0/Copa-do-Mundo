import { useEffect, useRef, useState } from 'react';
import { TeamAlbum } from '../../domain/entities/Sticker';
import { StickerRepository } from '../../infrastructure/repositories/StickerRepository';
import { GetTeamAlbumUseCase } from '../../application/usecases/GetTeamAlbumUseCase';

export function useTeamAlbum(initialTeamId?: string) {
  const [data, setData] = useState<TeamAlbum | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId || 'BRA');
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const repo = new StickerRepository();
        const useCase = new GetTeamAlbumUseCase(repo);
        const result = await useCase.execute(selectedTeamId);
        // Troca rapida de time pode fazer uma busca antiga e mais lenta
        // resolver depois de uma mais nova -- so aplica o resultado se esse
        // ainda for o pedido mais recente.
        if (requestId !== requestIdRef.current) return;
        setData(result);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err instanceof Error ? err : new Error('Failed to load stickers'));
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedTeamId]);

  return { data, isLoading, error, selectedTeamId, setSelectedTeamId };
}
