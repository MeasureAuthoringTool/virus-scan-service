import { Inject, Injectable, Logger } from '@nestjs/common';
import { Express } from 'express';
import NodeClam from './clamscan';
import { Readable } from 'stream';
import ClamException from './ClamException';
import { NodeClamProvider } from '../constants';
import { ScanResult } from './scan-file.types';

@Injectable()
export class ScanFileService {
  private clamscan: NodeClam | null;

  constructor(
    @Inject(Logger) private readonly logger: Logger,
    @Inject(NodeClamProvider) private nodeClam: NodeClam,
  ) {
    logger.setContext(ScanFileService.name);
    this.clamscan = null;
  }

  async init(): Promise<ScanFileService> {
    try {
      this.logger.log('Initializing ClamAV connection');
      this.clamscan = this.clamscan = await this.nodeClam.init({
        clamdscan: {
          host: '127.0.0.1',
          port: '3310',
          timeout: 5 * 1000, // 5 sec
        },
      });
      this.logger.log('ClamAV connection successfully initialized');
    } catch (error) {
      this.clamscan = null;
      const message = 'Unable to initialize ClamAV';
      this.logger.error(message, error);
      throw new ClamException(message);
    }
    return this;
  }

  async scanFile(file: Express.Multer.File): Promise<ScanResult> {
    const stream = Readable.from(file.buffer);

    if (!this.clamscan) {
      throw new ClamException('ClamAV has not been initialized');
    }

    this.logger.log(`Scanning file ${file.originalname}`);
    try {
      const result = await this.clamscan.scan_stream(stream);
      if (result.is_infected) {
        const virusString = result.viruses.join('", "');
        this.logger.warn(
          `Virus(es) "${virusString}" detected in file ${file.originalname}`,
        );
      }
      return {
        fileName: file.originalname,
        infected: result.is_infected,
        viruses: result.viruses,
      };
    } catch (error) {
      const message = 'An error occurred while scanning file';
      this.logger.error(message, error);
      throw new ClamException(message);
    }
  }
}
