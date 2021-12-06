declare module 'clamscan' {
  import Stream from 'stream';

  interface InitOptions {
    clamdscan: {
      host: string;
      port: number;
      timeout: number;
    };
  }

  interface ScanResult {
    isInfected: boolean;
    viruses: Array<string>;
  }

  class NodeClam {
    constructor();

    init(options: InitOptions): Promise<NodeClam>;
    scanStream(stream: Stream.Readable): Promise<ScanResult>;
    getVersion(): Promise<string>;
  }

  export = NodeClam;
}
