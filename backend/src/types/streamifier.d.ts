declare module 'streamifier' {
  import { Readable } from 'stream';

  function createReadStream(buffer: Buffer | string, options?: any): Readable;

  export = { createReadStream };
}