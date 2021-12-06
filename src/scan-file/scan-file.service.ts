import { Inject, Injectable, Logger } from '@nestjs/common';
import NodeClam from './clamscan';
import { Readable } from 'stream';
import ClamException from './ClamException';
import { NodeClamProvider } from '../constants';
import { ScanResultDto } from './scan-result.dto';
import { ScanFileConfig } from './scan-file.config';

@Injectable()
export class ScanFileService {
  private clamscan: NodeClam | null;

  constructor(
    @Inject(Logger) private readonly logger: Logger,
    @Inject(NodeClamProvider) private nodeClam: NodeClam,
    @Inject(ScanFileConfig) private config: ScanFileConfig,
  ) {
    this.clamscan = null;
  }

  /**
   * This convenience method allows this Provider to be initialized when the
   * service starts up, and not have to initialize when we receive a file.
   */
  public async init(): Promise<ScanFileService> {
    this.clamscan = await this.initializeClamAV();
    return this;
  }

  /**
   * This initializes a clamscan instance and returns it
   * @private
   */
  private async initializeClamAV(): Promise<NodeClam> {
    let clamscan: NodeClam;
    try {
      this.logger.log('Initializing ClamAV connection');
      clamscan = await this.nodeClam.init({
        clamdscan: {
          host: this.config.clamAVHost,
          port: this.config.clamAVPort,
          timeout: this.config.clamAVTimeout * 1000, // Convert to milliseconds
        },
      });
      this.logger.log('ClamAV connection successfully initialized');
    } catch (error) {
      const message = 'Unable to initialize ClamAV';
      this.logger.error(message, error);
      throw new ClamException(message);
    }
    return clamscan;
  }

  /**
   * Scans a file stream for a virus and returns a ScanResultDto with the scan
   * results. This Service's clamav instance should already be initialized,
   * but if it isn't for some reason, this method will initialize it.
   * @param stream
   * @param fileName
   */
  public async scanFile(
    stream: Readable,
    fileName: string,
  ): Promise<ScanResultDto> {
    if (!this.clamscan) {
      this.clamscan = await this.initializeClamAV();
    }

    this.logger.log(`Scanning file ${fileName}`);
    try {
      const result = await this.clamscan.scanStream(stream);
      if (result.isInfected) {
        const virusString = result.viruses.join('", "');
        this.logger.warn(
          `Virus(es) "${virusString}" detected in file ${fileName}`,
        );
      }
      return new ScanResultDto(fileName, result.isInfected, result.viruses);
    } catch (error) {
      const message = 'An error occurred while scanning file';
      this.logger.error(message, error);
      throw new ClamException(message);
    }
  }

  /**
   * Gets the current version of Clam AV
   */
  public async getVersion(): Promise<string> {
    if (!this.clamscan) {
      this.clamscan = await this.initializeClamAV();
    }

    try {
      return await this.clamscan.getVersion();
    } catch (error) {
      const message = 'An error occurred while getting the ClamAV version';
      this.logger.error(message, error);
      throw new ClamException(message);
    }
  }
}
