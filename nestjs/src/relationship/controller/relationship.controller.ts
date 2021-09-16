import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
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

  @Post('/addFriend')
  addFriend(
    @Body() createRelationshipDto: CreateRelationshipDto,
  ): Promise<Relationship> {
    return this.relationshipService.addFriend(createRelationshipDto);
  }
}
