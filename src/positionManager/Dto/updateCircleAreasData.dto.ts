import { IsNotEmpty, IsNumber, IsObject, IsOptional } from 'class-validator';


export class UpdateCircleAreasDto {
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  circleAreasID:number;

  @IsNotEmpty()
  @IsObject()
  @IsOptional()
  objectArg:{circleAreasID?:number};


  @IsNotEmpty()
  @IsObject()
  updateCondition:object
}