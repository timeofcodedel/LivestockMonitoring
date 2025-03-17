import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';


export class RegisterCircleAreasDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @IsNotEmpty()
  @IsNumber()
  radius: number;
}