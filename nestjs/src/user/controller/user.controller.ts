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
import { JwtTwoFactorGuard } from 'src/auth/guard/jwt-two-factor.guard';
import { ChangeUserAvatarDto } from '../model/change-useravatar.dto';

@UseGuards(JwtAuthGuard)
@UseGuards(JwtTwoFactorGuard)
@Controller('profile')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * getCurrentUser
   * @returns : id, nickname, createDate, userStatus, email, 2fa enable
   */
  @Get('me')
  getCurrentUser(@CurrentUser() user: User): Promise<User> {
    return this.userService.getOneById(user.id);
  }

  /**
   * getAll
   * @returns : all users with id, nickname, createDate, userStatus, email
   */
  @Get('all')
  getUsers(): Promise<User[]> {
    return this.userService.getAll();
  }

  /**
   * getUserProfileById
   * @param : user id
   * @returns : the user with id, nickname, createDate, userStatus, email
   */
  @Get(':id')
  getUserProfileById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.getUserProfileById(id);
  }

  /**
   * createUser locally, it returns the new user
   * have to delete later
   */
  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUserWithDto(createUserDto);
  }

  /**
   * changeUserName
   */
  @Patch('name')
  changeUserName(
    @CurrentUser() user: User,
    @Body() changeUserNameDto: ChangeUserNameDto,
  ): Promise<User> {
    return this.userService.changeUserName(user.id, changeUserNameDto);
  }

  /**
   * changeUserAvatar
   */
  @Patch('avatar')
  changeUserAvatar(
    @CurrentUser() user: User,
    @Body() changeUserAvatarDto: ChangeUserAvatarDto,
  ): Promise<User> {
    return this.userService.changeUserAvatar(user.id, changeUserAvatarDto);
  }
}
