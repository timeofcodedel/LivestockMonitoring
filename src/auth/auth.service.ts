import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import axios from 'axios';

import { UsersService } from '../user/users.service';
import { User } from '../user/user.entity';
import { AuthModule } from './auth.module';
import { LoginDto } from './dto/login.dto';
import { saveAvatarPicture } from '../utils/operationAvatar';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthModule.name);

  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async login(loginDto: LoginDto, file: Express.Multer.File | undefined) {
    const response = await axios.get(
      'https://api.weixin.qq.com/sns/jscode2session',
      {
        params: {
          appid: 'wx87bd4fdc00fe31b0',
          secret: 'b6044ff23a03f1ff71ea03957ae98116',
          js_code: loginDto.code,
          grant_type: 'authorization_code',
        },
      },
    );
    if (
      [40029, 45011, 40226, 40163, -1].includes(response.data['errcode']) ||
      response.status === 400
    ) {
      throw new HttpException(
        'fetch origin data failed!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const [session_key, openid] = [
      response.data['session_key'],
      response.data['openid'],
    ];
    this.logger.log(`openid: ${openid}, session_key:${session_key}`);
    //判断是否有该用户,无则顺带注册
    if (!(await this.userService.isByOpenID(openid))) {
      const filePath: string | undefined =
        file === undefined ? undefined : await saveAvatarPicture(file);
      await this.register(openid, filePath, loginDto.userName);
    }
    await this.cacheManager.set(openid, session_key, 1000 * 60 * 60); //设置session_key的有效期
    const token = await this.jwtService.signAsync({ sub: openid });
    const avatarPath: string | undefined = (
      await this.userService.getAvatarPathByOpenId(openid)
    )?.replace(/\\/g, '/');
    if (avatarPath === undefined) {
      return {
        statusCode: 200,
        access_token: token,
        avatarPath:null
      };
    }
    return {
      statusCode: 200,
      access_token: token,
      avatarPath: '/api/images/' + avatarPath,
      //TODO 头像路径判断是否为空
    };
  }

  async register(
    openID: string,
    avatarPath: string | undefined,
    userName?: string,
  ): Promise<User> {
    return await this.userService.createUser(openID, avatarPath, userName);
  }
}
