import { Test, TestingModule } from '@nestjs/testing';
import { MovementsService } from './movements.service';
import { ValidateMovementsDto } from '../dto/validate-movements.dto';
import { BalanceValidatorService } from './validators/balance-validator.service';
import { MovementValidatorService } from './validators/movement-validator.service';
import { BalanceCalculationService } from './validators/balance-calculation.service';
import { ValidationResult } from '../domain/value-objects/validation-result';
import { ValidationException } from '../exceptions/validation.exception';

describe('MovementsService', () => {
  let service: MovementsService;
  let balanceValidator: BalanceValidatorService;
  let movementValidator: MovementValidatorService;
  let balanceCalculation: BalanceCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovementsService,
        {
          provide: BalanceValidatorService,
          useValue: {
            validateBalances: jest.fn(),
          },
        },
        {
          provide: MovementValidatorService,
          useValue: {
            validateMovementDates: jest.fn(),
            validateMovementUniqueness: jest.fn(),
          },
        },
        {
          provide: BalanceCalculationService,
          useValue: {
            validateBalanceGroups: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MovementsService>(MovementsService);
    balanceValidator = module.get<BalanceValidatorService>(
      BalanceValidatorService,
    );
    movementValidator = module.get<MovementValidatorService>(
      MovementValidatorService,
    );
    balanceCalculation = module.get<BalanceCalculationService>(
      BalanceCalculationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateMovements', () => {
    let dto: ValidateMovementsDto;

    beforeEach(() => {
      // Reset mock calls
      jest.clearAllMocks();

      // Setup default DTO
      dto = {
        movements: [
          {
            id: 1,
            date: new Date('2025-01-15'),
            wording: 'Movement 1',
            amount: 100,
          },
          {
            id: 2,
            date: new Date('2025-01-20'),
            wording: 'Movement 2',
            amount: -50,
          },
        ],
        balances: [
          {
            date: new Date('2025-01-01'),
            balance: 500,
          },
          {
            date: new Date('2025-01-31'),
            balance: 550,
          },
        ],
      };

      // Setup default mock returns
      (balanceValidator.validateBalances as jest.Mock).mockReturnValue(
        ValidationResult.success(),
      );
      (movementValidator.validateMovementDates as jest.Mock).mockReturnValue(
        ValidationResult.success(),
      );
      (
        movementValidator.validateMovementUniqueness as jest.Mock
      ).mockReturnValue(ValidationResult.success());
      (balanceCalculation.validateBalanceGroups as jest.Mock).mockReturnValue(
        ValidationResult.success(),
      );
    });

    it('should successfully validate movements when all validations pass', () => {
      expect(() => service.validateMovements(dto)).not.toThrow();

      expect(balanceValidator.validateBalances).toHaveBeenCalled();
      expect(movementValidator.validateMovementDates).toHaveBeenCalled();
      expect(movementValidator.validateMovementUniqueness).toHaveBeenCalled();
      expect(balanceCalculation.validateBalanceGroups).toHaveBeenCalled();
    });

    it('should throw ValidationException when balance validation fails', () => {
      const errorMessage = 'At least two balances are required';
      (balanceValidator.validateBalances as jest.Mock).mockReturnValue(
        ValidationResult.fail(errorMessage),
      );

      try {
        service.validateMovements(dto);
        fail('Expected ValidationException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationException);
        expect(error.response.reasons).toEqual([{ message: errorMessage }]);
      }

      expect(movementValidator.validateMovementDates).not.toHaveBeenCalled();
      expect(
        movementValidator.validateMovementUniqueness,
      ).not.toHaveBeenCalled();
      expect(balanceCalculation.validateBalanceGroups).not.toHaveBeenCalled();
    });

    it('should throw ValidationException when movement date validation fails', () => {
      const errorMessage = 'Oldest movement is before oldest balance';
      (movementValidator.validateMovementDates as jest.Mock).mockReturnValue(
        ValidationResult.fail(errorMessage),
      );

      try {
        service.validateMovements(dto);
        fail('Expected ValidationException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationException);
        expect(error.response.reasons).toEqual([{ message: errorMessage }]);
      }

      expect(balanceValidator.validateBalances).toHaveBeenCalled();
      expect(movementValidator.validateMovementDates).toHaveBeenCalled();
      expect(movementValidator.validateMovementUniqueness).toHaveBeenCalled();
      expect(balanceCalculation.validateBalanceGroups).not.toHaveBeenCalled();
    });

    it('should throw ValidationException when movement uniqueness validation fails', () => {
      const errorMessage = 'Duplicate movement ID detected';
      (
        movementValidator.validateMovementUniqueness as jest.Mock
      ).mockReturnValue(ValidationResult.fail(errorMessage));

      try {
        service.validateMovements(dto);
        fail('Expected ValidationException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationException);
        expect(error.response.reasons).toEqual([{ message: errorMessage }]);
      }

      expect(balanceValidator.validateBalances).toHaveBeenCalled();
      expect(movementValidator.validateMovementDates).toHaveBeenCalled();
      expect(movementValidator.validateMovementUniqueness).toHaveBeenCalled();
      expect(balanceCalculation.validateBalanceGroups).not.toHaveBeenCalled();
    });

    it('should throw ValidationException when balance calculation validation fails', () => {
      const errorMessage = 'Balance mismatch';
      (balanceCalculation.validateBalanceGroups as jest.Mock).mockReturnValue(
        ValidationResult.fail(errorMessage),
      );

      try {
        service.validateMovements(dto);
        fail('Expected ValidationException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationException);
        expect(error.response.reasons).toEqual([{ message: errorMessage }]);
      }

      expect(balanceValidator.validateBalances).toHaveBeenCalled();
      expect(movementValidator.validateMovementDates).toHaveBeenCalled();
      expect(movementValidator.validateMovementUniqueness).toHaveBeenCalled();
      expect(balanceCalculation.validateBalanceGroups).toHaveBeenCalled();
    });
  });
});
