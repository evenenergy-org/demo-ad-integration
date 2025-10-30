declare module 'jsrsasign' {
  export namespace crypto {
    export class Signature {
      constructor(options: { alg: string })
      init(key: any): void
      updateString(str: string): void
      sign(): string
      verify(hex: string): boolean
    }
  }

  export namespace KEYUTIL {
    export function getKey(pem: string): any
    export function getPEM(key: any, format: string): string
  }

  export namespace hextob64 {
    export function apply(str: string): string
  }

  export function hextob64(hex: string): string
  export function b64tohex(b64: string): string
}

