import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import * as path from 'node:path';

import { AppModule } from './src/app/app.module';
import { InitializerDatabase } from './src/utils/InitializerDB';
import { sleep } from './src/utils/sleepUtil';

/*
 * {
 *    "statusCode": 200,
 *    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJvVGUxNzdWZVBaZnRvMkJKSE9wREJjTXVJd1Y4IiwiaWF0IjoxNzQwOTcwMzMwLCJleHAiOjE3NDE1NzUxMzB9.eWhKw8qlM_g6-S2On8N7Wj82hsG-clg4k7Wi3h8sh4A"
 * }
 *
 */
async function bootstrap() {
  await InitializerDatabase.connectionSQL();
  await sleep(100); //等待初始化数据库
  console.log('静态资源站点已挂载,站点地址为: /upload/avatars');
  const app = await NestFactory.create(AppModule);
  app.use(
    '/api/images',
    express.static(path.join(__dirname, '..', 'upload', 'avatars')),
  );
  await app.listen(3000);
  app.enableShutdownHooks(); //测试环境经禁用
}

bootstrap();
