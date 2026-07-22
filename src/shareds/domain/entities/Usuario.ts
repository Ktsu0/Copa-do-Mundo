export class Usuario {
  constructor(
    public readonly id: string,
    public nome: string,
    public email: string,
    public pontos: number,
    public fotoUrl?: string,
    public posicaoRanking?: number
  ) {}

  public adicionarPontos(valor: number): void {
    if (valor > 0) {
      this.pontos += valor;
    }
  }

  public removerPontos(valor: number): void {
    if (valor > 0) {
      this.pontos = Math.max(0, this.pontos - valor);
    }
  }

  public zerarPontos(): void {
    this.pontos = 0;
  }

  public atualizarPerfil(dados: { nome?: string; fotoUrl?: string }): void {
    if (dados.nome !== undefined) {
      this.nome = dados.nome;
    }
    if (dados.fotoUrl !== undefined) {
      this.fotoUrl = dados.fotoUrl;
    }
  }

  public isPerfilCompleto(): boolean {
    return this.nome.trim() !== '' && this.email.trim() !== '';
  }
}
