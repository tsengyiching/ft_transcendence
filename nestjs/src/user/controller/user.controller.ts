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
import { CreateUserDto } from '../interfaces/create-user.dto';
import { UserService } from '../service/user.service';
import { User } from '../entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getUsers(): Promise<User[]> {
    return this.userService.getAll();
  }

  @Get(':id') // need to solve bad id : 500 internal server error
  getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    //ParseIntPipe transforms automatelly a string to a number
    return this.userService.getOneById(id);
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
