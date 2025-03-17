import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class CircleArea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    default:null
  })
  name: string;

  @Column('varchar')
  openID:string


  @Column('double')
  latitude: number;

  @Column('double')
  longitude: number;

  @Column('double')
  radius: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: "CURRENT_TIMESTAMP(6)", // 这个属性确保每次更新时都会更新时间戳
  })
  updatedAt: Date;
}
