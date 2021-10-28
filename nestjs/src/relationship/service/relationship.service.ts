import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { RelationshipDto } from '../dto/relationship.dto';
import { Relationship, RelationshipStatus } from '../model/relationship.entity';
import { SendAddFriendRelationshipDto } from '../dto/send-addFriend-relationship.dto';
import { SendSpecificListRelationshipDto } from '../dto/send-specificList-relationship.dto';
import { SendRelationshipDto } from '../dto/send-relationship.dto';
import UserRelationship from '../model/userRelationship.entity';
import { SendAllUsersRelationshipDto } from '../dto/send-allUsers-relationship.dto';

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

  /*  Query ?status="friend/notconfirmed/block"*/
  async getSpecificRelationList(
    id: number,
    reqStatus: string,
  ): Promise<SendSpecificListRelationshipDto[]> {
    const status: RelationshipStatus = this.checkReqStatus(reqStatus);
    const allList = await this.getAllRelationshipWithStatus(status);
    const userList = allList
      .filter((data) => {
        if (
          data.userRelationship[0].userId === id ||
          data.userRelationship[1].userId === id
        )
          return true;
        else return false;
      })
      .filter((data) => {
        if (status === RelationshipStatus.NOTCONFIRMED) {
          if (data.userRelationship[0].userId === id) return false;
        }
        if (status === RelationshipStatus.BLOCK) {
          if (data.userRelationship[1].userId === id) return false;
        }
        return true;
      })
      .map((data) => {
        const res = data.userRelationship.filter((obj) => obj.userId !== id);
        return res[0];
      });
    return this.reformListSendingData(userList);
  }

  /*get user's relationship with other users */
  async getAllRelationList(id: number): Promise<SendAllUsersRelationshipDto[]> {
    const users = await this.userService.getAllWithConditions(id);
    const friendIds = await this.getUserIdsWithStatus(id, 'friend');
    const unconfirmIds = await this.getUserIdsWithStatus(id, 'notconfirmed');
    const blockIds = await this.getUserIdsWithStatus(id, 'block');
    const blockingIds = await this.getBlockingIds(id);
    const relations = users
      .map((data) => ({ ...data, relationship: null }))
      .map((data) => {
        if (friendIds.includes(data.id)) data.relationship = 'friend';
        else if (unconfirmIds.includes(data.id))
          data.relationship = 'Not confirmed';
        return data;
      })
      .filter((data) => (blockIds.includes(data.id) ? false : true))
      .filter((data) => (blockingIds.includes(data.id) ? false : true));
    return this.reformAllRelationListSendingData(relations);
  }

  async addFriend(
    id: number,
    relationshipDto: RelationshipDto,
  ): Promise<SendAddFriendRelationshipDto> {
    /* check */
    await this.checkIsSameUser(id, relationshipDto.addresseeUserId);
    await this.checkUsersRelation(id, relationshipDto.addresseeUserId);

    /*create new relationship*/
    const newRelationship = await this.relationshipRepository.create();
    newRelationship.status = RelationshipStatus.NOTCONFIRMED;
    await this.relationshipRepository.save(newRelationship);

    /* add two users in UserRelationship */
    await this.setNewRelation(id, relationshipDto, newRelationship.id);

    const relationship = await this.relationshipRepository.findOne({
      where: { id: newRelationship.id },
      relations: ['userRelationship'],
    });
    return this.reformAddFriendSendingData(relationship);
  }

  async acceptFriend(id: number): Promise<SendRelationshipDto> {
    const relationship = await this.getOneById(id);
    await this.checkFriendshipStatus(relationship);
    relationship.status = RelationshipStatus.FRIEND;
    const updateRelationship = await this.relationshipRepository.save(
      relationship,
    );
    return this.reformSendingData(updateRelationship);
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
    await this.checkIsSameUser(id, delDto.addresseeUserId);
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
    await this.checkIsSameUser(id, dto.addresseeUserId);
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
    await this.checkIsSameUser(id, delDto.addresseeUserId);
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

  /**
   * getAllRelationshipWithStatus
   * @arg : status
   * @return specific status' relationship with two related users
   */
  async getAllRelationshipWithStatus(
    status: RelationshipStatus,
  ): Promise<Relationship[]> {
    return this.relationshipRepository.find({
      relations: ['userRelationship', 'userRelationship.user'],
      where: { status: status },
    });
  }

  /**
   * getOneById
   * @arg : relationship id
   * @return : that demanded relationship with two related users
   */
  getOneById(id: number): Promise<Relationship> {
    return this.relationshipRepository.findOne(id, {
      relations: ['userRelationship'],
    });
  }

  /**
   * getFullData
   * @arg : userId and the relationship's status
   * @return : user's related other users
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

  /**
   * findUserRelationshipId
   * @arg : userId, friendId, the relationship's status
   * @return : user and his friend's linked relationshipId
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

  /**
   * setNewRelation save two users in userRelationship table
   * @arg : requester id; addresseeUserId; related relationshipId
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

  /**
   * getUserIdsWithStatus
   * @arg : userId and the status demanded
   * @return array [user ids]
   */
  async getUserIdsWithStatus(id: number, reqStatus: string): Promise<number[]> {
    /* check */
    await this.userService.getUserProfileById(id);
    const status: RelationshipStatus = this.checkReqStatus(reqStatus);

    /* get related data*/
    const data = await this.getFullData(id, status);
    if (
      status == RelationshipStatus.FRIEND ||
      status == RelationshipStatus.NOTCONFIRMED
    ) {
      const list = data.map((obj) => {
        const relation = obj.relationship.userRelationship.filter(
          (obj) => obj.userId !== id,
        );
        return relation[0].userId;
      });
      return list;
    } else {
      const blockList = data
        .map((obj) => {
          if (
            obj.relationship.userRelationship[0].id <
            obj.relationship.userRelationship[1].id
          )
            return obj.relationship.userRelationship[1].userId;
          else return obj.relationship.userRelationship[0].userId;
        })
        .filter((data) => data !== id);
      return blockList;
    }
  }

  /**
   * getBlockingIds
   * @arg : userId
   * @return array [other user ids who block @arg id]
   */
  async getBlockingIds(id: number): Promise<number[]> {
    await this.userService.getUserProfileById(id);
    const data = await this.getFullData(id, RelationshipStatus.BLOCK);
    const blockList = data
      .map((obj) => {
        if (
          obj.relationship.userRelationship[0].id <
          obj.relationship.userRelationship[1].id
        )
          return obj.relationship.userRelationship[0].userId;
        else return obj.relationship.userRelationship[1].userId;
      })
      .filter((data) => data !== id);
    return blockList;
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
   ** checkIsSameUser throws exception if user does not exist,
   ** or userOne and UserTwo have same id
   */
  async checkIsSameUser(userOne: number, userTwo: number): Promise<void> {
    if (userOne === userTwo) {
      throw new HttpException(
        'User cannot add, unfriend, block, unblock her / himself !',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.userService.getUserProfileById(userTwo);
  }

  /*
   ** checkUsersRelation see if there's an existing relationship between users,
   ** throws exception if it's true
   */
  async checkUsersRelation(userOne: number, userTwo: number): Promise<void> {
    const friendlist = await this.getUserIdsWithStatus(userOne, 'friend');
    if (friendlist.includes(userTwo)) {
      throw new HttpException(
        'Users are friends already.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const unconfirm = await this.findUserRelationshipId(
      userOne,
      userTwo,
      RelationshipStatus.NOTCONFIRMED,
    );
    const block = await this.findUserRelationshipId(
      userOne,
      userTwo,
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
    userOne: number,
    userTwo: number,
  ): Promise<void> {
    const block = await this.findUserRelationshipId(
      userOne,
      userTwo,
      RelationshipStatus.BLOCK,
    );
    if (block) {
      throw new HttpException(
        'Users are in a block relationship, cannot block again.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const friend = await this.findUserRelationshipId(
      userOne,
      userTwo,
      RelationshipStatus.FRIEND,
    );
    if (friend) {
      const delRelationship = await this.getOneById(friend);
      await this.relationshipRepository.remove(delRelationship);
    }
    const unconfirm = await this.findUserRelationshipId(
      userOne,
      userTwo,
      RelationshipStatus.NOTCONFIRMED,
    );
    if (unconfirm) {
      const delRelationship = await this.getOneById(unconfirm);
      await this.relationshipRepository.remove(delRelationship);
    }
  }

  checkReqStatus(reqStatus: string): RelationshipStatus {
    let status: RelationshipStatus;
    if (reqStatus === 'friend') status = RelationshipStatus.FRIEND;
    else if (reqStatus === 'notconfirmed')
      status = RelationshipStatus.NOTCONFIRMED;
    else if (reqStatus === 'block') status = RelationshipStatus.BLOCK;
    else {
      throw new HttpException(
        'Relationship status does not exist.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return status;
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

  /*
   ** reformAddFriendSendingData returns
   */
  async reformAddFriendSendingData(
    relationship: Relationship,
  ): Promise<SendAddFriendRelationshipDto> {
    const obj: SendAddFriendRelationshipDto = {
      relationshipId: relationship.id,
      createDate: relationship.createDate,
      status: relationship.status,
      demanderId: relationship.userRelationship[0].userId,
      addresseeId: relationship.userRelationship[1].userId,
    };
    return obj;
  }

  async reformListSendingData(
    userList: UserRelationship[],
  ): Promise<SendSpecificListRelationshipDto[]> {
    const ret: SendSpecificListRelationshipDto[] = userList.map((data) => {
      const obj: SendSpecificListRelationshipDto = {
        user_id: data.user.id,
        user_nickname: data.user.nickname,
        user_avatar: data.user.avatar,
        user_userStatus: data.user.userStatus,
        relation_id: data.relationshipId,
      };
      return obj;
    });
    return ret;
  }

  async reformAllRelationListSendingData(
    list: any,
  ): Promise<SendAllUsersRelationshipDto[]> {
    const ret: SendAllUsersRelationshipDto[] = list.map((data) => {
      const obj: SendAllUsersRelationshipDto = {
        id: data.id,
        nickname: data.nickname,
        avatar: data.avatar,
        userStatus: data.userStatus,
        relationshp: data.relationship,
      };
      return obj;
    });
    return ret;
  }
}
