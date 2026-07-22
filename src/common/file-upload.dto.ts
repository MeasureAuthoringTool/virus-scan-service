import { ApiProperty } from '@nestjs/swagger';

/**
 * This class simply identifies a better structure for the Swagger/OpenAPI
 * request for file uploads. It is not intended to be actually
 * instantiated or used directly.
 */
export class FileUploadDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  public files: string[];

  constructor(files: string[]) {
    this.files = files;
  }
}
