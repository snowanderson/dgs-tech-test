import { Injectable, Logger } from '@nestjs/common';
import { Movement } from '../../domain/entities/movement.entity';
import { Balance } from '../../domain/entities/balance.entity';
import { ValidationResult } from '../../domain/value-objects/validation-result';

/**
 * Service responsible for validating a set of financial movements against various rules.
 */
@Injectable()
export class MovementValidatorService {
  private readonly logger = new Logger(MovementValidatorService.name);
  validateMovementDates(
    movements: Movement[],
    balances: Balance[],
  ): ValidationResult {
    this.logger.debug(
      `Validating dates for ${movements.length} movements against ${balances.length} balances`,
    );

    if (movements.length === 0) {
      this.logger.debug('No movements to validate, validation successful');
      return ValidationResult.success();
    }

    const oldestBalance = balances[0];
    const mostRecentBalance = balances[balances.length - 1];
    const oldestMovement = movements[0];
    const mostRecentMovement = movements[movements.length - 1];

    this.logger.debug(
      `Oldest balance: ${oldestBalance.getDate().toString()}, Oldest movement: ${oldestMovement.getDate().toString()}`,
    );
    this.logger.debug(
      `Most recent balance: ${mostRecentBalance.getDate().toString()}, Most recent movement: ${mostRecentMovement.getDate().toString()}`,
    );

    if (oldestMovement.getDate() < oldestBalance.getDate()) {
      this.logger.warn(
        'Movement date validation failed: Oldest movement is before oldest balance',
      );
      return ValidationResult.fail('Oldest movement is before oldest balance');
    }

    if (mostRecentMovement.getDate() > mostRecentBalance.getDate()) {
      this.logger.warn(
        'Movement date validation failed: Most recent movement is after most recent balance',
      );
      return ValidationResult.fail(
        'Most recent movement is after most recent balance',
      );
    }

    this.logger.debug('Movement date validation successful');
    return ValidationResult.success();
  }

  validateMovementUniqueness(movements: Movement[]): ValidationResult {
    this.logger.debug(
      `Validating uniqueness for ${movements.length} movements`,
    );
    const idMap = new Map<number, Movement>();

    for (const movement of movements) {
      if (idMap.has(movement.getId())) {
        this.logger.warn(
          `Movement uniqueness validation failed: Duplicate movement ID detected: ${movement.getId()}`,
        );
        return ValidationResult.fail('Duplicate movement ID detected', {
          id: movement.getId(),
          firstOccurrence: idMap.get(movement.getId()),
          duplicateOccurrence: movement,
        });
      } else {
        idMap.set(movement.getId(), movement);
      }
    }

    this.logger.debug('Movement uniqueness validation successful');
    return ValidationResult.success();
  }
}
