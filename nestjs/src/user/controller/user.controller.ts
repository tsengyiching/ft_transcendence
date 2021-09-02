import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUserDto } from '../model/create-user.dto';
import { UserService } from '../service/user.service';
import { User } from '../model/user.entity';
import { getManager } from 'typeorm';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getUsers(): Promise<User[]> {
    return this.userService.getAll();
  }

  // @Get(':id')
  // getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
  //   return this.userService.getOneById(id);
  // }

  @Get(':id')
  async getUserGameHistoryById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User> {
    const user = await getManager()
      .createQueryBuilder(User, 'user')
      .where('user.id = :id', { id })
      .getOne();
    return user;
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Put(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(id, createUserDto);
  }

  @Delete(':id') // can we delete user ?
  delete(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.deleteUser(id);
  }
}
