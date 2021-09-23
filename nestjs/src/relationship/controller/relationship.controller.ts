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
import { DeleteRelationshipDto } from '../model/delete-Relationship.dto';

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
   ** getFriends returns an array with user friends' id
   ** parameter user's id
   */
  @Get(':id/friendlist')
  getFriends(@Param('id', ParseIntPipe) id: number): Promise<number[]> {
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

  /*
   ** unfriend returns the deleted relationship
   */
  @Delete('unfriend/:id')
  unfriend(
    @Param('id', ParseIntPipe) id: number,
    @Body() deleteRelationshipDto: DeleteRelationshipDto,
  ): Promise<Relationship> {
    return this.relationshipService.deleteFriend(id, deleteRelationshipDto);
  }

  /*
   ** getBlocklist returns an array with user's blocklist
   ** parameter user's id
   */
  @Get(':id/blocklist')
  getBlocklist(@Param('id', ParseIntPipe) id: number): Promise<number[]> {
    return this.relationshipService.getBlocklist(id);
  }

  /*
   ** blockUser returns the block relationship
   ** if the users are friends, they'll be unfriend first
   ** than create the block relationship
   */
  @Post('/block')
  blockUser(
    @Body() createRelationshipDto: CreateRelationshipDto,
  ): Promise<Relationship> {
    return this.relationshipService.blockUser(createRelationshipDto);
  }

  /*
   ** unblock returns the deleted relationship
   */
  @Delete('unblock/:id')
  unblock(
    @Param('id', ParseIntPipe) id: number,
    @Body() deleteRelationshipDto: DeleteRelationshipDto,
  ): Promise<Relationship> {
    return this.relationshipService.deleteBlockUser(id, deleteRelationshipDto);
  }
}
