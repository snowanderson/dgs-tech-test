import { Test, TestingModule } from '@nestjs/testing';
import { BalanceValidatorService } from './balance-validator.service';
import { Balance } from '../../domain/entities/balance.entity';

describe('BalanceValidatorService', () => {
  let service: BalanceValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BalanceValidatorService],
    }).compile();

    service = module.get<BalanceValidatorService>(BalanceValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateBalances', () => {
    it('should return success when there are at least two balances', () => {
      const balances = [
        new Balance(new Date('2025-01-01'), 500),
        new Balance(new Date('2025-01-31'), 550),
      ];

      const result = service.validateBalances(balances);

      expect(result.hasErrors()).toBe(false);
    });

    it('should return success when there are more than two balances', () => {
      const balances = [
        new Balance(new Date('2025-01-01'), 500),
        new Balance(new Date('2025-01-15'), 525),
        new Balance(new Date('2025-01-31'), 550),
      ];

      const result = service.validateBalances(balances);

      expect(result.hasErrors()).toBe(false);
    });

    it('should return failure when there is only one balance', () => {
      const balances = [new Balance(new Date('2025-01-01'), 500)];

      const result = service.validateBalances(balances);

      expect(result.hasErrors()).toBe(true);
      const errors = result.getErrors();
      expect(errors.length).toBe(1);
      expect(errors[0].message).toBe('At least two balances are required');
    });

    it('should return failure when the balances array is empty', () => {
      const balances: Balance[] = [];

      const result = service.validateBalances(balances);

      expect(result.hasErrors()).toBe(true);
      const errors = result.getErrors();
      expect(errors.length).toBe(1);
      expect(errors[0].message).toBe('At least two balances are required');
    });
  });
});
