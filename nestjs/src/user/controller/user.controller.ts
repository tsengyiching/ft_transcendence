import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from '../model/create-user.dto';
import { UserService } from '../service/user.service';
import { User } from '../model/user.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CurrentUser } from 'src/auth/decorator/currrent.user.decorator';
import { ChangeUserNameDto } from '../model/change-username.dto';
import { JwtTwoFactorGuard } from 'src/auth/guard/jwt-two-factor.guard';
import { ChangeUserAvatarDto } from '../model/change-useravatar.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { Readable } from 'stream';

@UseGuards(JwtAuthGuard)
@UseGuards(JwtTwoFactorGuard)
@Controller('profile')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * getCurrentUser
   * @returns : id, nickname, createDate, userStatus, siteStatus, email, 2fa enable
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

  @Post('upload')
  @UseInterceptors(FileInterceptor("file"))
  async addAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.addAvatar(user.id, file.buffer, file.originalname);
  }

  @Get('avatarfile/:id')
  async getDatabaseFileById(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) response: Response,
  ) {
    const file = await this.userService.getFileById(id);
    const stream = Readable.from(file.data);

    response.set({
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'Content-Type': 'image',
    });

    return new StreamableFile(stream);
  }
}
