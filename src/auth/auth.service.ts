import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}

  async create(dto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          ...dto,
          password: hashedPassword
        }
      });

      delete user.password;

      const token = await this.signToken(user.id, user.email);

      return { user, token };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ForbiddenException('Invalid credentials');
      } else {
        throw error;
      }
    }
  }

  async login(dto: LoginUserDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email
        }
      });

      if (!user?.id) {
        throw new ForbiddenException('Invalid credentials');
      }

      const isMatch = await bcrypt.compare(dto.password, user.password);
      if (!isMatch) {
        throw new ForbiddenException('Invalid credentials');
      }

      delete user.password;

      const token = await this.signToken(user.id, user.email);

      return { user, token };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ForbiddenException('Invalid credentials');
      } else {
        throw error;
      }
    }
  }

  async signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email
    };

    return this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET')
    });
  }
}
