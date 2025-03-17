import {Module} from '@nestjs/common';
import { CircleAreasManagerService } from './circleAreasManager.service';
import { CircleAreasManagerController } from './circleAreasManager.controller';
import { CircleAreaModule } from '../circleArea/circleArea.module';

@Module({
  imports:[CircleAreaModule],
  providers:[CircleAreasManagerService],
  controllers:[CircleAreasManagerController]
})
export class CircleAreasManagerModule {}