import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import Post from 'src/entity/post.entity';
import User from 'src/entity/user.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import Category from 'src/entity/category.entity';
import PostsSearchService from './post-search.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private postSearchService: PostsSearchService
  ) {}

  async createPost(post: CreatePostDto, user: User) {
    const newPost = await this.postsRepository.create({
      ...post,
      author: user
    });

    await this.postsRepository.save(newPost);

    await this.postSearchService.indexPost(newPost);

    return newPost;
  }

  async searchForPosts(text: string) {
    const results = await this.postSearchService.search(text);

    const ids = results.map((result) => result.id);
    if (!ids.length) {
      return [];
    }
    return this.postsRepository.find({
      where: { id: In(ids) }
    });
  }

  async getPosts(userId: number) {
    return this.postsRepository.find({
      where: {
        author: {
          id: userId
        }
      },
      relations: {
        author: false,
        categories: true
      },
      select: {
        categories: {
          id: true
        }
      }
    });
  }

  async getPostById(id: number) {
    return this.postsRepository.findOne({
      relations: ['author'],
      where: {
        id
      }
    });
  }

  async updatePost(id: number, dto: UpdatePostDto, user: User) {
    const post = await this.postsRepository.findOne({ where: { id }, relations: { author: true } });

    if (post.author.id !== user.id) {
      throw new ForbiddenException();
    }

    await this.postsRepository.update(id, dto);
    const updatedPost = await this.postsRepository.findOne({
      where: { id },
      relations: ['author']
    });

    return updatedPost;
  }

  async addPostToCategory(postId: number, categoryId: number, user: User) {
    const post = await this.postsRepository.findOne({
      where: {
        id: postId
      },
      relations: {
        categories: true,
        author: true
      }
    });

    if (post.author.id !== user.id) {
      throw new ForbiddenException();
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId }
    });

    post.categories = post.categories ? [...post.categories, category] : [category];

    await this.postsRepository.save(post);

    const postUpdated = await this.postsRepository.findOne({
      where: { id: postId },
      relations: {
        categories: true
      }
    });

    return postUpdated;
  }
}
