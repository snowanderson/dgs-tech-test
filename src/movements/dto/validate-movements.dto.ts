import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

export class MovementDto {
  @IsNumber()
  id: number;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsString()
  wording: string;

  @IsNumber()
  amount: number;
}

export class BalanceDto {
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsNumber()
  balance: number;
}

export class ValidateMovementsDto {
  @ValidateNested({ each: true })
  @Type(() => MovementDto)
  movements: MovementDto[];

  @ValidateNested({ each: true })
  @Type(() => BalanceDto)
  @ArrayMinSize(2, { message: 'At least two balances are required' })
  balances: BalanceDto[];
}

export class ValidateMovementsResponseDto {
  @IsString()
  message: 'Accepted';
}
