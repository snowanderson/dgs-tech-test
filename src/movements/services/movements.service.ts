import { Injectable, Logger } from '@nestjs/common';
import { ValidateMovementsDto } from '../dto/validate-movements.dto';
import { Movement } from '../domain/entities/movement.entity';
import { Balance } from '../domain/entities/balance.entity';
import { ValidationResult } from '../domain/value-objects/validation-result';
import { BalanceValidatorService } from './validators/balance-validator.service';
import { MovementValidatorService } from './validators/movement-validator.service';
import { BalanceCalculationService } from './validators/balance-calculation.service';
import { ValidationException } from '../exceptions/validation.exception';

/**
 * Service responsible for validating and processing movements and balances.
 */
@Injectable()
export class MovementsService {
  private readonly logger = new Logger(MovementsService.name);

  constructor(
    private readonly balanceValidator: BalanceValidatorService,
    private readonly movementValidator: MovementValidatorService,
    private readonly balanceCalculation: BalanceCalculationService,
  ) {}

  /**
   * Validates the movements and balances
   * @param dto The DTO containing movements and balances to validate
   */
  validateMovements(dto: ValidateMovementsDto): void {
    this.logger.log('Starting movements validation');

    this.logger.debug('Converting DTOs to entities');
    const movements = dto.movements.map(
      (m) => new Movement(m.id, m.date, m.wording, m.amount),
    );
    const balances = dto.balances.map((b) => new Balance(b.date, b.balance));

    this.logger.debug('Sorting movements and balances by date');
    const sortedMovements = this.sortByDate(movements);
    const sortedBalances = this.sortByDate(balances);

    this.logger.debug('Validating balances');
    const balanceValidation =
      this.balanceValidator.validateBalances(sortedBalances);

    if (balanceValidation.hasErrors()) {
      this.logger.warn(
        'Balance validation failed',
        balanceValidation.getErrors(),
      );
      throw new ValidationException(balanceValidation.getErrors());
    }
    this.logger.debug('Balance validation successful');

    this.logger.debug('Validating movement dates');
    const movementDateValidation = this.movementValidator.validateMovementDates(
      sortedMovements,
      sortedBalances,
    );

    this.logger.debug('Validating movement uniqueness');
    const movementUniquenessValidation =
      this.movementValidator.validateMovementUniqueness(sortedMovements);

    const movementValidation = ValidationResult.combine([
      movementDateValidation,
      movementUniquenessValidation,
    ]);

    if (movementValidation.hasErrors()) {
      this.logger.warn(
        'Movement validation failed',
        movementValidation.getErrors(),
      );
      throw new ValidationException(movementValidation.getErrors());
    }
    this.logger.debug('Movement validation successful');

    this.logger.debug('Validating balance calculations');
    const balanceCalculationValidation =
      this.balanceCalculation.validateBalanceGroups(
        sortedMovements,
        sortedBalances,
      );

    if (balanceCalculationValidation.hasErrors()) {
      this.logger.warn(
        'Balance calculation validation failed',
        balanceCalculationValidation.getErrors(),
      );
      throw new ValidationException(balanceCalculationValidation.getErrors());
    }
    this.logger.log('All validations successful');
  }

  /**
   * Sorts an array of items in ascending order based on their date property.
   *
   * @param items An array of items where each item has a `getDate` method that returns a Date object.
   * @return A new array of items sorted by their date.
   */
  private sortByDate<T extends { getDate(): Date }>(items: T[]): T[] {
    return [...items].sort(
      (a, b) => a.getDate().getTime() - b.getDate().getTime(),
    );
  }
}
