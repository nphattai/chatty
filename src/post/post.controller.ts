import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @Post()
  async createPost(@Body() dto: CreatePostDto) {
    return this.postService.createPost(dto);
  }

  @Get()
  async getPosts() {
    return this.postService.getPosts();
  }

  @Get('/:id')
  async getPost(@Param('id') id: string) {
    return this.postService.getPostById(Number(id));
  }
}
