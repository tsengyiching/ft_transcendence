import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { RelationshipDto } from '../model/relationship.dto';
import { Relationship, RelationshipStatus } from '../model/relationship.entity';
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

  getAll(): Promise<Relationship[]> {
    return this.relationshipRepository.find({
      relations: ['userRelationship'],
    });
  }

  async getOneById(id: number): Promise<Relationship> {
    const relationship = await this.relationshipRepository.findOne(id, {
      relations: ['userRelationship'],
    });
    if (relationship) {
      return relationship;
    }
    throw new HttpException(
      'relationship with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getFriends(id: number): Promise<number[]> {
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
    const blocklist = blocked
      .filter((obj) => obj.userId !== id)
      .map((obj) => obj.userId);
    return blocklist;
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
  async getFullData(id: number, status: number): Promise<UserRelationship[]> {
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
    status: number,
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

  async acceptFriend(id: number): Promise<Relationship> {
    const relationship = await this.getOneById(id);
    relationship.status = RelationshipStatus.FRIEND;
    return this.relationshipRepository.save(relationship);
  }

  async rejectFriend(id: number): Promise<Relationship> {
    const relationship = await this.getOneById(id);
    return this.relationshipRepository.remove(relationship);
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
}
