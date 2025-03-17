import {
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserManagerService } from './userManager.service';
import { GetUser } from '../utils/GetUserDecorator';
import { UpdateUserInfoDto } from './dto/updateUserInfo.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserManagerController {
  constructor(private readonly userManagerService: UserManagerService) {}

  @Get()
  async getUserInfo(@GetUser() user: object): Promise<object> {
    return {
      statusCode: 200,
      message: await this.userManagerService.getUserByOpenID(user['sub']),
    };
  }

  @Post('update')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async updateUserInfo(
    @Body() updateDto: UpdateUserInfoDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpeg|png|gif|jpg|webp)$/ })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @GetUser() user: object,
  ): Promise<object> {
    await this.userManagerService.updateUserInfo(user['sub'], file, updateDto);
    return {
      statusCode: 200,
      message: 'successful!',
    };
  }
}
