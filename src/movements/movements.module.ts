import { Module } from '@nestjs/common';
import { MovementsController } from './controllers/movements.controller';
import { MovementsService } from './services/movements.service';
import { BalanceValidatorService } from './services/validators/balance-validator.service';
import { MovementValidatorService } from './services/validators/movement-validator.service';
import { BalanceCalculationService } from './services/validators/balance-calculation.service';

@Module({
  controllers: [MovementsController],
  providers: [
    MovementsService,
    BalanceValidatorService,
    MovementValidatorService,
    BalanceCalculationService,
  ],
})
export class MovementsModule {}
