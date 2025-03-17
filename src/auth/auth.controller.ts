import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../utils/isPublicDecorator';
import { LoginDto } from './dto/login.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger();

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async login(
    @Body() LoginDto: LoginDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpeg|png|gif|jpg|webp)$/ })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file?: Express.Multer.File,
  ) {
    this.logger.log(`用户临时凭证code:${LoginDto.code}`);
    const tokenObject = await this.authService.login(LoginDto, file);
    this.logger.log(`用户登录成功`);
    return tokenObject;
  }
}
