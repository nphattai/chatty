import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from 'src/entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async updateById(id: number, data: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        id
      }
    });

    delete user.password;

    const dataToUpdate: User = {
      ...user,
      ...data,
      updatedAt: new Date()
    };

    this.userRepository.save(dataToUpdate);

    return user;
  }
}
