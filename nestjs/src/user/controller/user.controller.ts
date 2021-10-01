import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../model/create-user.dto';
import { UserService } from '../service/user.service';
import { User } from '../model/user.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CurrentUser } from 'src/auth/decorator/currrent.user.decorator';
import { ChangeUserNameDto } from '../model/change-username.dto';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class UserController {
  constructor(private userService: UserService) {}

  /*
   ** getCurrentUser returns current User with id, nickname and createDate
   */
  @Get('me')
  getCurrentUser(@CurrentUser() user: User): Promise<User> {
    return this.userService.getUserProfileById(user.id);
  }

  /*
   ** getAll returns all users
   */
  @Get('all')
  getUsers(): Promise<User[]> {
    return this.userService.getAll();
  }

  /*
   ** getUserProfileById returns the user with id, nickname and createDate
   */
  @Get(':id')
  getUserProfileById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.getUserProfileById(id);
  }

  /*
   ** createUser locally, it returns the new user
   ** have to delete later
   */
  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUserWithDto(createUserDto);
  }

  /*
   ** changeUserName modifies the user's nickname which should be unique
   */
  @Patch('name')
  changeUserName(
    @CurrentUser() user: User,
    @Body() changeUserNameDto: ChangeUserNameDto,
  ): Promise<User> {
    return this.userService.changeUserName(user.id, changeUserNameDto);
  }
}
