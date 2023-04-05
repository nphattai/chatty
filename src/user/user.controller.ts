import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import User from '../entity/user.entity';
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
    return this.userService.updateById(user.id, dto);
  }
}
