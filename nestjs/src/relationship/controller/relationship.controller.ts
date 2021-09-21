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

  @Get()
  getRelationship(): Promise<Relationship[]> {
    return this.relationshipService.getAll();
  }

  @Get(':id')
  getGameById(@Param('id', ParseIntPipe) id: number): Promise<Relationship> {
    return this.relationshipService.getOneById(id);
  }

  @Get(':id/getFriends')
  getFriends(@Param('id', ParseIntPipe) id: number) {
    return this.relationshipService.getFriends(id);
  }

  @Post('/add')
  addFriend(
    @Body() createRelationshipDto: CreateRelationshipDto,
  ): Promise<Relationship> {
    return this.relationshipService.addFriend(createRelationshipDto);
  }

  @Put(':id/accept')
  acceptFriend(@Param('id', ParseIntPipe) id: number): Promise<Relationship> {
    return this.relationshipService.acceptFriend(id);
  }

  @Delete(':id/reject')
  rejectFriend(@Param('id', ParseIntPipe) id: number): Promise<Relationship> {
    return this.relationshipService.rejectFriend(id);
  }
}
