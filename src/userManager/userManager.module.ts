import {Module} from '@nestjs/common';
import { UserManagerController } from './userManager.controller';
import { UserManagerService } from './userManager.service';
import { UsersModule } from '../user/users.module';

@Module({
  imports:[UsersModule],
  controllers: [UserManagerController],
  providers: [UserManagerService],
})
export class  UserManagerModule {}