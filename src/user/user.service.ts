import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Address from 'src/entity/address.entity';
import User from 'src/entity/user.entity';
import { FileService } from 'src/file/file.service';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private fileService: FileService
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

  async updateAvatar(user: User, imageBuffer: Buffer, filename: string) {
    if (user.avatar) {
      await this.userRepository.update(user.id, {
        ...user,
        avatar: null
      });
      await this.fileService.deletePublicFile(user.avatar.id);
    }

    const avatar = await this.fileService.uploadPublicFile(imageBuffer, filename);

    await this.userRepository.update(user.id, {
      ...user,
      avatar
    });

    return avatar;
  }

  async deleteAvatar(user: User) {
    const fileId = user.avatar.id;

    if (fileId) {
      await this.userRepository.update(user.id, {
        avatar: null
      });

      await this.fileService.deletePublicFile(fileId);
    } else {
      throw new BadRequestException();
    }
  }

  async logout(user: User) {
    const response = await this.userRepository.update(user.id, {
      hashedRefreshToken: null
    });

    return { status: response.affected };
  }
}
