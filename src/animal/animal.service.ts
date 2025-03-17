import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Animal } from './animal.entity';
import { DeleteResult, In, Repository } from 'typeorm';
import { AnimalManagerModule } from '../animalManager/animalManager.module';
import { UniqueKeyViolationException } from '../utils/common.exception';

interface updateAnimalData {
  animalName?: string;
  animalType?: string;
  GPS_IP?: string;
}

interface Identifier {
  openID: string;
  animalID?: number;
}

@Injectable()
export class AnimalService {
  private readonly logger: Logger = new Logger(AnimalManagerModule.name);

  constructor(
    @InjectRepository(Animal)
    private readonly animalRepository: Repository<Animal>,
  ) {}

  async registerAnimal(
    animalName: string,
    animalType: string,
    GPS_IP: string,
    openID: string,
  ): Promise<Animal> {
    try {
      const animalEntry: Animal = this.animalRepository.create({
        animalName: animalName,
        animalType: animalType,
        GPS_IP: GPS_IP,
        openID: openID,
      });
      this.logger.log(
        `成功添加动物信息\n 信息:动物类型:${animalType} GPS地址:${GPS_IP} openID:${openID}`,
      );
      return await this.animalRepository.save(animalEntry);
    } catch (err) {
      throw new UniqueKeyViolationException('GPS_IP');
    }
  }

  async findByAllAnimals(openID: string): Promise<Animal[]> {
    return await this.animalRepository.find({
      where: {
        openID: openID,
      },
    });
  }

  async findIPByOpenID(openID: string): Promise<string | null> {
    return (
      (
        await this.animalRepository.findOne({
          where: {
            openID: openID,
          },
          select: ['GPS_IP'],
        })
      )?.GPS_IP || null
    );
  }

  async isGpsIdExist(GPS_IP: string): Promise<boolean> {
    return await this.animalRepository.exists({
      where: {
        GPS_IP: GPS_IP,
      },
    });
  }

  async updateAnimalDataField(
    identifier: Identifier,
    updateObject: updateAnimalData,
  ): Promise<boolean> {
    // 校验GPS_IP字段更新对象不能重复
    if (
      updateObject.GPS_IP !== undefined &&
      (await this.isGpsIdExist(updateObject.GPS_IP))
    ) {
      throw new UniqueKeyViolationException('GPS_IP');
    }
    try {
      const result = await this.animalRepository.update(
        identifier,
        updateObject,
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

  async deleteAnimal(openID: string, animalID: number[]): Promise<boolean> {
    const result: DeleteResult = await this.animalRepository.delete({
      openID: openID,
      animalID: In(animalID),
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
