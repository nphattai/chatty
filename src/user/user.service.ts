import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Address from 'src/entity/address.entity';
import User from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>
  ) {}

  async updateUserInfo(user: User, data: UpdateUserDto) {
    const dataToUpdate: User = {
      ...user,
      ...data,
      updatedAt: new Date()
    };

    await this.userRepository.save(dataToUpdate);

    const userUpdated = await this.userRepository.findOne({
      where: {
        id: user.id
      }
    });

    return userUpdated;
  }

  async updateAddress(user: User, dto: CreateAddressDto) {
    let address: Address;

    if (!user.address) {
      address = await this.addressRepository.create(dto);
    } else {
      const currentAddress = await this.addressRepository.findOne({ where: { id: user.address.id } });
      address = { ...currentAddress, ...dto };
    }

    const dataToUpdate: User = {
      ...user,
      address,
      updatedAt: new Date()
    };

    await this.userRepository.save(dataToUpdate);

    const userUpdated = await this.userRepository.findOne({
      where: {
        id: user.id
      }
    });

    return userUpdated;
  }
}
