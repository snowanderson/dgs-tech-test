import { Test, TestingModule } from '@nestjs/testing';
import { BalanceCalculationService } from './balance-calculation.service';
import { Movement } from '../../domain/entities/movement.entity';
import { Balance } from '../../domain/entities/balance.entity';

describe('BalanceCalculationService', () => {
  let service: BalanceCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BalanceCalculationService],
    }).compile();

    service = module.get<BalanceCalculationService>(BalanceCalculationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateBalanceGroups', () => {
    it('should return success when all balance groups are valid', () => {
      const movements = [
        new Movement(1, new Date('2025-01-15'), 'Movement 1', 100),
        new Movement(2, new Date('2025-01-20'), 'Movement 2', -50),
      ];

      const balances = [
        new Balance(new Date('2025-01-01'), 500),
        new Balance(new Date('2025-01-31'), 550),
      ];

      const result = service.validateBalanceGroups(movements, balances);

      expect(result.hasErrors()).toBe(false);
    });

    it('should return failure when there is a balance mismatch', () => {
      const movements = [
        new Movement(1, new Date('2025-01-15'), 'Movement 1', 100),
        new Movement(2, new Date('2025-01-20'), 'Movement 2', -50),
      ];

      const balances = [
        new Balance(new Date('2025-01-01'), 500),
        new Balance(new Date('2025-01-31'), 600),
      ];

      const result = service.validateBalanceGroups(movements, balances);

      expect(result.hasErrors()).toBe(true);
      const errors = result.getErrors();
      expect(errors.length).toBe(1);
      expect(errors[0].message).toBe('Balance mismatch');
      expect(errors[0].details).toEqual({
        initialBalanceValue: 500,
        finalBalanceValue: 600,
        expectedFinalBalance: 550,
        movementsSum: 50,
        difference: 50,
        finalBalanceDate: new Date('2025-01-31'),
        initialBalanceDate: new Date('2025-01-01'),
        movementsCount: 2,
      });
    });

    it('should handle multiple balance periods correctly independently from order', () => {
      const movements = [
        new Movement(2, new Date('2025-01-20'), 'Movement 2', -50),
        new Movement(4, new Date('2025-02-25'), 'Movement 4', -100),
        new Movement(1, new Date('2025-01-15'), 'Movement 1', 100),
        new Movement(3, new Date('2025-02-10'), 'Movement 3', 200),
      ];

      const balances = [
        new Balance(new Date('2025-01-01'), 500),
        new Balance(new Date('2025-02-01'), 550),
        new Balance(new Date('2025-03-01'), 650),
      ];

      const result = service.validateBalanceGroups(movements, balances);

      expect(result.hasErrors()).toBe(false);
    });

    it('should return return all validation errors', () => {
      const movements = [
        new Movement(1, new Date('2025-01-15'), 'Movement 1', 100),
        new Movement(2, new Date('2025-02-10'), 'Movement 2', 100),
      ];

      const balances = [
        new Balance(new Date('2025-01-01'), 500),
        new Balance(new Date('2025-02-01'), 700),
        new Balance(new Date('2025-03-01'), 900),
      ];

      const result = service.validateBalanceGroups(movements, balances);

      expect(result.hasErrors()).toBe(true);
      const errors = result.getErrors();
      expect(errors.length).toBe(2);
    });

    it('should handle empty movements array', () => {
      const movements: Movement[] = [];

      const balances = [
        new Balance(new Date('2025-01-01'), 500),
        new Balance(new Date('2025-02-01'), 500),
      ];

      const result = service.validateBalanceGroups(movements, balances);

      expect(result.hasErrors()).toBe(false);
    });
  });
});
