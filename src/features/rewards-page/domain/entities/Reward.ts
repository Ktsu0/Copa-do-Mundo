export interface Reward {
  id: string;
  titulo: string;
  descricao: string;
  requisitoProgresso: number;
  premioTipo: 'pacotes' | 'pontos';
  premioQuantidade: number;
  resgatado: boolean;
  resgatavel: boolean;
}
