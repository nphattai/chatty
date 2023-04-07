import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Address from 'src/entity/address.entity';
import User from 'src/entity/user.entity';
import { FileService } from 'src/file/file.service';
import { DataSource, Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private fileService: FileService,
    private dataSource: DataSource
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (user.avatar) {
        await queryRunner.manager.update(User, user.id, {
          ...user,
          avatar: null
        });
        await this.fileService.deletePublicFile(user.avatar.id, queryRunner);
      }

      const avatar = await this.fileService.uploadPublicFile(imageBuffer, filename, queryRunner);

      await queryRunner.manager.update(User, user.id, {
        ...user,
        avatar
      });

      await queryRunner.commitTransaction();
      return avatar;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      queryRunner.release();
    }
  }

  async deleteAvatar(user: User) {
    const queryRunner = this.dataSource.createQueryRunner();

    const fileId = user.avatar.id;

    if (fileId) {
      try {
        await queryRunner.connect();
        await queryRunner.startTransaction();

        queryRunner.manager.update(User, user.id, {
          avatar: null
        });

        await this.fileService.deletePublicFile(fileId, queryRunner);

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException();
      } finally {
        queryRunner.release();
      }
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
