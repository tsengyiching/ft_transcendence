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
import { ChatGateway } from 'src/chat/gateway/chat.gateway';

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
  ): Promise<SendlistDto[]> {
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
  ): Promise<SendlistDto[]> {
    return this.relationshipService.getSpecificRelationList(id, status);
  }

  /*
   ** getMySpecificRelationList takes query relation_status to request corresponding list,
   ** returns an array with user friends' id, nickname, avatar and status
   */
  @Get('me/allusers')
  async getMyAllRelationList(@CurrentUser() user: User) {
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
    this.chatGateway.server.emit('reload-request', {
      user_id1: user.id,
      user_id2: relationshipDto.addresseeUserId,
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
  @Get('accept/:id')
  async acceptFriend(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SendRelationshipDto> {
    const relationship = await this.relationshipService.acceptFriend(id);
    this.chatGateway.server.emit('reload-request', {
      user_id1: relationship.users[0],
      user_id2: relationship.users[1],
    });
    this.chatGateway.server.emit('reload-friendlist', {
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
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SendRelationshipDto> {
    return this.relationshipService.rejectFriend(id);
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
    this.chatGateway.server.emit('reload-friendlist', {
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

    this.chatGateway.server.emit('reload-blocked', {
      user_id1: user.id,
      user_id2: relationshipDto.addresseeUserId,
    });
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
