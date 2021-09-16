import { number } from '@hapi/joi';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { CreateRelationshipDto } from '../model/create-Relationship.dto';
import { DeleteRelationshipDto } from '../model/delete-Relationship.dto';
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

  /*
   ** getAll returns relationship with details
   */
  getAll(): Promise<Relationship[]> {
    return this.relationshipRepository.find();
  }

  /*
   ** getOneById returns the relationship with details
   */
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

  /*
   ** addFriend returns the new relationship
   */
  async addFriend(
    creatRelationshipDto: CreateRelationshipDto,
  ): Promise<Relationship> {
    const newRelationship = await this.relationshipRepository.create();
    newRelationship.status = RelationshipStatus.NOTCONFIRMED;
    await this.relationshipRepository.save(newRelationship);
    await this.setNewRelation(creatRelationshipDto, newRelationship.id);
    return newRelationship;
  }

  /*
   ** setNewRelation save data in userRelationship table
   */
  async setNewRelation(
    creatRelationshipDto: CreateRelationshipDto,
    id: number,
  ): Promise<void> {
    const requester = await this.userRelationship.create();
    requester.userId = creatRelationshipDto.requesterUserId;
    requester.relationshipId = id;
    await this.userRelationship.save(requester);

    const addressee = await this.userRelationship.create();
    addressee.userId = creatRelationshipDto.addresseeUserId;
    addressee.relationshipId = id;
    await this.userRelationship.save(addressee);
  }

  /*
   ** acceptFriend returns the new relationship
   */
  async acceptFriend(id: number): Promise<Relationship> {
    const relationship = await this.getOneById(id);
    relationship.status = RelationshipStatus.FRIEND;
    return this.relationshipRepository.save(relationship);
  }

  /*
   ** rejectFriend returns the rejected relationship
   */
  async rejectFriend(id: number): Promise<Relationship> {
    const relationship = await this.getOneById(id);
    return this.relationshipRepository.remove(relationship);
  }

  /*
   ** deleteFriend returns the deleted relationship
   */
  async deleteFriend(id: number) {
    return this.userRelationship.find({ userId: id });
  }
}
