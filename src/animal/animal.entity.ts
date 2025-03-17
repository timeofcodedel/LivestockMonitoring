import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Animal {
  @PrimaryGeneratedColumn()
  animalID: number;//动物id

  @Column({
    type:'varchar',
    default:null
  })
  animalName:string;//动物名字

  @Column({
    type:'varchar',
    default:null,
  })
  animalType:string;//动物类型

  @Column({
    type: 'varchar',
    default:null,
    unique:true,
  })
  GPS_IP: string;//GPS编号

  @Column({
    type:'varchar',
    default:null
  })
  openID:string//用户id

}
