import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as dgram from 'node:dgram';

import { getLocalIP } from '../utils/getLocalIP';
import { GPSReceiverModule } from './GPSReceiver.module';
import { NmeaParser } from '../utils/NmeaParser';
import { AnimalService } from '../animal/animal.service';

//TODO 本地持久化存储方案
/*
  应用于setCache函数中
  方案是在设置缓存时在设置一个定时监听器,监听器设定的时间为time=(ttl-?)*1000ms
  并设置持久化数据回调函数,当缓存快过期时
*/

@Injectable()
export class GPSReceiverService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger: Logger = new Logger(GPSReceiverModule.name);
  private readonly IPCount: object = {}; //每个ip对应下的所有"位置点"数据为{max:最大值,min:最小值}
  //以每个ip为组来分,内部大小分点
  private readonly IPKeyExpired: Map<string, number> = new Map(); //储存每个key的过期时间
  private server: dgram.Socket;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private schedulerRegister: SchedulerRegistry,
    private readonly animalService: AnimalService,
  ) {}

  onApplicationBootstrap(): any {
    this.server = dgram.createSocket('udp4');
    const port = 8080;
    this.server.bind(port);
    this.server.on('listening', () => {
      const localIP = getLocalIP();
      if (localIP) {
        this.logger.log(`This server Ip is ${localIP}`);
      } else {
        throw new Error('无法获取本机IP地址');
      }
      this.logger.log(`GPSReceiverService is listening on port ${port}`);
    });
    this.server.on('message', (msg, rinfo) => {
      this.logger.log(
        `GPSReceiverService received message from ${rinfo.address}:${rinfo.port}`,
      );
      const message: string = msg.toString();
      const result: object | null = NmeaParser.parseNmeaSignal(
        message.substring(0, 5),
        message,
      );
      if (result) {
        // date字段包含解析结果和时间戳
        this.setCache(result, rinfo);
      } else {
        this.logger.error(`Invalid NMEA signal: ${message}`);
      }
    });
  }

  onApplicationShutdown(signal?: string): any {
    this.logger.log(`GPSReceiverService is shutdowning`);
    this.schedulerRegister.getCronJob('cleanExpiredKeys').stop();
    this.server.close();
    this.cacheManager.clear();
  }

  private generateKey(ip: string): string {
    /*
     key的生成规则: 每个GPS的ip地址+'_'+ 每个GPS独立的自增序号
     IPCount记录了每个ip的最大计数
   */
    if (!this.IPCount[ip]) {
      this.IPCount[ip] = { max: 1, min: 1 };
    }
    const sequencePart = this.IPCount[ip].max % 10000;
    this.IPCount[ip].max++;
    return `${ip}_${sequencePart}`;
  }

  private async setCache(result: object, rinfo: any) {
    result['arrivalTime'] = new Date()
      .toISOString()
      .slice(0, 16)
      .replace(/[-:]|\.\d{3}/g, ''); // 获取当前时间戳
    const key = this.generateKey(rinfo.address);
    this.IPKeyExpired.set(key, Date.now() + 300 * 1000); // 当前时间戳+300秒=300秒后过期
    await this.cacheManager.set(key, result);
    this.logger.log(`GPSReceiverService cache key:${key}`);
  }

  public async getCaches(openID: string): Promise<object> {
    /*
      根据ip为组获取到最小到最大值的点序号
      里面每个点序号并构建key,获取cache中的value
      将获取到的value推进数组中并返回
    */
    this.cleanExpiredKeys();
    const machineIP: string | null =
      await this.animalService.findIPByOpenID(openID);
    if (!machineIP || !this.IPCount[machineIP]) return [];
    const maxN: number = this.IPCount[machineIP].max;
    const minN: number = this.IPCount[machineIP].min;
    const cacheArray: object[] = [];
    for (let i: number = minN; i < maxN; i++) {
      const key: string = `${machineIP}_${i}`;
      const result: object | null = await this.cacheManager.get(key);
      this.delKey(key);
      if (result) {
        cacheArray.push(result);
      } //else {
      //   // TODO 判断为空时 从数据库中选取对应数据加入结果数组 等到循环结束后,在清理一次过期缓存
      //   // TODO 还要考虑是否更改大小编号(待定)
      //   this.cleanExpiredKeys();
      // }
    }
    return {
      ip: machineIP,
      positionData:cacheArray,
    };
  }

  private async delKey(key: string): Promise<void> {
    const [ip, sequence] = key.split('_');
    // 因为用的是Map,拿到的顺序基本就是插入顺序
    this.IPCount[ip].min++;
    // 将过期的最小索引赋值给计数对象的最小项+1
    this.IPKeyExpired.delete(key); //删除这个ip的索引
    if (this.IPCount[ip].max <= this.IPCount[ip].min)
      //如果最小索引大于等于最大索引,则删除该ip的计数对象,说明此ip已经没有数据了
      delete this.IPCount[ip];
  }

  @Cron('*/5 * * * *', {
    name: 'cleanExpiredKeys',
  })
  cleanExpiredKeys() {
    //清理逻辑,与getCaches类似,但是这里不需要返回值,直接在循环中清理过期缓存
    //this.logger.log(`正在清理过期缓存.....`);
    this.IPKeyExpired.forEach((expiredTime, key) => {
      if (Date.now() > expiredTime) {
        // 表明该key已经过期
        this.delKey(key);
      }
    });
  }
}
