import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public email: string;

  @Column()
  public name: string;

  @Column()
  public password: string;

  @Column({ default: new Date() })
  public createdAt: Date;

  @Column({ default: new Date() })
  public updatedAt: Date;
}

export default User;
