import { Body, Controller, Delete, Get, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import User from '../entity/user.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@GetUser() user: User) {
    return { user };
  }

  @Patch()
  async updateUser(@GetUser() user: User, @Body() dto: UpdateUserDto) {
    return this.userService.updateUserInfo(user, dto);
  }

  @Patch('address')
  async updateUserAddress(@GetUser() user: User, @Body() dto: CreateAddressDto) {
    return this.userService.updateAddress(user, dto);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(@GetUser() user: User, @UploadedFile() file) {
    return this.userService.updateAvatar(user, file.buffer, file.originalname);
  }

  @Delete('avatar')
  async deleteAvatar(@GetUser() user: User) {
    return this.userService.deleteAvatar(user);
  }

  @Post('logout')
  async logout(@GetUser() user: User) {
    return this.userService.logout(user);
  }
}
