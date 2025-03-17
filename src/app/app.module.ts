import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { getMetadata } from 'reflect-metadata/no-conflict';

import { User } from '../user/user.entity';
import { AuthModule } from '../auth/auth.module';
import { Animal } from '../animal/animal.entity';
import { AnimalManagerModule } from '../animalManager/animalManager.module';
import { CircleAreasManagerModule } from '../positionManager/circleAreasManager.module';
import { GPSReceiverModule } from '../GPSReceiver/GPSReceiver.module';
import { CircleArea } from '../circleArea/circleArea.entity';
import { UserManagerModule } from '../userManager/userManager.module';
import { InitializerDatabase } from '../utils/InitializerDB';

const dbConfig: object = getMetadata(
  'custom:DBConfig',
  InitializerDatabase,
  'connectionSQL',
);

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql', // 根据你的数据库类型进行修改
      host: dbConfig['host'],
      port: Number(dbConfig['port']),
      username: dbConfig['user'],
      password: dbConfig['password'],
      database: 'animal_track_db',
      entities: [User, Animal, CircleArea],
      synchronize: true, // 生产环境中建议关闭 synchronize
      retryAttempts: 3,
      autoLoadEntities: true,
    }),
    CacheModule.register({
      ttl: 300000,
      max: 100,
      isGlobal: true,
    }),
    AuthModule,
    AnimalManagerModule,
    CircleAreasManagerModule,
    GPSReceiverModule,
    UserManagerModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor(private dataSource: DataSource) {
    this.isInitializeDatabase();
  }

  async isInitializeDatabase(): Promise<void> {
    if (this.dataSource.isInitialized) {
      this.logger.log('Database has connected successful !');
    } else {
      throw Error('Database had connected failed !');
      // this.logger.error('Database had connected failed !');
    }
  }
}
