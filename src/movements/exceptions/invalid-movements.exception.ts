import { BadRequestException } from '@nestjs/common';

export interface ValidationReasonDto {
  code?: string;
  message: string;
  details?: any;
}

export class InvalidMovementsException extends BadRequestException {
  constructor(reasons: ValidationReasonDto[]) {
    super({
      message: 'Validation failed',
      reasons,
    });
  }
}
