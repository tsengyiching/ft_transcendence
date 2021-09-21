import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../model/create-user.dto';
import { UserService } from '../service/user.service';
import { User } from '../model/user.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CurrentUser } from 'src/auth/decorator/currrent.user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getUser(@CurrentUser() user: User): Promise<User> {
    return this.userService.getUserProfileById(user.id);
  }

  /*
   ** delete later
   */
  @Get('all')
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
    return this.userService.createUserWithDto(createUserDto);
  }

  @Put('/updateNickname')
  updateUserNickname(
    @CurrentUser() user: User,
    @Body() createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.userService.updateUserNickname(user.id, createUserDto);
  }
}
