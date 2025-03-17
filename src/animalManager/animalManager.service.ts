import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';

import { AnimalService } from '../animal/animal.service';
import { RegisterAnimalDto } from './Dto/registerAnimal.dto';
import { Animal } from '../animal/animal.entity';
import { UpdateAnimalDto } from './Dto/updateAnimal.dto';
import { DeleteAnimalDto } from './Dto/deletAnimal,dto';

@Injectable()
export class AnimalManagerService {
  private readonly logger: Logger = new Logger();

  constructor(private readonly AnimalService: AnimalService) {}

  async registerAnimal(
    openID: string,
    registerDto: RegisterAnimalDto,
  ): Promise<Animal> {
    return this.AnimalService.registerAnimal(
      registerDto.animalName,
      registerDto.animalType,
      registerDto.GPS_IP,
      openID,
    );
  }

  async getAnimals(openID: string): Promise<object[]> {
    const _tArray = await this.AnimalService.findByAllAnimals(openID);
    this.logger.log(`id:${openID}已获取此id下所有动物信息`);
    return _tArray.map(({ openID, ...rest }) => ({ ...rest }));
  }

  async updateAnimalDataField(
    openID: string,
    updateDataDto: UpdateAnimalDto,
  ): Promise<boolean> {
    //判断是否有updateCondition字段,没有则报错
    if (updateDataDto.updateCondition === undefined) {
      throw new BadRequestException(
        HttpStatus.BAD_REQUEST,
        'updateCondition is required',
      );
    }
    //判断是否有openID字段,有则删除掉
    if (updateDataDto.updateCondition.hasOwnProperty('openID')) {
      delete updateDataDto.updateCondition['openID'];
    }
    if (
      updateDataDto.animalID !== undefined &&
      updateDataDto.objectArg === undefined
    ) {
      //动物编号不为空时 将用户和动物编号传入 主要用于一行数据的更改
      return await this.AnimalService.updateAnimalDataField(
        {
          openID: openID,
          animalID: updateDataDto.animalID,
        },
        updateDataDto.updateCondition,
      );
    } else if (
      updateDataDto.animalID === undefined &&
      updateDataDto.objectArg !== undefined
    ) {
      // 动物编号为空时 将用户和objectArg传入 主要用于批量数据的更改 会忽略animalID的值
      const { animalID, ...removeArg } = updateDataDto.objectArg;
      const safeObject = { ...removeArg, openID: openID };
      return await this.AnimalService.updateAnimalDataField(
        safeObject,
        updateDataDto.updateCondition,
      );
    } else {
      throw new BadRequestException(
        HttpStatus.BAD_REQUEST,
        'Only one key parameter and object parameter can be used',
      );
    }
  }

  async deleteAnimal(openID: string, deleteAnimalDto: DeleteAnimalDto) {
    return await this.AnimalService.deleteAnimal(
      openID,
      deleteAnimalDto.animalIDArray,
    );
  }
}
