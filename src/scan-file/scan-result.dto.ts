import { ApiProperty } from '@nestjs/swagger';

interface ScanResult {
  fileName: string;
  infected: boolean;
  viruses: Array<string>;
}

/**
 * This represents the result of a single file's virus scan
 */
export class ScanResultDto {
  @ApiProperty()
  public fileName: string;

  @ApiProperty()
  public infected: boolean;

  @ApiProperty({ type: [String] })
  public viruses: Array<string>;

  static parse(input: ScanResult): ScanResultDto {
    return new ScanResultDto(input.fileName, input.infected, input.viruses);
  }

  constructor(fileName: string, infected = false, viruses: Array<string> = []) {
    this.fileName = fileName;
    this.infected = infected;
    this.viruses = viruses;
  }
}
