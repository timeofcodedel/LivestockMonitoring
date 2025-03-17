import { IsArray } from 'class-validator';


export class DeleteAnimalDto {
  @IsArray()
  animalIDArray:number[];
}