import { IBetRepository } from '../../domain/repositories/IBetRepository';
import { Bet } from '../../domain/entities/Bet';

export class SaveBetUseCase {
  constructor(private repository: IBetRepository) {}

  async execute(bet: Bet): Promise<boolean> {
    if (bet.placarCasa < 0 || bet.placarFora < 0) {
      throw new Error('Placar inválido.');
    }
    // Bloqueio de estado (igual jogo encerrado / sem usuario): devolve
    // false em vez de lancar, para nao colidir com o estado de erro de
    // carregamento da tela (ver BetDetailScreen -- error || !match). A UI
    // ja reflete esse bloqueio de forma proativa via isMenorDeIdade.
    const maiorDeIdade = await this.repository.isUsuarioMaiorDeIdade();
    if (!maiorDeIdade) return false;
    return this.repository.saveBet(bet);
  }
}
