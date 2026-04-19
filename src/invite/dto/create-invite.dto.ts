import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateInviteDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
