import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { CircleAreasManagerService } from './circleAreasManager.service';
import { RegisterCircleAreasDto } from './Dto/registerCircleAreas.dto';
import { GetUser } from '../utils/GetUserDecorator';
import { DeleteCircleAreaDto } from './Dto/deleteCircleArea.dto';
import { UpdateCircleAreasDto } from './Dto/updateCircleAreasData.dto';

@Controller('position')
export class CircleAreasManagerController {
  private readonly logger = new Logger('PositionManagerController');

  constructor(
    private readonly circleAreasManagerService: CircleAreasManagerService,
  ) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterCircleAreasDto,
    @GetUser() user: object,
  ) {
    await this.circleAreasManagerService.registerCircleArea(
      user['sub'],
      registerDto,
    );
    this.logger.log(
      `用户: ${user['sub']} 添加了新数据 name:${registerDto.name} latitude:${registerDto.latitude} longitude:${registerDto.radius}`,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'successful!',
    };
  }

  @Get('circleArea')
  async getAllCircleAreas(@GetUser() user: object) {
    return {
      statusCode: HttpStatus.OK,
      message: await this.circleAreasManagerService.getAllCircleAreas(user['sub']),
    };
  }

  @Post('delete')
  async deleteCircleArea(
    @Body() deleteCircleAreaDto: DeleteCircleAreaDto,
    @GetUser() user: object,
  ) {
    const _delFlag: boolean =
      await this.circleAreasManagerService.deleteCircleArea(
        user['sub'],
        deleteCircleAreaDto,
      );
    if (_delFlag)
      return {
        statusCode: HttpStatus.OK,
        message: 'successful!',
      };
    else
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'failed!',
      };
  }

  @Post('update')
  async updateCircleArea(
    @Body() updateCircleAreaDto: UpdateCircleAreasDto,
    @GetUser() user: object,
  ) {
    const updateFlag: boolean =
      await this.circleAreasManagerService.updateCircleArea(
        user['sub'],
        updateCircleAreaDto,
      );
    if (updateFlag)
      return {
        statusCode: HttpStatus.OK,
        message: 'successful!',
      };
    else
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'failed!',
      };
  }
}
