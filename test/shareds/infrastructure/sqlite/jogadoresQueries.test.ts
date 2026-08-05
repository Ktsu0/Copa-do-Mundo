// Testa nomeSemClube: remoção do sufixo "(Clube - País)" dos nomes de jogadores.
import { nomeSemClube } from '@/shareds/infrastructure/sqlite/jogadoresQueries';

describe('nomeSemClube', () => {
  it('remove o sufixo "(Clube - País)" do final do nome', () => {
    expect(nomeSemClube('Vinícius Júnior (Real Madrid - Brasil)')).toBe('Vinícius Júnior');
  });

  it('remove espaços extras entre o nome e o sufixo removido', () => {
    expect(nomeSemClube('Neymar   (Al-Hilal - Brasil)')).toBe('Neymar');
  });

  it('mantém o nome intacto quando não há parênteses', () => {
    expect(nomeSemClube('Kylian Mbappé')).toBe('Kylian Mbappé');
  });

  it('não remove parênteses que não estão no final da string', () => {
    expect(nomeSemClube('Nome (do meio) Sobrenome')).toBe('Nome (do meio) Sobrenome');
  });
});
