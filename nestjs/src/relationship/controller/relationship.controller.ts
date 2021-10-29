import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Relationship } from '../model/relationship.entity';
import { RelationshipService } from '../service/relationship.service';
import { RelationshipDto } from '../dto/relationship.dto';
import { CurrentUser } from 'src/auth/decorator/currrent.user.decorator';
import { User } from 'src/user/model/user.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { SendRelationshipDto } from '../dto/send-relationship.dto';
import { JwtTwoFactorGuard } from 'src/auth/guard/jwt-two-factor.guard';
import { SendAddFriendRelationshipDto } from '../dto/send-addFriend-relationship.dto';
import { SendSpecificListRelationshipDto } from '../dto/send-specificList-relationship.dto';
import { ChatGateway } from 'src/chat/gateway/chat.gateway';
import { SendAllUsersRelationshipDto } from '../dto/send-allUsers-relationship.dto';

@UseGuards(JwtAuthGuard)
@UseGuards(JwtTwoFactorGuard)
@Controller('relationship')
export class RelationshipController {
  constructor(
    private relationshipService: RelationshipService,
    private chatGateway: ChatGateway,
  ) {}

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
   ** getMySpecificRelationList takes query relation_status to request corresponding list,
   ** returns an array with user friends' id, nickname, avatar and status
   */
  @Get('me/list')
  getMySpecificRelationList(
    @CurrentUser() user: User,
    @Query('status') status: string,
  ): Promise<SendSpecificListRelationshipDto[]> {
    return this.relationshipService.getSpecificRelationList(user.id, status);
  }

  /*
   ** getSpecificRelationList takes query relation_status to request corresponding list,
   ** returns an array with user friends' id, nickname, avatar and status
   */
  @Get(':id/list')
  getSpecificRelationList(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status: string,
  ): Promise<SendSpecificListRelationshipDto[]> {
    return this.relationshipService.getSpecificRelationList(id, status);
  }

  /*
   ** getMySpecificRelationList takes query relation_status to request corresponding list,
   ** returns an array with user friends' id, nickname, avatar and status
   */
  @Get('me/allusers')
  async getMyAllRelationList(
    @CurrentUser() user: User,
  ): Promise<SendAllUsersRelationshipDto[]> {
    return this.relationshipService.getAllRelationList(user.id);
  }

  /*
   ** addFriend returns the new relationship's id
   */
  @Post('add')
  async addFriend(
    @CurrentUser() user: User,
    @Body() relationshipDto: RelationshipDto,
  ): Promise<SendAddFriendRelationshipDto> {
    const relationship = await this.relationshipService.addFriend(
      user.id,
      relationshipDto,
    );
    this.chatGateway.server.emit('reload-users', {
      user_id1: relationshipDto.addresseeUserId,
      user_id2: user.id,
    });
    return relationship;
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
  @Patch('accept/:id')
  async acceptFriend(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SendRelationshipDto> {
    const relationship = await this.relationshipService.acceptFriend(
      id,
      user.id,
    );
    this.chatGateway.server.emit('reload-users', {
      user_id1: relationship.users[0],
      user_id2: relationship.users[1],
    });
    return relationship;
  }

  /*
   ** rejectFriend returns the rejected relationship
   */
  @Delete('reject/:id')
  rejectFriend(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SendRelationshipDto> {
    return this.relationshipService.rejectFriend(id, user.id);
  }

  /*
   ** unfriend returns the deleted relationship
   */
  @Delete('unfriend')
  async unfriend(
    @CurrentUser() user: User,
    @Body() relationshipDto: RelationshipDto,
  ): Promise<SendRelationshipDto> {
    const relationship = await this.relationshipService.deleteFriend(
      user.id,
      relationshipDto,
    );
    this.chatGateway.server.emit('reload-users', {
      user_id1: relationship.users[0],
      user_id2: relationship.users[1],
    });
    return relationship;
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
  async blockUser(
    @CurrentUser() user: User,
    @Body() relationshipDto: RelationshipDto,
  ): Promise<Relationship> {
    const relationship = await this.relationshipService.blockUser(
      user.id,
      relationshipDto,
    );

    this.chatGateway.server.emit('reload-users', {
      user_id1: user.id,
      user_id2: relationshipDto.addresseeUserId,
    });
    return relationship;
  }

  /*
   ** unblock returns the deleted relationship
   */
  @Delete('unblock')
  async unblock(
    @CurrentUser() user: User,
    @Body() relationshipDto: RelationshipDto,
  ): Promise<SendRelationshipDto> {
    const relationship = await this.relationshipService.deleteBlockUser(
      user.id,
      relationshipDto,
    );
    this.chatGateway.server.emit('reload-users', {
      user_id1: user.id,
      user_id2: relationshipDto.addresseeUserId,
    });
    return relationship;
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
