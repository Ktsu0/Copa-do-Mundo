import { IPacketRepository } from '../../domain/repositories/IPacketRepository';
import { PacketOpenResult } from '../../domain/entities/Packet';

export class OpenPacketUseCase {
  constructor(private repository: IPacketRepository) {}

  async execute(quantidade: number): Promise<PacketOpenResult[]> {
    const disponiveis = await this.repository.getPacotesDisponiveis();
    if (disponiveis < quantidade) {
      throw new Error('Você não tem pacotinhos suficientes.');
    }
    return this.repository.openPackets(quantidade);
  }
}
