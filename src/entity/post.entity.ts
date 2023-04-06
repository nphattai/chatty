import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import User from './user.entity';
import Category from './category.entity';

@Entity()
class Post {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public title: string;

  @Column()
  public content: string;

  @ManyToOne(() => User, (author: User) => author.posts)
  public author: User;

  @RelationId((post: Post) => post.author)
  public authorId: number;

  @ManyToMany(() => Category, (category: Category) => category.posts)
  @JoinTable()
  public categories: Category[];
}

export default Post;
