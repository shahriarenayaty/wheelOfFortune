import {
  IsString,
  IsAlphanumeric,
  MinLength,
  MaxLength,
} from 'class-validator';

export class RedeemReferralDto {
  @IsString()
  @IsAlphanumeric()
  @MinLength(6)
  @MaxLength(8)
  readonly code: string;
}
