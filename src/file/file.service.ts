import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import PublicFile from 'src/entity/publicFile.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(PublicFile)
    private publicFilesRepository: Repository<PublicFile>,
    private readonly configService: ConfigService
  ) {}

  async uploadPublicFile(dataBuffer: Buffer, filename: string, queryRunner: QueryRunner) {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        ACL: 'public-read',
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        Body: dataBuffer,
        Key: `${uuid()}-${filename}`
      })
      .promise();

    const newFile = queryRunner.manager.create(PublicFile, {
      key: uploadResult.Key,
      url: uploadResult.Location
    });
    await queryRunner.manager.save(PublicFile, newFile);
    return newFile;
  }

  async deletePublicFile(fileId: number, queryRunner: QueryRunner) {
    const file = await queryRunner.manager.findOne(PublicFile, {
      where: {
        id: fileId
      }
    });

    const s3 = new S3();

    await s3
      .deleteObject({
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        Key: file.key
      })
      .promise();
    await queryRunner.manager.delete(PublicFile, fileId);
  }
}
