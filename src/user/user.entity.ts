import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    type: 'varchar',
    default: null,
    unique:true
  })
  openID: string;

  @Column({
    type: 'varchar',
    default: null,
    nullable:true
  })
  userName: string;

  @Column({
    type: 'varchar',
    default: null,
    nullable:true
  })
  avatarPath: string;
}
