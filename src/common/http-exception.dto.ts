import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * This class simply identifies a better structure for the Swagger/OpenAPI
 * responses when an error occurs. It is not intended to be actually
 * instantiated or used directly.
 */
export class HttpExceptionDto {
  @ApiProperty()
  public statusCode: number;

  @ApiPropertyOptional()
  public message?: string;

  @ApiPropertyOptional()
  public error?: string;

  constructor(statusCode: number, message?: string, error?: string) {
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
  }
}
