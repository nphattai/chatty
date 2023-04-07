import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, MoreThan, Repository } from 'typeorm';
import Post from 'src/entity/post.entity';
import User from 'src/entity/user.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import Category from 'src/entity/category.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>
  ) {}

  async createPost(post: CreatePostDto, user: User) {
    const newPost = await this.postsRepository.create({
      ...post,
      author: user
    });

    await this.postsRepository.save(newPost);

    return newPost;
  }

  async getPosts(userId: number, offset: number, limit: number, startId: number) {
    let separateCount = 0;
    const where: FindManyOptions<Post>['where'] = {};

    if (startId) {
      separateCount = await this.postsRepository.count({
        where: {
          author: {
            id: userId
          }
        }
      });

      where.id = MoreThan(startId);
    }

    const [items, count] = await this.postsRepository.findAndCount({
      where: {
        ...where,
        author: {
          id: userId
        }
      },
      skip: offset,
      take: limit,
      relations: {
        author: false,
        categories: true
      },
      select: {
        categories: {
          id: true
        }
      },
      order: {
        id: 'asc'
      }
    });

    return {
      count: startId ? separateCount : count,
      items
    };
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
