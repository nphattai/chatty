import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import User from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwt: JwtService,
    private config: ConfigService
  ) {}

  async create(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepository.create({ ...dto, password: hashedPassword });
    await this.userRepository.save(user);

    const accessToken = await this.signAccessToken(user.id, user.email);
    const refreshToken = await this.signAccessToken(user.id, user.email);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.userRepository.update(user.id, {
      hashedRefreshToken
    });

    return { user, accessToken, refreshToken };
  }

  async login(dto: LoginUserDto) {
    const user = await this.userRepository.findOne({
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

    const accessToken = await this.signAccessToken(user.id, user.email);
    const refreshToken = await this.signAccessToken(user.id, user.email);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.userRepository.update(user.id, {
      hashedRefreshToken
    });

    return { user, accessToken, refreshToken };
  }

  async refreshToken(userId: number, accessToken: string, refreshToken: string) {
    try {
      await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')
      });
    } catch (error) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId
      }
    });

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(refreshToken, user.hashedRefreshToken);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const newAccessToken = await this.signAccessToken(userId, user.email);

    return {
      accessToken: newAccessToken,
      refreshToken,
      user
    };
  }

  async signAccessToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email
    };

    return this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      secret: this.config.get('JWT_ACCESS_TOKEN_SECRET')
    });
  }

  async signRefreshToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email
    };

    return this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_REFRESH_TOKEN_SECRET'),
      secret: this.config.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')
    });
  }
}
