import { Controller, Get, Logger, Query } from '@nestjs/common';
import { GPSReceiverService } from './GPSReceiver.service';
import { GPSReceiverModule } from './GPSReceiver.module';
import { GetUser } from '../utils/GetUserDecorator';

@Controller('gps')
export class GPSReceiverController {
  private readonly logger = new Logger(GPSReceiverModule.name);

  constructor(private readonly GPSReceiverService: GPSReceiverService) {}

  @Get('getCaches')
  async getCaches(@GetUser() user: object) {
    return {
      statusCode: 200,
      message: await this.GPSReceiverService.getCaches(user['sub']),
    };
  }
}
