import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from '../domain/value-objects/validation-result';

export class ValidationException extends HttpException {
  constructor(errors: ValidationError[]) {
    const response = {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Validation failed',
      reasons: errors,
      error: 'Bad Request',
    };

    super(response, HttpStatus.BAD_REQUEST);
  }
}
