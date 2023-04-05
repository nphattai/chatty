import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import Address from './address.entity';

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

  @OneToOne(() => Address, {
    eager: true,
    cascade: true
  })
  @JoinColumn()
  public address?: Address;

  @Column({ default: new Date() })
  public createdAt: Date;

  @Column({ default: new Date() })
  public updatedAt: Date;
}

export default User;
