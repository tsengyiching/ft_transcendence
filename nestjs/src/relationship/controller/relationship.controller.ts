import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Relationship } from '../model/relationship.entity';
import { RelationshipService } from '../service/relationship.service';
import { RelationshipDto } from '../model/relationship.dto';
import { CurrentUser } from 'src/auth/decorator/currrent.user.decorator';
import { User } from 'src/user/model/user.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { SendRelationshipDto } from '../model/send-relationship.dto';

@UseGuards(JwtAuthGuard)
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
   ** getMyFriends returns an array with user friends' id
   ** parameter user's id
   */
  @Get('me/friendlist')
  getMyFriendList(@CurrentUser() user: User): Promise<number[]> {
    return this.relationshipService.getFriendList(user.id);
  }

  /*
   ** getFriends returns an array with user friends' id
   ** parameter user's id
   */
  @Get(':id/friendlist')
  getFriendList(@Param('id', ParseIntPipe) id: number): Promise<number[]> {
    return this.relationshipService.getFriendList(id);
  }

  /*
   ** getMyBlockList returns an array with user friends' id
   */
  @Get('me/blocklist')
  getMyBlockList(@CurrentUser() user: User): Promise<number[]> {
    return this.relationshipService.getBlockList(user.id);
  }

  /*
   ** getBlocklist returns an array with user's blocklist
   ** parameter user's id
   */
  @Get(':id/blocklist')
  getBlockList(@Param('id', ParseIntPipe) id: number): Promise<number[]> {
    return this.relationshipService.getBlockList(id);
  }

  /*
   ** addFriend returns the new relationship's id
   */
  @Post('add')
  addFriend(
    @CurrentUser() user: User,
    @Body() relationshipDto: RelationshipDto,
  ): Promise<Relationship> {
    return this.relationshipService.addFriend(user.id, relationshipDto);
  }

  /*
   ** TESTER DELETE LATER
   */
  @Post('add/:id')
  addFriendTest(
    @Param('id', ParseIntPipe) id: number,
    @Body() relationshipDto: RelationshipDto,
  ): Promise<Relationship> {
    return this.relationshipService.addFriend(id, relationshipDto);
  }

  /*
   ** acceptFriend returns the new relationship
   */
  @Patch('accept/:id')
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
   ** TESTER DELETE LATER
   */
  @Post('block/:id')
  blockUserTest(
    @Param('id', ParseIntPipe) id: number,
    @Body() relationshipDto: RelationshipDto,
  ): Promise<Relationship> {
    return this.relationshipService.blockUser(id, relationshipDto);
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
