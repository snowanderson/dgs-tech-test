import { Test, TestingModule } from '@nestjs/testing';
import { MovementsController } from './movements.controller';
import { MovementsService } from '../services/movements.service';
import { ValidateMovementsDto } from '../dto/validate-movements.dto';
import { ValidationException } from '../exceptions/validation.exception';

describe('MovementsController', () => {
  let controller: MovementsController;
  let service: MovementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovementsController],
      providers: [
        {
          provide: MovementsService,
          useValue: {
            validateMovements: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MovementsController>(MovementsController);
    service = module.get<MovementsService>(MovementsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('validate', () => {
    it('should return success message when validation passes', () => {
      jest
        .spyOn(service, 'validateMovements')
        .mockImplementation(() => undefined);
      const dto: ValidateMovementsDto = {
        movements: [
          {
            id: 1,
            date: new Date('2023-01-01'),
            wording: 'Test Movement',
            amount: 100,
          },
        ],
        balances: [
          { date: new Date('2022-12-31'), balance: 500 },
          { date: new Date('2023-01-02'), balance: 600 },
        ],
      };

      const result = controller.validate(dto);

      expect(service.validateMovements).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ message: 'Accepted' });
    });

    it('should throw the same exception when validation fails', () => {
      const validationError = {
        message: 'Test error',
        details: 'Test details',
      };
      const exception = new ValidationException([validationError]);
      const dto: ValidateMovementsDto = {
        movements: [
          {
            id: 1,
            date: new Date('2023-01-01'),
            wording: 'Test Movement',
            amount: 100,
          },
        ],
        balances: [
          { date: new Date('2022-12-31'), balance: 500 },
          { date: new Date('2023-01-02'), balance: 600 },
        ],
      };

      jest.spyOn(service, 'validateMovements').mockImplementation(() => {
        throw exception;
      });

      expect(() => controller.validate(dto)).toThrow(exception);
      expect(service.validateMovements).toHaveBeenCalledWith(dto);
    });
  });
});
