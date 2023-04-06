import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import Address from './address.entity';
import Post from './post.entity';
import PublicFile from './publicFile.entity';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public email: string;

  @Column()
  public name: string;

  @Column()
  @Exclude()
  public password: string;

  @Column({ nullable: true })
  @Exclude()
  public hashedRefreshToken?: string;

  @OneToOne(() => Address, {
    eager: true,
    cascade: true
  })
  @JoinColumn()
  public address?: Address;

  @OneToOne(() => PublicFile, {
    eager: true,
    nullable: true
  })
  @JoinColumn()
  public avatar?: PublicFile;

  @OneToMany(() => Post, (post: Post) => post.author)
  public posts: Post[];

  @Column({ default: new Date() })
  public createdAt: Date;

  @Column({ default: new Date() })
  public updatedAt: Date;
}

export default User;
