import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from 'src/entity/user.entity';

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
    delete user.password;

    const token = await this.signToken(user.id, user.email);

    return { user, token };
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

    delete user.password;

    const token = await this.signToken(user.id, user.email);

    return { user, token };
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
