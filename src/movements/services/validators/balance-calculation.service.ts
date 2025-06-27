import { Injectable, Logger } from '@nestjs/common';
import { Movement } from '../../domain/entities/movement.entity';
import { Balance } from '../../domain/entities/balance.entity';
import { ValidationResult } from '../../domain/value-objects/validation-result';

/**
 * Service responsible for validating the consistency of balance groups in financial transactions.
 * Ensures that movements within given periods align with initial and final balances, identifying any discrepancies.
 */
@Injectable()
export class BalanceCalculationService {
  private readonly logger = new Logger(BalanceCalculationService.name);
  /**
   * Validates a series of balance groups to ensure consistency between balances and movements within defined periods.
   *
   * @param {Movement[]} movements - An array of movement objects, representing financial transactions, which are used for validation.
   * @param {Balance[]} balances - An array of balance objects that define the starting and ending points of validation periods.
   * @return {ValidationResult} A validation result object that indicates whether any errors are found or if the validation is successful.
   */
  validateBalanceGroups(
    movements: Movement[],
    balances: Balance[],
  ): ValidationResult {
    this.logger.debug(
      `Validating balance groups for ${movements.length} movements and ${balances.length} balances`,
    );
    let validationResult = ValidationResult.success();

    for (let i = 0; i < balances.length - 1; i++) {
      const currentBalance = balances[i];
      const nextBalance = balances[i + 1];

      this.logger.debug(
        `Validating balance group ${i + 1}/${balances.length - 1}: ${currentBalance.getDate().toString()} to ${nextBalance.getDate().toString()}`,
      );

      const movementsInPeriod = movements.filter(
        (movement) =>
          movement.getDate() >= currentBalance.getDate() &&
          movement.getDate() < nextBalance.getDate(),
      );

      this.logger.debug(
        `Found ${movementsInPeriod.length} movements in period`,
      );

      validationResult = validationResult.combine(
        this.validateBalanceGroup(
          currentBalance,
          nextBalance,
          movementsInPeriod,
        ),
      );
    }

    if (validationResult.hasErrors()) {
      this.logger.warn('Balance group validation failed');
    } else {
      this.logger.debug('Balance group validation successful');
    }

    return validationResult;
  }

  /**
   * Validates a balance group by ensuring that the sum of movements applied to the initial balance
   * results in the expected final balance. Accounts for potential floating-point precision issues.
   *
   * @param {Balance} initialBalance - The initial balance at the start of the group.
   * @param {Balance} finalBalance - The expected final balance after all movements are applied.
   * @param {Movement[]} movements - An array of movements representing the transactions in the group.
   * @param {number} groupIndex - The index of the group being validated.
   * @return {ValidationResult} A result object indicating the success or failure of the validation,
   * containing details about the mismatch if validation fails.
   */
  private validateBalanceGroup(
    initialBalance: Balance,
    finalBalance: Balance,
    movements: Movement[],
  ): ValidationResult {
    this.logger.debug(
      `Validating balance group from ${initialBalance.getDate().toString()} to ${finalBalance.getDate().toString()} with ${movements.length} movements`,
    );

    const movementsSum = movements.reduce(
      (sum, movement) => sum + movement.getAmount(),
      0,
    );

    const expectedFinalBalance = initialBalance.getAmount() + movementsSum;

    this.logger.debug(
      `Initial balance: ${initialBalance.getAmount()}, Movements sum: ${movementsSum}, Expected final balance: ${expectedFinalBalance}, Actual final balance: ${finalBalance.getAmount()}`,
    );

    // If we work with float, we might encounter the double precision
    // floating issue. We could try to mitigate the issue with a multiple of Epsilon.
    // We could also just consider working with cents (example: 100_01 for 100.01€)
    if (Math.abs(expectedFinalBalance - finalBalance.getAmount()) > 0) {
      const difference = finalBalance.getAmount() - expectedFinalBalance;
      this.logger.warn(
        `Balance mismatch detected: difference of ${difference}`,
      );
      return ValidationResult.fail('Balance mismatch', {
        initialBalanceDate: initialBalance.getDate(),
        initialBalanceValue: initialBalance.getAmount(),
        finalBalanceDate: finalBalance.getDate(),
        finalBalanceValue: finalBalance.getAmount(),
        expectedFinalBalance: expectedFinalBalance,
        movementsSum: movementsSum,
        difference: difference,
        movementsCount: movements.length,
      });
    }

    this.logger.debug('Balance group validation successful');
    return ValidationResult.success();
  }
}
