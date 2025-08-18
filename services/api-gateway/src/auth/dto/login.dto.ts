import { IsPhoneNumber, IsString, IsStrongPassword } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsPhoneNumber()
  phone: string;

  @IsString()
  @IsStrongPassword()
  password: string;
}
