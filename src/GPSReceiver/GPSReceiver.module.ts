import {Module} from '@nestjs/common';
import { GPSReceiverService } from './GPSReceiver.service';
import { GPSReceiverController } from './GPSReceiver.controller';
import { AnimalModule } from '../animal/animal.module';

@Module({
  imports:[AnimalModule],
  providers:[GPSReceiverService],
  exports:[GPSReceiverService],
  controllers:[GPSReceiverController]
})
export class GPSReceiverModule {}