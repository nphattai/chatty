import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import Category from 'src/entity/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryRepository.create(createCategoryDto);
    await this.categoryRepository.save(category);

    return category;
  }

  async findAll() {
    return await this.categoryRepository.find({
      relations: {
        posts: true
      }
    });
  }

  async findOne(id: number) {
    return this.categoryRepository.findOne({
      where: { id },
      relations: {
        posts: true
      }
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.categoryRepository.update(id, updateCategoryDto);
    const updatedCategory = await this.categoryRepository.findOne({ where: { id } });

    return updatedCategory;
  }

  async remove(id: number) {
    await this.categoryRepository.delete({ id });

    return { success: true };
  }
}
