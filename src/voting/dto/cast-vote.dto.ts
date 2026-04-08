import { IsString, IsUUID } from 'class-validator';

export class CastVoteDto {
  @IsUUID()
  optionId: string;
}
