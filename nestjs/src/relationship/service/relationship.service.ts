import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { RelationshipDto } from '../model/relationship.dto';
import { Relationship, RelationshipStatus } from '../model/relationship.entity';
import { SendRelationshipDto } from '../model/send-relationship.dto';
import UserRelationship from '../model/userRelationship.entity';

@Injectable()
export class RelationshipService {
  constructor(
    @InjectRepository(Relationship)
    private relationshipRepository: Repository<Relationship>,
    @InjectRepository(UserRelationship)
    private userRelationship: Repository<UserRelationship>,
    @Inject(UserService) private readonly userService: UserService,
  ) {}

  async getAll(): Promise<SendRelationshipDto[]> {
    const relationship = await this.relationshipRepository.find({
      relations: ['userRelationship'],
    });
    return this.reformSendingDataArray(relationship);
  }

  async getRelationshipById(id: number): Promise<SendRelationshipDto> {
    const relationship = await this.relationshipRepository.find({
      where: { id: id },
      relations: ['userRelationship'],
    });
    if (relationship.length === 0) {
      throw new HttpException(
        'Relationship with this id does not exist.',
        HttpStatus.NOT_FOUND,
      );
    }
    const relation = await this.reformSendingDataArray(relationship);
    return relation[0];
  }

  async getFriendList(id: number): Promise<number[]> {
    await this.userService.getUserProfileById(id);
    const data = await this.getFullData(id, RelationshipStatus.FRIEND);
    const friendList = data.map((obj) => {
      const relation = obj.relationship.userRelationship.filter(
        (obj) => obj.userId !== id,
      );
      return relation[0].userId;
    });
    return friendList;
  }

  async getBlockList(id: number): Promise<number[]> {
    await this.userService.getUserProfileById(id);
    const data = await this.getFullData(id, RelationshipStatus.BLOCK);
    const blocked = data.map((obj) => {
      const relation = obj.relationship.userRelationship;
      return relation[1];
    });
    const blockList = blocked
      .filter((obj) => obj.userId !== id)
      .map((obj) => obj.userId);
    return blockList;
  }

  async addFriend(
    id: number,
    relationshipDto: RelationshipDto,
  ): Promise<Relationship> {
    await this.userService.getUserProfileById(relationshipDto.addresseeUserId);
    await this.checkUsersRelation(id, relationshipDto.addresseeUserId);
    const newRelationship = await this.relationshipRepository.create();
    newRelationship.status = RelationshipStatus.NOTCONFIRMED;
    await this.relationshipRepository.save(newRelationship);
    await this.setNewRelation(id, relationshipDto, newRelationship.id);
    return newRelationship;
  }

  async acceptFriend(id: number): Promise<SendRelationshipDto> {
    const old = await this.getOneById(id);
    await this.checkFriendshipStatus(old);
    old.status = RelationshipStatus.FRIEND;
    const newStatus = await this.relationshipRepository.save(old);
    return this.reformSendingData(newStatus);
  }

  async rejectFriend(id: number): Promise<SendRelationshipDto> {
    const relationship = await this.getOneById(id);
    await this.checkFriendshipStatus(relationship);
    const rm = await this.relationshipRepository.remove(relationship);
    return this.reformSendingData(rm);
  }

  async deleteFriend(
    id: number,
    delDto: RelationshipDto,
  ): Promise<SendRelationshipDto> {
    await this.userService.getUserProfileById(delDto.addresseeUserId);
    const relationId = await this.findUserRelationshipId(
      id,
      delDto.addresseeUserId,
      RelationshipStatus.FRIEND,
    );
    if (!relationId) {
      throw new HttpException(
        'Users are not friends, cannot unfriend.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const delRelationship = await this.getOneById(relationId);
    const rm = await this.relationshipRepository.remove(delRelationship);
    return this.reformSendingData(rm);
  }

  async blockUser(id: number, dto: RelationshipDto): Promise<Relationship> {
    await this.userService.getUserProfileById(dto.addresseeUserId);
    await this.checkUserRelationBlock(id, dto.addresseeUserId);
    const blockRelationship = await this.relationshipRepository.create();
    blockRelationship.status = RelationshipStatus.BLOCK;
    await this.relationshipRepository.save(blockRelationship);
    await this.setNewRelation(id, dto, blockRelationship.id);
    return blockRelationship;
  }

  async deleteBlockUser(
    id: number,
    delDto: RelationshipDto,
  ): Promise<SendRelationshipDto> {
    await this.userService.getUserProfileById(delDto.addresseeUserId);
    const relationId = await this.findUserRelationshipId(
      id,
      delDto.addresseeUserId,
      RelationshipStatus.BLOCK,
    );
    if (!relationId) {
      throw new HttpException(
        'User is not on blocklist, cannot unblock.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const delRelationship = await this.getOneById(relationId);
    const rm = await this.relationshipRepository.remove(delRelationship);
    return this.reformSendingData(rm);
  }

  /****************************************************************************/
  /*                                 utils                                    */
  /****************************************************************************/

  /*
   ** getOneById returns the relationship detail
   */
  getOneById(id: number): Promise<Relationship> {
    return this.relationshipRepository.findOne(id, {
      relations: ['userRelationship'],
    });
  }

  /*
   ** getFullData returns user's friend full information
   */
  async getFullData(id: number, status: string): Promise<UserRelationship[]> {
    const data = await this.userRelationship.find({
      where: {
        userId: id,
        relationship: { status: status },
      },
      relations: ['relationship', 'relationship.userRelationship'],
    });
    return data;
  }

  /*
   ** findUserRelationshipId returns user and his friend's relationshipId
   */
  async findUserRelationshipId(
    userId: number,
    friendId: number,
    status: string,
  ): Promise<number> {
    const data = await this.getFullData(userId, status);
    const found = data
      .map((obj) => {
        const relation = obj.relationship.userRelationship
          .filter((obj) => obj.userId === friendId)
          .map((obj) => obj.relationshipId);
        return relation;
      })
      .filter((obj) => obj.length !== 0);
    if (found.length === 0) {
      return 0;
    }
    const relationshipId = found[0][0];
    return relationshipId;
  }

  /*
   ** setNewRelation save data in userRelationship table
   */
  async setNewRelation(
    id: number,
    relationshipDto: RelationshipDto,
    newId: number,
  ): Promise<void> {
    const requester = await this.userRelationship.create();
    requester.userId = id;
    requester.relationshipId = newId;
    await this.userRelationship.save(requester);

    const addressee = await this.userRelationship.create();
    addressee.userId = relationshipDto.addresseeUserId;
    addressee.relationshipId = newId;
    await this.userRelationship.save(addressee);
  }

  /****************************************************************************/
  /*                                 checkers                                 */
  /****************************************************************************/

  /*
   ** checkFriendshipStatus throws exception if relationship does not exist,
   ** or it has already the status Friend/Block
   */
  async checkFriendshipStatus(relationship: Relationship): Promise<void> {
    if (!relationship) {
      throw new HttpException(
        'Relationship with this id does not exist.',
        HttpStatus.NOT_FOUND,
      );
    }
    if (relationship.status !== RelationshipStatus.NOTCONFIRMED) {
      throw new HttpException(
        'Relationship has been confirmed already, cannot modify again.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /*
   ** checkUsersRelation see if there's an existing relationship between users,
   ** throws exception if it's true
   */
  async checkUsersRelation(
    userOneId: number,
    userTwoId: number,
  ): Promise<void> {
    const friendlist = await this.getFriendList(userOneId);
    if (friendlist.includes(userTwoId)) {
      throw new HttpException(
        'Users are friends already.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const unconfirm = await this.findUserRelationshipId(
      userOneId,
      userTwoId,
      RelationshipStatus.NOTCONFIRMED,
    );
    const block = await this.findUserRelationshipId(
      userOneId,
      userTwoId,
      RelationshipStatus.BLOCK,
    );
    if (unconfirm > 0 || block > 0) {
      throw new HttpException(
        'Users had an existing relationship, it should be unconfirm or block.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async checkUserRelationBlock(
    userOneId: number,
    userTwoId: number,
  ): Promise<void> {
    const block = await this.findUserRelationshipId(
      userOneId,
      userTwoId,
      RelationshipStatus.BLOCK,
    );
    if (block) {
      throw new HttpException(
        'Users are in a block relationship, cannot block again.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const friend = await this.findUserRelationshipId(
      userOneId,
      userTwoId,
      RelationshipStatus.FRIEND,
    );
    if (friend) {
      const delRelationship = await this.getOneById(friend);
      await this.relationshipRepository.remove(delRelationship);
    }
    const unconfirm = await this.findUserRelationshipId(
      userOneId,
      userTwoId,
      RelationshipStatus.NOTCONFIRMED,
    );
    if (unconfirm) {
      const delRelationship = await this.getOneById(unconfirm);
      await this.relationshipRepository.remove(delRelationship);
    }
  }
  /****************************************************************************/
  /*                              Reform Objs                                 */
  /****************************************************************************/

  /*
   ** reformSendingDataArray returns SendRelationshipDto[]
   */
  async reformSendingDataArray(
    relationship: Relationship[],
  ): Promise<SendRelationshipDto[]> {
    const ret: SendRelationshipDto[] = relationship.map((data) => {
      const obj: SendRelationshipDto = {
        id: data.id,
        createDate: data.createDate,
        status: data.status,
        users: [
          data.userRelationship[0].userId,
          data.userRelationship[1].userId,
        ],
      };
      return obj;
    });
    return ret;
  }

  /*
   ** reformSendingData returns SendRelationshipDto[]
   */
  async reformSendingData(
    relationship: Relationship,
  ): Promise<SendRelationshipDto> {
    const obj: SendRelationshipDto = {
      id: relationship.id,
      createDate: relationship.createDate,
      status: relationship.status,
      users: [
        relationship.userRelationship[0].userId,
        relationship.userRelationship[1].userId,
      ],
    };
    return obj;
  }
}
