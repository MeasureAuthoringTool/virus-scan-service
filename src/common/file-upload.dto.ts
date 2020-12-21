import { ApiProperty } from '@nestjs/swagger';

/**
 * This class simply identifies a better structure for the Swagger/OpenAPI
 * request for a file uploads. It is not intended to be actually
 * instantiated or used directly.
 */
export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  public file: string;

  constructor(file: string) {
    this.file = file;
  }
}
