export {};

// O `firebase` v12 so tipa getReactNativePersistence no build especifico
// de React Native (dist/rn/index.rn.d.ts), mas o `tsc` resolve o entrypoint
// generico de 'firebase/auth' (que nao inclui esse export). A funcao existe
// de verdade em runtime (Metro resolve a condicao "react-native" corretamente),
// entao so precisamos completar o tipo aqui. Isso e' uma augmentation de um
// modulo real, entao PRECISA ficar num arquivo "module" (com export {}) --
// o oposto do que vale para os wildcards novos em src/declarations.d.ts.
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: unknown): import('firebase/auth').Persistence;
}
