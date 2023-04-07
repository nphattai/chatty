import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import User from 'src/entity/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @Post()
  async createPost(@Body() post: CreatePostDto, @GetUser() user: User) {
    return this.postService.createPost(post, user);
  }

  @Get()
  async getPosts(@GetUser() user: User, @Query('search') search: string) {
    if (search) {
      return this.postService.searchForPosts(search);
    }
    return this.postService.getPosts(user.id);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.postService.getPostById(Number(id));
  }

  @Patch(':id')
  async updatePost(@Param('id') id: string, @Body() post: UpdatePostDto, @GetUser() user: User) {
    return this.postService.updatePost(Number(id), post, user);
  }

  @Post('category')
  async addPostToCategory(@Body() body: { postId: number; categoryId: number }, @GetUser() user: User) {
    return this.postService.addPostToCategory(body.postId, body.categoryId, user);
  }
}
