const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Esse e-mail já está cadastrado.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
  'auth/operation-not-allowed': 'Cadastro por e-mail/senha não está habilitado. Fale com o suporte.',
};

export function mensagemErroAuth(err: unknown): string {
  const code = (err as { code?: string } | undefined)?.code;
  if (code && FIREBASE_ERROR_MESSAGES[code]) {
    return FIREBASE_ERROR_MESSAGES[code];
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return 'Não foi possível completar a operação. Tente novamente.';
}
