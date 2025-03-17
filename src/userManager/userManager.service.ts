import { Injectable, Logger } from '@nestjs/common';
import { User } from '../user/user.entity';
import { UsersService } from '../user/users.service';
import { UserNotFoundException } from '../utils/common.exception';
import { UpdateUserInfoDto } from './dto/updateUserInfo.dto';
import {
  deleteAvatarPicture,
  saveAvatarPicture,
} from '../utils/operationAvatar';

@Injectable()
export class UserManagerService {
  private readonly logger: Logger = new Logger(UserManagerService.name);

  constructor(private readonly userManagerService: UsersService) {}

  async getUserByOpenID(openID: string): Promise<object> {
    const user: User | null =
      await this.userManagerService.getUserByOpenID(openID);
    if (!user) {
      throw new UserNotFoundException();
    }

    //判断头像的路径是否为空
    if (user.avatarPath === null) {
      return {
        userName: user.userName,
        avatarPath: null,
      };
    }
    return {
      userName: user.userName,
      avatarPath: '/api/images/' + user.avatarPath.replace(/\\/g, '/'),
    };

  }

  async updateUserInfo(
    openID: string,
    file: Express.Multer.File,
    updateUserInfoDto: UpdateUserInfoDto,
  ): Promise<boolean> {
    const oldAvatarPath: string | undefined = (
      await this.userManagerService.getUserByOpenID(openID)
    )?.avatarPath; //获取旧头像路径 如果为空则直接返回undefined
    const newAvatarPath: string | undefined = await saveAvatarPicture(file); //获取新头像路径 如果为空则直接返回undefined
    if (
      await this.userManagerService.updateUser(
        openID,
        updateUserInfoDto.userName,
        newAvatarPath,
      )
    ) {
      if (newAvatarPath !== undefined)
        //判断是否上传了新头像
        deleteAvatarPicture(oldAvatarPath).then(() => {
          this.logger.log('用户头像更新成功');
        });
      return true;
    } else {
      this.logger.warn('更新用户信息失败');
      deleteAvatarPicture(newAvatarPath); //删除新头像,以免多出头像
      return false;
    }
  }
}
