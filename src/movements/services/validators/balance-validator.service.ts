import { Injectable } from '@nestjs/common';
import { Balance } from '../../domain/entities/balance.entity';
import { ValidationResult } from '../../domain/value-objects/validation-result';

/**
 * Service responsible for validating balance-related data against various rules.
 */
@Injectable()
export class BalanceValidatorService {
  /**
   * Validates a list of balances to ensure it meets the required conditions.
   *
   * @param {Balance[]} balances - An array of Balance objects to validate.
   * @return {ValidationResult} Returns a ValidationResult object indicating success or failure with an appropriate message.
   */
  validateBalances(balances: Balance[]): ValidationResult {
    if (balances.length < 2) {
      return ValidationResult.fail('At least two balances are required');
    }
    return ValidationResult.success();
  }
}
