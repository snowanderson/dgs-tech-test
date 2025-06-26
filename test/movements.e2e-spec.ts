import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ValidateMovementsDto } from '../src/movements/dto/validate-movements.dto';

describe('MovementsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /movements/validate', () => {
    it('should return 200 and "Accepted" message when movements are valid', () => {
      const validPayload: ValidateMovementsDto = {
        movements: [
          {
            id: 1,
            date: new Date('2025-01-15'),
            wording: 'Invoice',
            amount: 2000,
          },
          {
            id: 2,
            date: new Date('2025-01-20'),
            wording: 'Rent',
            amount: -800,
          },
        ],
        balances: [
          {
            date: new Date('2025-01-01'),
            balance: 1000,
          },
          {
            date: new Date('2025-01-31'),
            balance: 2200,
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/movements/validate')
        .send(validPayload)
        .expect(200)
        .expect({ message: 'Accepted' });
    });

    it('should return 400 when balances are invalid (less than 2)', () => {
      const invalidPayload = {
        movements: [
          {
            id: 1,
            date: new Date('2025-01-15'),
            wording: 'Invoice',
            amount: 2000,
          },
        ],
        balances: [
          {
            date: new Date('2025-01-01'),
            balance: 1000,
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/movements/validate')
        .send(invalidPayload)
        .expect({
          message: ['At least two balances are required'],
          error: 'Bad Request',
          statusCode: 400,
        });
    });

    it('should return 400 when movement dates are outside balance dates range', () => {
      const invalidPayload = {
        movements: [
          {
            id: 1,
            date: new Date('2025-02-15'),
            wording: 'Invoice',
            amount: 2000,
          },
        ],
        balances: [
          {
            date: new Date('2025-01-01'),
            balance: 1000,
          },
          {
            date: new Date('2025-01-31'),
            balance: 1000,
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/movements/validate')
        .send(invalidPayload)
        .expect({
          statusCode: 400,
          message: 'Validation failed',
          reasons: [
            {
              message: 'Most recent movement is after most recent balance',
            },
          ],
          error: 'Bad Request',
        });
    });

    it('should return 400 when movements are not unique', () => {
      const invalidPayload = {
        movements: [
          {
            id: 1,
            date: new Date('2025-01-15'),
            wording: 'Invoice',
            amount: 2000,
          },
          {
            id: 1,
            date: new Date('2025-01-20'),
            wording: 'Duplicate',
            amount: 500,
          },
        ],
        balances: [
          {
            date: new Date('2025-01-01'),
            balance: 1000,
          },
          {
            date: new Date('2025-01-31'),
            balance: 3500,
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/movements/validate')
        .send(invalidPayload)
        .expect({
          statusCode: 400,
          message: 'Validation failed',
          reasons: [
            {
              message: 'Duplicate movement ID detected',
              details: {
                id: 1,
                firstOccurrence: {
                  id: 1,
                  date: '2025-01-15T00:00:00.000Z',
                  wording: 'Invoice',
                  amount: 2000,
                },
                duplicateOccurrence: {
                  id: 1,
                  date: '2025-01-20T00:00:00.000Z',
                  wording: 'Duplicate',
                  amount: 500,
                },
              },
            },
          ],
          error: 'Bad Request',
        });
    });

    it('should return 400 when balance calculation is incorrect', () => {
      const invalidPayload = {
        movements: [
          {
            id: 1,
            date: new Date('2025-01-15'),
            wording: 'Invoice',
            amount: 2000,
          },
        ],
        balances: [
          {
            date: new Date('2025-01-01'),
            balance: 1000,
          },
          {
            date: new Date('2025-01-31'),
            balance: 2500,
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/movements/validate')
        .send(invalidPayload)
        .expect({
          statusCode: 400,
          message: 'Validation failed',
          reasons: [
            {
              message: 'Balance mismatch',
              details: {
                initialBalanceDate: '2025-01-01T00:00:00.000Z',
                initialBalanceValue: 1000,
                finalBalanceDate: '2025-01-31T00:00:00.000Z',
                finalBalanceValue: 2500,
                expectedFinalBalance: 3000,
                movementsSum: 2000,
                difference: -500,
                movementsCount: 1,
              },
            },
          ],
          error: 'Bad Request',
        });
    });

    it('should handle edge case with no movements between balances', () => {
      const payload = {
        movements: [],
        balances: [
          {
            date: new Date('2025-01-01'),
            balance: 1000,
          },
          {
            date: new Date('2025-01-31'),
            balance: 1000,
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/movements/validate')
        .send(payload)
        .expect(200)
        .expect({ message: 'Accepted' });
    });

    it('should return 400 when movement is on final balance date', () => {
      const payload = {
        movements: [
          {
            id: 1,
            date: new Date('2025-01-15'),
            wording: 'Regular Transaction',
            amount: 500,
          },
          {
            id: 2,
            date: new Date('2025-01-31'),
            wording: 'Final Day Transaction',
            amount: -200,
          },
        ],
        balances: [
          {
            date: new Date('2025-01-01'),
            balance: 1000,
          },
          {
            date: new Date('2025-01-31'),
            balance: 1300,
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/movements/validate')
        .send(payload)
        .expect({
          statusCode: 400,
          message: 'Validation failed',
          reasons: [
            {
              message: 'Balance mismatch',
              details: {
                initialBalanceDate: '2025-01-01T00:00:00.000Z',
                initialBalanceValue: 1000,
                finalBalanceDate: '2025-01-31T00:00:00.000Z',
                finalBalanceValue: 1300,
                expectedFinalBalance: 1500,
                movementsSum: 500,
                difference: -200,
                movementsCount: 1,
              },
            },
          ],
          error: 'Bad Request',
        });
    });
  });
});
