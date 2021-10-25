import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Relationship } from '../model/relationship.entity';
import { RelationshipService } from '../service/relationship.service';
import { RelationshipDto } from '../model/relationship.dto';
import { CurrentUser } from 'src/auth/decorator/currrent.user.decorator';
import { User } from 'src/user/model/user.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { SendRelationshipDto } from '../model/send-relationship.dto';
import { JwtTwoFactorGuard } from 'src/auth/guard/jwt-two-factor.guard';
import { SendAddFriendRelationshipDto } from '../model/send-addFriend-relationship.dto';
import { SendlistDto } from '../model/send-list.dto';

@UseGuards(JwtAuthGuard)
@UseGuards(JwtTwoFactorGuard)
@Controller('relationship')
export class RelationshipController {
  constructor(private relationshipService: RelationshipService) {}

  /*
   ** getAll returns all relations with details
   */
  @Get('all')
  getAll(): Promise<SendRelationshipDto[]> {
    return this.relationshipService.getAll();
  }

  /*
   ** getOneById returns the relationship with details
   ** parameter relationship's id
   */
  @Get(':id')
  getRelationshipById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SendRelationshipDto> {
    return this.relationshipService.getRelationshipById(id);
  }

  /*
   ** getList takes query relation_status to request corresponding list,
   ** returns an array with user friends' id, nickname, avatar and status
   */
  @Get('me/list')
  getMyRelationList(
    @CurrentUser() user: User,
    @Query('status') status: string,
  ): Promise<SendlistDto[]> {
    return this.relationshipService.getRelationList(user.id, status);
  }

  /*
   ** getList takes query relation_status to request corresponding list,
   ** returns an array with user friends' id, nickname, avatar and status
   */
  @Get(':id/list')
  getRelationList(
    @CurrentUser() user: User,
    @Query('relation_status') status: string,
  ): Promise<SendlistDto[]> {
    return this.relationshipService.getRelationList(user.id, status);
  }

  /*
   ** addFriend returns the new relationship's id
   */
  @Post('add')
  addFriend(
    @CurrentUser() user: User,
    @Body() relationshipDto: RelationshipDto,
  ): Promise<SendAddFriendRelationshipDto> {
    return this.relationshipService.addFriend(user.id, relationshipDto);
  }

  /*
   ** TESTER DELETE LATER
   */
  @Post('add/:id')
  addFriendTest(
    @Param('id', ParseIntPipe) id: number,
    @Body() relationshipDto: RelationshipDto,
  ): Promise<SendAddFriendRelationshipDto> {
    return this.relationshipService.addFriend(id, relationshipDto);
  }

  /*
   ** acceptFriend returns the new relationship
   */
  @Get('accept/:id')
  acceptFriend(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SendRelationshipDto> {
    return this.relationshipService.acceptFriend(id);
  }

  /*
   ** rejectFriend returns the rejected relationship
   */
  @Delete('reject/:id')
  rejectFriend(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SendRelationshipDto> {
    return this.relationshipService.rejectFriend(id);
  }

  /*
   ** unfriend returns the deleted relationship
   */
  @Delete('unfriend')
  unfriend(
    @CurrentUser() user: User,
    @Body() relationshipDto: RelationshipDto,
  ): Promise<SendRelationshipDto> {
    return this.relationshipService.deleteFriend(user.id, relationshipDto);
  }

  /*
   ** TESTER DELETE LATER
   */
  @Delete('unfriend/:id')
  unfriendTest(
    @Param('id', ParseIntPipe) id: number,
    @Body() relationshipDto: RelationshipDto,
  ): Promise<SendRelationshipDto> {
    return this.relationshipService.deleteFriend(id, relationshipDto);
  }

  /*
   ** blockUser returns the block relationship
   ** if the users are friends, they'll be unfriend first
   ** than create the block relationship
   */
  @Post('block')
  blockUser(
    @CurrentUser() user: User,
    @Body() relationshipDto: RelationshipDto,
  ): Promise<Relationship> {
    return this.relationshipService.blockUser(user.id, relationshipDto);
  }

  /*
   ** unblock returns the deleted relationship
   */
  @Delete('unblock')
  unblock(
    @CurrentUser() user: User,
    @Body() relationshipDto: RelationshipDto,
  ): Promise<SendRelationshipDto> {
    return this.relationshipService.deleteBlockUser(user.id, relationshipDto);
  }

  /*
   ** TESTER DELETE LATER
   */
  @Delete('unblock/:id')
  unblockTest(
    @Param('id', ParseIntPipe) id: number,
    @Body() relationshipDto: RelationshipDto,
  ): Promise<SendRelationshipDto> {
    return this.relationshipService.deleteBlockUser(id, relationshipDto);
  }
}
