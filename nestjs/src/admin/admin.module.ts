import { Inject, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/model/user.entity';
import { UserService } from 'src/user/service/user.service';
import { UserModule } from 'src/user/user.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UserModule],
  controllers: [AdminController],
})
export class AdminModule {
  constructor(@Inject(UserService) private readonly userService: UserService) {}
}
