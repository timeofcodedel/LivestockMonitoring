import { IsNotEmpty, IsOptional, IsString } from 'class-validator';


export class UpdateUserInfoDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  userName:string;

}