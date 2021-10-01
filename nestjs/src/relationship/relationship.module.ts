import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/model/user.entity';
import { UserModule } from 'src/user/user.module';
import { RelationshipController } from './controller/relationship.controller';
import { Relationship } from './model/relationship.entity';
import UserRelationship from './model/userRelationship.entity';
import { RelationshipService } from './service/relationship.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Relationship, UserRelationship, User]),
    UserModule,
  ],
  controllers: [RelationshipController],
  providers: [RelationshipService],
})
export class RelationshipModule {}
