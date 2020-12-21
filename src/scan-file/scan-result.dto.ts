import { ApiProperty } from '@nestjs/swagger';

interface ScanResult {
  fileName: string;
  infected: boolean;
  viruses: Array<string>;
}

export class ScanResultDto {
  @ApiProperty()
  public fileName: string;

  @ApiProperty()
  public infected: boolean;

  @ApiProperty()
  public viruses: Array<string>;

  static parse(input: ScanResult): ScanResultDto {
    return new ScanResultDto(input.fileName, input.infected, input.viruses);
  }

  constructor(fileName: string, infected: boolean, viruses: Array<string>) {
    this.fileName = fileName;
    this.infected = infected;
    this.viruses = viruses;
  }
}
