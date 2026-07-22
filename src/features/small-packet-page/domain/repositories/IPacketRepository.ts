import { PacketOpenResult } from '../entities/Packet';

export interface IPacketRepository {
  getPacotesDisponiveis(): Promise<number>;
  openPackets(quantidade: number): Promise<PacketOpenResult[]>;
}
