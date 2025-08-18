import { IsPhoneNumber, IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsPhoneNumber()
  phone: string;

  @IsString()
  password: string;
}
