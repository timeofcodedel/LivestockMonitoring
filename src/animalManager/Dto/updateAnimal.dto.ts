import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateAnimalDto {
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  animalID: number;

  @IsNotEmpty()
  @IsObject()
  @IsOptional()
  objectArg: {animalID?:number};

  @IsNotEmpty()
  @IsObject()
  updateCondition: object;
}
