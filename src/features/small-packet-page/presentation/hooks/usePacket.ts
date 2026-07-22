import { useState, useEffect, useCallback } from 'react';
import { PacketOpenResult } from '../../domain/entities/Packet';
import { PacketRepository } from '../../infrastructure/repositories/PacketRepository';
import { OpenPacketUseCase } from '../../application/usecases/OpenPacketUseCase';
import { UsuarioRepository } from '@/shareds/infrastructure/firebase/UsuarioRepository';

export function usePacket() {
  const [pacotinhosDisponiveis, setPacotinhosDisponiveis] = useState(0);
  const [fila, setFila] = useState<PacketOpenResult[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updatePacketsCount = useCallback(async () => {
    const usuario = await UsuarioRepository.getUsuario();
    setPacotinhosDisponiveis(usuario?.qtd_pacotes ?? 0);
  }, []);

  useEffect(() => {
    updatePacketsCount();
  }, [updatePacketsCount]);

  const openPackets = async (quantidade: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const repo = new PacketRepository();
      const useCase = new OpenPacketUseCase(repo);
      const resultados = await useCase.execute(quantidade);

      setFila(resultados);
      setIndiceAtual(0);
      await updatePacketsCount();
      return resultados;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro ao abrir pacotinho(s)');
      setError(errorObj);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Avanca para o proximo pacote da fila (abertura em sequencia, um por
  // vez). Retorna false quando a fila termina.
  const proximoPacote = (): boolean => {
    if (indiceAtual + 1 < fila.length) {
      setIndiceAtual(indiceAtual + 1);
      return true;
    }
    setFila([]);
    setIndiceAtual(0);
    return false;
  };

  return {
    pacotinhosDisponiveis,
    pacoteAtual: fila[indiceAtual] ?? null,
    posicaoNaFila: indiceAtual + 1,
    totalNaFila: fila.length,
    isLoading,
    error,
    openPackets,
    proximoPacote,
    updatePacketsCount,
  };
}
