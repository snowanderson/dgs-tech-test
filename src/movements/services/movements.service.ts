import { Injectable } from '@nestjs/common';
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
    // First, we convert all DTO to Entities
    const movements = dto.movements.map(
      (m) => new Movement(m.id, m.date, m.wording, m.amount),
    );
    const balances = dto.balances.map((b) => new Balance(b.date, b.balance));

    // Then, we sort them by date as we need them in a chronological order
    const sortedMovements = this.sortByDate(movements);
    const sortedBalances = this.sortByDate(balances);

    const balanceValidation =
      this.balanceValidator.validateBalances(sortedBalances);

    // Balances need to be valid to confirm if movements are
    if (balanceValidation.hasErrors()) {
      throw new ValidationException(balanceValidation.getErrors());
    }

    const movementDateValidation = this.movementValidator.validateMovementDates(
      sortedMovements,
      sortedBalances,
    );

    const movementUniquenessValidation =
      this.movementValidator.validateMovementUniqueness(sortedMovements);

    const movementValidation = ValidationResult.combine([
      movementDateValidation,
      movementUniquenessValidation,
    ]);

    // Movements need to be all unique and be contained between two balances to be compared
    if (movementValidation.hasErrors()) {
      throw new ValidationException(movementValidation.getErrors());
    }

    const balanceCalculationValidation =
      this.balanceCalculation.validateBalanceGroups(
        sortedMovements,
        sortedBalances,
      );

    // If all the previous steps are valid, then we can validate all movements and throw all the errors
    if (balanceCalculationValidation.hasErrors()) {
      throw new ValidationException(balanceCalculationValidation.getErrors());
    }
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
