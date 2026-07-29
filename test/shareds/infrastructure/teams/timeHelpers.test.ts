jest.mock('@/shareds/infrastructure/sqlite/db', () => ({
  getDbSync: jest.fn(),
}));

import { getDbSync } from '@/shareds/infrastructure/sqlite/db';
import { getFlagUrl, getTeamName } from '@/shareds/infrastructure/teams/timeHelpers';

describe('getFlagUrl', () => {
  it('usa o mapeamento dedicado para siglas com código de país divergente', () => {
    expect(getFlagUrl('BRA')).toBe('https://flagcdn.com/w80/br.png');
    expect(getFlagUrl('ENG')).toBe('https://flagcdn.com/w80/gb-eng.png');
    expect(getFlagUrl('KSA')).toBe('https://flagcdn.com/w80/sa.png');
  });

  it('respeita a largura informada', () => {
    expect(getFlagUrl('BRA', 40)).toBe('https://flagcdn.com/w40/br.png');
    expect(getFlagUrl('BRA', 640)).toBe('https://flagcdn.com/w640/br.png');
  });

  it('cai para os dois primeiros caracteres em minúsculo quando não há mapeamento', () => {
    expect(getFlagUrl('XYZ')).toBe('https://flagcdn.com/w80/xy.png');
  });

  it('retorna string vazia para valores nulos/indefinidos', () => {
    expect(getFlagUrl(null)).toBe('');
    expect(getFlagUrl(undefined)).toBe('');
    expect(getFlagUrl('')).toBe('');
  });
});

describe('getTeamName', () => {
  it('retorna "???" para timeId nulo/indefinido sem consultar o banco', () => {
    expect(getTeamName(null)).toBe('???');
    expect(getTeamName(undefined)).toBe('???');
    expect(getDbSync).not.toHaveBeenCalled();
  });

  it('retorna o nome da linha encontrada no banco', () => {
    const getFirstSync = jest.fn().mockReturnValue({ nome: 'Brasil' });
    (getDbSync as jest.Mock).mockReturnValue({ getFirstSync });

    expect(getTeamName('BRA')).toBe('Brasil');
    expect(getFirstSync).toHaveBeenCalledWith('SELECT nome FROM times WHERE id = ?', ['BRA']);
  });

  it('retorna o próprio timeId quando não encontra a linha', () => {
    const getFirstSync = jest.fn().mockReturnValue(null);
    (getDbSync as jest.Mock).mockReturnValue({ getFirstSync });

    expect(getTeamName('ZZZ')).toBe('ZZZ');
  });
});
