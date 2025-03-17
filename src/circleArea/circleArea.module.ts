import { Module } from '@nestjs/common';
import { CircleAreaService } from './circleArea.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CircleArea } from './circleArea.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CircleArea])],
  providers:[CircleAreaService],
  exports:[CircleAreaService]
})
export class CircleAreaModule {}
