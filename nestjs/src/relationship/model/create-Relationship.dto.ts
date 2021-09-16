import { IsInt } from 'class-validator';

export class CreateRelationshipDto {
  @IsInt()
  requesterUserId: number;
  @IsInt()
  addresseeUserId: number;
}
