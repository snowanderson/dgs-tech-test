import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { MovementsService } from '../services/movements.service';
import {
  ValidateMovementsDto,
  ValidateMovementsResponseDto,
} from '../dto/validate-movements.dto';

@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  /**
   * Validates the movements provided in the request body according to given balances.
   *
   * @param {ValidateMovementsDto} dto - The data transfer object containing the balances and movements to validate.
   * @return {ValidateMovementsResponseDto} - A response object containing the validation result.
   */
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validate(@Body() dto: ValidateMovementsDto): ValidateMovementsResponseDto {
    this.movementsService.validateMovements(dto);
    return { message: 'Accepted' };
  }
}
