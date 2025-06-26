import { Test, TestingModule } from '@nestjs/testing';
import { MovementValidatorService } from './movement-validator.service';
import { Movement } from '../../domain/entities/movement.entity';
import { Balance } from '../../domain/entities/balance.entity';

describe('MovementValidatorService', () => {
  let service: MovementValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovementValidatorService],
    }).compile();

    service = module.get<MovementValidatorService>(MovementValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateMovementDates', () => {
    it('should return success when movements array is empty', () => {
      const movements: Movement[] = [];
      const balances = [
        new Balance(new Date('2025-01-01'), 500),
        new Balance(new Date('2025-01-31'), 550),
      ];

      const result = service.validateMovementDates(movements, balances);

      expect(result.hasErrors()).toBe(false);
    });

    it('should return success when all movements are within the date range', () => {
      const movements = [
        new Movement(1, new Date('2025-01-05'), 'Movement 1', 100),
        new Movement(2, new Date('2025-01-15'), 'Movement 2', -50),
        new Movement(3, new Date('2025-01-25'), 'Movement 3', 200),
      ];
      const balances = [
        new Balance(new Date('2025-01-01'), 500),
        new Balance(new Date('2025-01-31'), 750),
      ];

      const result = service.validateMovementDates(movements, balances);

      expect(result.hasErrors()).toBe(false);
    });

    it('should return failure when oldest movement is before oldest balance', () => {
      const movements = [
        new Movement(1, new Date('2024-12-25'), 'Movement 1', 100),
        new Movement(2, new Date('2025-01-15'), 'Movement 2', -50),
      ];
      const balances = [
        new Balance(new Date('2025-01-01'), 500),
        new Balance(new Date('2025-01-31'), 550),
      ];

      const result = service.validateMovementDates(movements, balances);

      expect(result.hasErrors()).toBe(true);
      const errors = result.getErrors();
      expect(errors.length).toBe(1);
      expect(errors[0].message).toBe(
        'Oldest movement is before oldest balance',
      );
    });

    it('should return failure when most recent movement is after most recent balance', () => {
      const movements = [
        new Movement(1, new Date('2025-01-05'), 'Movement 1', 100),
        new Movement(2, new Date('2025-02-05'), 'Movement 2', -50),
      ];
      const balances = [
        new Balance(new Date('2025-01-01'), 500),
        new Balance(new Date('2025-01-31'), 550),
      ];

      const result = service.validateMovementDates(movements, balances);

      expect(result.hasErrors()).toBe(true);
      const errors = result.getErrors();
      expect(errors.length).toBe(1);
      expect(errors[0].message).toBe(
        'Most recent movement is after most recent balance',
      );
    });
  });

  describe('validateMovementUniqueness', () => {
    it('should return success when all movements have unique IDs', () => {
      const movements = [
        new Movement(1, new Date('2025-01-05'), 'Movement 1', 100),
        new Movement(2, new Date('2025-01-15'), 'Movement 2', -50),
        new Movement(3, new Date('2025-01-25'), 'Movement 3', 200),
      ];

      const result = service.validateMovementUniqueness(movements);

      expect(result.hasErrors()).toBe(false);
    });

    it('should return success when movements array is empty', () => {
      const movements: Movement[] = [];

      const result = service.validateMovementUniqueness(movements);

      expect(result.hasErrors()).toBe(false);
    });

    it('should return failure when there are duplicate movement IDs', () => {
      const movements = [
        new Movement(1, new Date('2025-01-05'), 'Movement 1', 100),
        new Movement(2, new Date('2025-01-15'), 'Movement 2', -50),
        new Movement(1, new Date('2025-01-25'), 'Duplicate ID', 200),
      ];

      const result = service.validateMovementUniqueness(movements);

      expect(result.hasErrors()).toBe(true);
      const errors = result.getErrors();
      expect(errors.length).toBe(1);
      expect(errors[0].message).toBe('Duplicate movement ID detected');
      expect(errors[0].details).toBeDefined();
      expect(errors[0].details.id).toBe(1);
      expect(errors[0].details.firstOccurrence).toBeDefined();
      expect(errors[0].details.duplicateOccurrence).toBeDefined();
    });
  });
});
