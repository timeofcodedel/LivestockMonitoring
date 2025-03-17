import { Module } from '@nestjs/common';


import { AnimalModule } from '../animal/animal.module';
import { AnimalManagerService } from './animalManager.service';
import { AnimalManagerController } from './animalManager.controller';

@Module({
  imports:[AnimalModule],
  providers:[AnimalManagerService],
  controllers:[AnimalManagerController]
})
export class AnimalManagerModule {}
