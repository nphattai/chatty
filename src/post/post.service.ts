import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Post from 'src/entity/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>
  ) {}

  async createPost(dto: CreatePostDto) {
    return this.postsRepository.create(dto);
  }

  async getPosts() {
    return this.postsRepository.find();
  }

  async getPostById(id: number) {
    return this.postsRepository.findOne({
      where: {
        id
      }
    });
  }
}
