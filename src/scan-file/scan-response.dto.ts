import { ApiProperty } from '@nestjs/swagger';
import { ScanResultDto } from './scan-result.dto';

/**
 * This represents the response object sent back to the client, potentially
 * holding multiple ScanResultDto objects
 */
export class ScanResponseDto {
  @ApiProperty({ type: [ScanResultDto] })
  public readonly scanResults: ReadonlyArray<ScanResultDto>;

  @ApiProperty()
  public readonly filesScanned: number;

  @ApiProperty()
  public readonly infectedFileCount: number;

  @ApiProperty()
  public readonly cleanFileCount: number;

  constructor(...scanResults: Array<ScanResultDto>) {
    this.scanResults = scanResults;
    this.filesScanned = this._filesScanned();
    this.infectedFileCount = this._infectedFileCount();
    this.cleanFileCount = this._cleanFileCount();
  }

  private _filesScanned(): number {
    return this.scanResults.length;
  }

  private _infectedFileCount(): number {
    return this.scanResults.reduce((accumulator, current) => {
      if (current.infected) {
        return accumulator + 1;
      } else {
        return accumulator;
      }
    }, 0);
  }

  private _cleanFileCount(): number {
    return this.scanResults.reduce((accumulator, current) => {
      if (current.infected) {
        return accumulator;
      } else {
        return accumulator + 1;
      }
    }, 0);
  }

  public addResult(result: ScanResultDto): ScanResponseDto {
    const newResults: Array<ScanResultDto> = this.scanResults.concat(result);
    return new ScanResponseDto(...newResults);
  }
}
