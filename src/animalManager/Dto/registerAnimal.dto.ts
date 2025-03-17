import { IsIP, IsNotEmpty, IsString } from 'class-validator';

export class RegisterAnimalDto {
  @IsString()
  animalName:string;

  @IsString()
  animalType: string;

  @IsNotEmpty()
  @IsIP()
  GPS_IP: string;
}
