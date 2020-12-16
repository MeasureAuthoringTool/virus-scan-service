import { HttpException, HttpStatus } from '@nestjs/common';

export default class ClamException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
