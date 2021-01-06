import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { parse } from 'date-fns';
import { ScanFileServiceProvider } from '../constants';
import { ScanFileService } from '../scan-file/scan-file.service';

export interface ClamAVInfo {
  clamAvVersion: string;
  signatureVersion: string;
  signatureTimestamp: Date;
}

@Injectable()
export class ClamAvHealth extends HealthIndicator {
  constructor(
    @Inject(ScanFileServiceProvider) private scanFileService: ScanFileService,
    @Inject(Logger) private readonly logger: Logger,
  ) {
    super();
  }

  static parseVersionInfo(rawInfo: string): ClamAVInfo | null {
    const regex = /ClamAV ([a-zA-Z0-9.]+)\/([0-9]+)\/(.+)/;
    const matches = rawInfo.match(regex);

    if (matches === null) {
      return null;
    }

    const rawDate = matches[3];
    const formattedDate = rawDate.replace(/ {2}/g, ' ');
    const date = parse(formattedDate, 'EEE MMM dd HH:mm:ss yyyy', new Date());

    return {
      clamAvVersion: matches[1],
      signatureVersion: matches[2],
      signatureTimestamp: date,
    };
  }

  async clamVersion(key: string): Promise<HealthIndicatorResult> {
    let rawVersionInfo: string;
    try {
      rawVersionInfo = await this.scanFileService.getVersion();
    } catch (error) {
      this.logger.error('Error retrieving ClamAV version number', error);
      throw new HealthCheckError('Unable to retrieve version number', error);
    }

    if (!rawVersionInfo) {
      const message = 'Empty version information returned by ClamAV';
      this.logger.error(message);
      throw new HealthCheckError(message, rawVersionInfo);
    }

    const versionInfo = ClamAvHealth.parseVersionInfo(rawVersionInfo);
    if (!versionInfo) {
      const message = 'Malformed version information returned by ClamAV';
      this.logger.error(message);
      throw new HealthCheckError(message, rawVersionInfo);
    }

    return this.getStatus(key, true, versionInfo);
  }
}
