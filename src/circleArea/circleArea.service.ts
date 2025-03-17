import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DeleteResult, In, Repository } from 'typeorm';
import { CircleArea } from './circleArea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CircleAreaModule } from './circleArea.module';

interface CircleAreaObject {
  name?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

interface siftConditionType {
  openID: string;
  id?: number;
}

@Injectable()
export class CircleAreaService {
  private readonly logger: Logger = new Logger();

  constructor(
    @InjectRepository(CircleArea)
    private readonly circleAreaRepository: Repository<CircleArea>,
  ) {}

  async registerCircleArea(
    openId: string,
    name: string,
    latitude: number,
    longitude: number,
    radius: number,
  ): Promise<CircleArea> {
    const circleAreaEntry: CircleArea = this.circleAreaRepository.create({
      openID: openId,
      name: name,
      latitude: latitude,
      longitude: longitude,
      radius: radius,
    });
    return this.circleAreaRepository.save(circleAreaEntry);
  }

  async getAllCircleAreas(openID: string): Promise<CircleArea[]> {
    return this.circleAreaRepository.find({ where: { openID: openID } });
  }

  async updateCircleArea(
    identifier: siftConditionType,
    updatePositionMessage: CircleAreaObject,
  ): Promise<boolean> {
    //TODO 用泛型优化更新与删除方法
    try {
      const result = await this.circleAreaRepository.update(
        identifier,
        updatePositionMessage,
      );
      if (result.affected !== undefined && result.affected > 0) {
        this.logger.log(`有${result.affected}行的数据成功更新到Animal实体`);
        return true;
      } else {
        this.logger.warn(`没有找到对应的数据更新`);
        return false;
      }
    } catch (err) {
      throw new BadRequestException('wrong request body');
    }
  }

  async deleteCircleArea(openID: string, ids: number[]): Promise<boolean> {
    const result: DeleteResult = await this.circleAreaRepository.delete({
      openID: openID,
      id: In(ids),
    });
    if (result.affected) {
      this.logger.log(`成功删除了 ${result.affected} 条记录`);
      return true;
    } else {
      this.logger.log('没有找到匹配的记录，或删除未成功');
      return false;
    }
  }
}
