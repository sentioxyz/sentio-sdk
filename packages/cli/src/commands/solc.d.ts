declare module 'solc' {
  export function loadRemoteVersion(version: string, callback: (err: any, solc: Compiler) => void)

  export interface Compiler {
    compile: (input: string) => string
  }
}
