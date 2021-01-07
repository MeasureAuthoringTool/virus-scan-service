import { Readable } from 'stream';

export async function streamToString(stream: Readable): Promise<string> {
  const chunks: Array<Uint8Array> = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

export function stringToStream(stringIn: string): Readable {
  return Readable.from([stringIn]);
}
