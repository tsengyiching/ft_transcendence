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
  async getUserProfileById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User> {
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
}
