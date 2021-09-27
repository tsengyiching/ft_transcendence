import { IsInt } from 'class-validator';

export class RelationshipDto {
  @IsInt()
  addresseeUserId: number;
}
