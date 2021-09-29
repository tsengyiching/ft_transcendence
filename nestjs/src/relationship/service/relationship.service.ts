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
    return this.getRelationshipReturnObj(relationship);
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
    const relation = await this.getRelationshipReturnObj(relationship);
    return relation[0];
  }

  async getFriendList(id: number): Promise<number[]> {
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
    const newRelationship = await this.relationshipRepository.create();
    newRelationship.status = RelationshipStatus.NOTCONFIRMED;
    await this.relationshipRepository.save(newRelationship);
    await this.setNewRelation(id, relationshipDto, newRelationship.id);
    return newRelationship;
  }

  async acceptFriend(id: number): Promise<SendRelationshipDto> {
    const old = await this.getOneById(id);
    if (!old) {
      throw new HttpException(
        'Relationship with this id does not exist.',
        HttpStatus.NOT_FOUND,
      );
    }
    old.status = RelationshipStatus.FRIEND;
    const newStatus = await this.relationshipRepository.save(old);
    return this.getNewRelationship(newStatus);
  }

  async rejectFriend(id: number): Promise<SendRelationshipDto> {
    const relationship = await this.getOneById(id);
    if (!relationship) {
      throw new HttpException(
        'Relationship with this id does not exist.',
        HttpStatus.NOT_FOUND,
      );
    }
    if (relationship.status === RelationshipStatus.FRIEND) {
      throw new HttpException(
        'Relationship has been confirmed already, cannot modify again.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const rm = await this.relationshipRepository.remove(relationship);
    return this.getNewRelationship(rm);
  }

  async deleteFriend(
    id: number,
    deleteRelationshipDto: RelationshipDto,
  ): Promise<Relationship> {
    const relationshipiId = await this.getRelationshipId(
      id,
      deleteRelationshipDto.addresseeUserId,
      RelationshipStatus.FRIEND,
    );
    const delRelationship = await this.getOneById(relationshipiId);
    return this.relationshipRepository.remove(delRelationship);
  }

  async blockUser(
    id: number,
    relationshipDto: RelationshipDto,
  ): Promise<Relationship> {
    const relationExistId = await this.getRelationshipId(
      id,
      relationshipDto.addresseeUserId,
      RelationshipStatus.FRIEND,
    );
    if (relationExistId !== 0) {
      const delRelationship = await this.getOneById(relationExistId);
      await this.relationshipRepository.remove(delRelationship);
    }
    const newRelationship = await this.relationshipRepository.create();
    newRelationship.status = RelationshipStatus.BLOCK;
    await this.relationshipRepository.save(newRelationship);
    await this.setNewRelation(id, relationshipDto, newRelationship.id);
    return newRelationship;
  }

  async deleteBlockUser(
    id: number,
    relationshipDto: RelationshipDto,
  ): Promise<Relationship> {
    const relationshipiId = await this.getRelationshipId(
      id,
      relationshipDto.addresseeUserId,
      RelationshipStatus.BLOCK,
    );
    const delRelationship = await this.getOneById(relationshipiId);
    return this.relationshipRepository.remove(delRelationship);
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
   ** getRelationshipReturnObj returns SendRelationshipDto[]
   */
  async getRelationshipReturnObj(
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
   ** getRelationshipReturnObj returns SendRelationshipDto[]
   */
  async getNewRelationship(
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
   ** getRelationshipId returns user and his friend's relationshipId
   */
  async getRelationshipId(
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
    const relationshipId = found[0].values().next().value;
    return relationshipId;
  }
}
