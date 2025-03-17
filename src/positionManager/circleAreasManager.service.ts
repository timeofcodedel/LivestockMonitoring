import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';

import { CircleAreaService } from '../circleArea/circleArea.service';
import { RegisterCircleAreasDto } from './Dto/registerCircleAreas.dto';
import { CircleArea } from '../circleArea/circleArea.entity';
import { UpdateCircleAreasDto } from './Dto/updateCircleAreasData.dto';
import { DeleteCircleAreaDto } from './Dto/deleteCircleArea.dto';
import { CircleAreasManagerModule } from './circleAreasManager.module';

@Injectable()
export class CircleAreasManagerService {
  private readonly logger: Logger = new Logger(CircleAreasManagerModule.name);

  constructor(private readonly circleAreaService: CircleAreaService) {}

  async registerCircleArea(
    openID: string,
    registerDto: RegisterCircleAreasDto,
  ): Promise<CircleArea> {
    return await this.circleAreaService.registerCircleArea(
      openID,
      registerDto.name,
      registerDto.latitude,
      registerDto.longitude,
      registerDto.radius,
    );
  }

  async getAllCircleAreas(openID: string): Promise<object[]> {
    const _tArray: CircleArea[] =
      await this.circleAreaService.getAllCircleAreas(openID);
    this.logger.log(`id:${openID}已获取此id下所有动物信息`);
    return _tArray.map(({ openID, createdAt, updatedAt, ...rest }) => ({
      ...rest,
    }));
  }

  //TODO 筛除特定字段,openid这一类的得剔除掉
  async updateCircleArea(
    openID: string,
    updateDataDto: UpdateCircleAreasDto,
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
    //根据情况来判断是更新单个还是批量
    if (
      updateDataDto.circleAreasID !== undefined &&
      updateDataDto.objectArg === undefined
    ) {
      return await this.circleAreaService.updateCircleArea(
        {
          openID: openID,
          id: updateDataDto.circleAreasID,
        },
        updateDataDto.updateCondition,
      );
    } else if (
      updateDataDto.circleAreasID === undefined &&
      updateDataDto.objectArg !== undefined
    ) {
      // 位置编号为空时 将用户和objectArg传入 主要用于批量数据的更改 会忽略positionID的值
      const { circleAreasID, ...removeArg } = updateDataDto.objectArg; //剔除掉circleAreasID
      const safeObject = { ...removeArg, openID: openID }; //将openid添加进去
      return await this.circleAreaService.updateCircleArea(
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

  async deleteCircleArea(
    openID: string,
    deleteCircleAreaDto: DeleteCircleAreaDto,
  ): Promise<boolean> {
    return await this.circleAreaService.deleteCircleArea(
      openID,
      deleteCircleAreaDto.circleAreasIDArray,
    );
  }
}
