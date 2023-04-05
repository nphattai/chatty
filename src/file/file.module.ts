import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import PublicFile from 'src/entity/publicFile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PublicFile])],
  providers: [FileService],
  exports: [FileService]
})
export class FileModule {}
