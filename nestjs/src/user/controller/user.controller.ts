import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUserDto } from '../model/create-user.dto';
import { UserService } from '../service/user.service';
import { User } from '../model/user.entity';
import { AddFriendDto } from '../model/add-friend.dto';

@Controller('profile')
export class UserController {
  constructor(private userService: UserService) {}

  /*
   ** delete later
   */
  @Get()
  getUsers(): Promise<User[]> {
    return this.userService.getAll();
  }

  @Get(':id')
  async getUserProfileById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserProfileById(id);
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Put(':id/name')
  updateUserNickname(
    @Param('id', ParseIntPipe) id: number,
    @Body() createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.userService.updateUserNickname(id, createUserDto);
  }

  // @Delete(':id') // can we delete user ?
  // delete(@Param('id', ParseIntPipe) id: number): Promise<User> {
  //   return this.userService.deleteUser(id);
  // }

  // @Put(':id/following')
  // follow(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() addFriendDto: AddFriendDto,
  // ): Promise<User> {
  //   return this.userService.follow(id, addFriendDto);
  // }

  // @Get(':id/follower')
  // getFollower(@Param('id', ParseIntPipe) id: number): Promise<User> {
  //   return this.userService.getFollower(id);
  // }

  // @Get(':id/following')
  // getFollowing(@Param('id', ParseIntPipe) id: number): Promise<User> {
  //   return this.userService.getFollowing(id);
  // }
}
