import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { MovementsService } from '../services/movements.service';
import {
  ValidateMovementsDto,
  ValidateMovementsResponseDto,
} from '../dto/validate-movements.dto';

@Controller('movements')
export class MovementsController {
  private readonly logger = new Logger(MovementsController.name);

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
    this.logger.log(
      `Validating movements: ${dto.movements.length} movements, ${dto.balances.length} balances`,
    );
    try {
      this.movementsService.validateMovements(dto);
      this.logger.log('Movements validation successful');
      return { message: 'Accepted' };
    } catch (error) {
      this.logger.error(
        `Movements validation failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
