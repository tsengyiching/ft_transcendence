import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserService } from '../service/user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getUsers(): any {
    return this.userService.getAll();
  }

  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number): any {
    //ParseIntPipe transforms automatelly a string to a number
    return this.userService.getOneById(id);
  }

  @Post()
  createUser(@Body() body: CreateUserDto): any {
    return this.userService.createUser(body);
  }
}
