import { IsArray } from 'class-validator';

export class DeleteCircleAreaDto {
  @IsArray()
  circleAreasIDArray: number[];
}
