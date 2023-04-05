import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import Address from '../entity/address.entity';
import User from '../entity/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Address])],
  controllers: [UserController],
  providers: [UserService, JwtStrategy]
})
export class UserModule {}
