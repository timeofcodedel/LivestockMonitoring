import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Animal } from './animal.entity';
import { AnimalService } from './animal.service';

@Module({
  imports: [TypeOrmModule.forFeature([Animal])],
  exports: [AnimalService],
  providers: [AnimalService],
})
export class AnimalModule {}
