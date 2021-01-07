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
    is_infected: boolean;
    viruses: Array<string>;
  }

  class NodeClam {
    constructor();

    init(options: InitOptions): Promise<NodeClam>;
    scan_stream(stream: Stream.Readable): Promise<ScanResult>;
    get_version(): Promise<string>;
  }

  export = NodeClam;
}
