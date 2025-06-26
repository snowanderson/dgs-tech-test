import { Injectable } from '@nestjs/common';
import { Movement } from '../../domain/entities/movement.entity';
import { Balance } from '../../domain/entities/balance.entity';
import { ValidationResult } from '../../domain/value-objects/validation-result';

/**
 * Service responsible for validating a set of financial movements against various rules.
 */
@Injectable()
export class MovementValidatorService {
  validateMovementDates(
    movements: Movement[],
    balances: Balance[],
  ): ValidationResult {
    if (movements.length === 0) {
      return ValidationResult.success();
    }

    const oldestBalance = balances[0];
    const mostRecentBalance = balances[balances.length - 1];
    const oldestMovement = movements[0];
    const mostRecentMovement = movements[movements.length - 1];

    if (oldestMovement.getDate() < oldestBalance.getDate()) {
      return ValidationResult.fail('Oldest movement is before oldest balance');
    }

    if (mostRecentMovement.getDate() > mostRecentBalance.getDate()) {
      return ValidationResult.fail(
        'Most recent movement is after most recent balance',
      );
    }

    return ValidationResult.success();
  }

  validateMovementUniqueness(movements: Movement[]): ValidationResult {
    const idMap = new Map<number, Movement>();

    for (const movement of movements) {
      if (idMap.has(movement.getId())) {
        return ValidationResult.fail('Duplicate movement ID detected', {
          id: movement.getId(),
          firstOccurrence: idMap.get(movement.getId()),
          duplicateOccurrence: movement,
        });
      } else {
        idMap.set(movement.getId(), movement);
      }
    }

    return ValidationResult.success();
  }
}
