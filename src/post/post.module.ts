import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Post from 'src/entity/post.entity';
import Category from 'src/entity/category.entity';
import PostsSearchService from './post-serch.service';
import { SearchModule } from 'src/search/search.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Category]), SearchModule],
  controllers: [PostController],
  providers: [PostService, PostsSearchService]
})
export class PostModule {}
