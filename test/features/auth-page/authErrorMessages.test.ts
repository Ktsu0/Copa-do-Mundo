// Testa a tradução de erros do Firebase Auth para mensagens amigáveis em mensagemErroAuth.
import { mensagemErroAuth } from '@/features/auth-page/infrastructure/authErrorMessages';

describe('mensagemErroAuth', () => {
  it('traduz um código de erro conhecido do Firebase', () => {
    expect(mensagemErroAuth({ code: 'auth/email-already-in-use' })).toBe(
      'Esse e-mail já está cadastrado.'
    );
    expect(mensagemErroAuth({ code: 'auth/wrong-password' })).toBe('E-mail ou senha incorretos.');
  });

  it('cai para a mensagem do Error quando o código não é reconhecido', () => {
    const err = Object.assign(new Error('Falha específica'), { code: 'auth/algo-novo' });
    expect(mensagemErroAuth(err)).toBe('Falha específica');
  });

  it('usa a mensagem do Error quando não há código', () => {
    expect(mensagemErroAuth(new Error('Deu ruim'))).toBe('Deu ruim');
  });

  it('usa a mensagem genérica quando não é Error nem tem código', () => {
    expect(mensagemErroAuth('qualquer coisa')).toBe(
      'Não foi possível completar a operação. Tente novamente.'
    );
    expect(mensagemErroAuth(undefined)).toBe(
      'Não foi possível completar a operação. Tente novamente.'
    );
  });
});
