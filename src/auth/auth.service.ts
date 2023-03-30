import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { hash, verify } from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, LoginUserDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}

  async register(createUserDto: CreateUserDto): Promise<{ access_token: string; user: User }> {
    const hashedPassword = await hash(createUserDto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword
        }
      });

      delete user.password;

      const token = await this.signToken(user.id, user.email);

      return { user, access_token: token };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ForbiddenException('Invalid credentials');
      } else {
        throw error;
      }
    }
  }

  async login(dto: LoginUserDto): Promise<{ access_token: string; user: User }> {
    try {
      // check user exist
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email
        }
      });
      // if use not exits throw exception
      if (!user) {
        throw new ForbiddenException('Invalid credentials');
      }

      // compare password
      const isMatch = await verify(user.password, dto.password);
      // if password not match throw exception
      if (!isMatch) {
        throw new ForbiddenException('Invalid credentials');
      }

      // return user
      delete user.password;

      const token = await this.signToken(user.id, user.email);

      return { user, access_token: token };
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
