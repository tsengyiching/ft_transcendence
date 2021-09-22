import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { Relationship } from '../model/relationship.entity';
import { RelationshipService } from '../service/relationship.service';
import { CreateRelationshipDto } from '../model/create-Relationship.dto';

@Controller('relationship')
export class RelationshipController {
  constructor(private relationshipService: RelationshipService) {}

  /*
   ** getAll returns relationship with details
   */
  @Get('all')
  getAll(): Promise<Relationship[]> {
    return this.relationshipService.getAll();
  }

  /*
   ** getOneById returns the relationship with details
   ** parameter relationship's id
   */
  @Get(':id')
  getOneById(@Param('id', ParseIntPipe) id: number): Promise<Relationship> {
    return this.relationshipService.getOneById(id);
  }

  /*
   ** getFriends returns the user's friend
   ** parameter user's id
   */
  @Get(':id/getFriends')
  getFriends(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.relationshipService.getFriends(id);
  }

  /*
   ** addFriend returns the new relationship's id
   */
  @Post('/add')
  addFriend(
    @Body() createRelationshipDto: CreateRelationshipDto,
  ): Promise<Relationship> {
    return this.relationshipService.addFriend(createRelationshipDto);
  }

  /*
   ** acceptFriend returns the new relationship
   */
  @Put('accept/:id')
  acceptFriend(@Param('id', ParseIntPipe) id: number): Promise<Relationship> {
    return this.relationshipService.acceptFriend(id);
  }

  /*
   ** rejectFriend returns the rejected relationship
   */
  @Delete('reject/:id')
  rejectFriend(@Param('id', ParseIntPipe) id: number): Promise<Relationship> {
    return this.relationshipService.rejectFriend(id);
  }
}
