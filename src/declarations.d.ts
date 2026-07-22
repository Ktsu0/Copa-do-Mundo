declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Metro resolve imports de imagem para um id numerico de asset em runtime;
// o TS nao sabe disso por padrao. Precisa ficar num arquivo "script" (sem
// import/export no topo) -- em modo "module" o TS trata declare module como
// augmentation de um modulo real existente, e nao cria um ambient module
// novo por wildcard (ver src/types/firebase-auth.d.ts para o caso oposto).
declare module '*.png' {
  const value: number;
  export default value;
}
declare module '*.jpg' {
  const value: number;
  export default value;
}
declare module '*.jpeg' {
  const value: number;
  export default value;
}
declare module '*.webp' {
  const value: number;
  export default value;
}
