import { IsInt } from 'class-validator';

export class DeleteRelationshipDto {
  @IsInt()
  addresseeUserId: number;
}
