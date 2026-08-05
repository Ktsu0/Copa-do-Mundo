import { IBetRepository } from '../../domain/repositories/IBetRepository';
import { Bet, PLACAR_MAXIMO } from '../../domain/entities/Bet';

function isPlacarValido(placar: number): boolean {
  return Number.isInteger(placar) && placar >= 0 && placar <= PLACAR_MAXIMO;
}

export class SaveBetUseCase {
  constructor(private repository: IBetRepository) {}

  async execute(bet: Bet): Promise<boolean> {
    if (!isPlacarValido(bet.placarCasa) || !isPlacarValido(bet.placarFora)) {
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
