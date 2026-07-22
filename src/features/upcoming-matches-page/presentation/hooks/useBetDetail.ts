import { useState, useEffect, useCallback } from 'react';
import { MatchDetail, Bet, BetChoice } from '../../domain/entities/Bet';
import { BetRepository } from '../../infrastructure/repositories/BetRepository';
import { GetMatchForBetUseCase } from '../../application/usecases/GetMatchForBetUseCase';
import { SaveBetUseCase } from '../../application/usecases/SaveBetUseCase';
import { useUsuarioAtual } from '@/shareds/presentation/hooks/useUsuarioAtual';

export function useBetDetail(jogoId: string) {
  const { usuario } = useUsuarioAtual();
  const isMenorDeIdade = usuario?.maior_idade === false;

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [existingBet, setExistingBet] = useState<Bet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [placarCasa, setPlacarCasa] = useState(0);
  const [placarFora, setPlacarFora] = useState(0);
  const [primeiroMarcar, setPrimeiroMarcar] = useState<BetChoice | null>(null);
  const [vencedor, setVencedor] = useState<BetChoice | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const repo = new BetRepository();
      const matchUC = new GetMatchForBetUseCase(repo);
      const [matchData, betData] = await Promise.all([
        matchUC.execute(jogoId),
        repo.getBetForMatch(jogoId),
      ]);
      setMatch(matchData);
      if (betData) {
        setExistingBet(betData);
        setPlacarCasa(betData.placarCasa);
        setPlacarFora(betData.placarFora);
        setPrimeiroMarcar(betData.primeiroMarcar);
        setVencedor(betData.vencedor);
        setIsSaved(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar partida.'));
    } finally {
      setIsLoading(false);
    }
  }, [jogoId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveBet = async () => {
    if (!match || isMenorDeIdade) return false;
    try {
      setIsSaving(true);
      const repo = new BetRepository();
      const useCase = new SaveBetUseCase(repo);
      const bet: Bet = {
        jogoId: match.id,
        placarCasa,
        placarFora,
        primeiroMarcar,
        vencedor,
      };
      const success = await useCase.execute(bet);
      if (success) {
        setIsSaved(true);
        setExistingBet(bet);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao salvar palpite.'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const isBlocked = match?.status !== 'agendado' || isMenorDeIdade;

  const hasChanges = !existingBet
    || existingBet.placarCasa !== placarCasa
    || existingBet.placarFora !== placarFora
    || existingBet.primeiroMarcar !== primeiroMarcar
    || existingBet.vencedor !== vencedor;

  return {
    match, existingBet, isLoading, isSaving, isSaved, error, isBlocked, isMenorDeIdade, hasChanges,
    placarCasa, setPlacarCasa,
    placarFora, setPlacarFora,
    primeiroMarcar, setPrimeiroMarcar,
    vencedor, setVencedor,
    saveBet,
  };
}
