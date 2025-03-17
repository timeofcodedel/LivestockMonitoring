import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
//import { UsersModule } from './users.module';

@Injectable()
export class UsersService {
  private readonly logger = new Logger();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async isByOpenID(openID: string): Promise<boolean> {
    return !!(await this.userRepository.findOne({ where: { openID: openID } }));
  }

  async createUser(
    openID: string,
    avatarPath?: string | undefined,
    userName?: string,
  ): Promise<User> {
    const userEntry: User = this.userRepository.create({
      openID: openID,
      userName: userName,
      avatarPath: avatarPath,
    });
    return this.userRepository.save(userEntry);
  }

  async getUserByOpenID(openID: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { openID: openID } });
  }

  async getAvatarPathByOpenId(openID: string): Promise<string | null> {
    const avatarPath = (
      await this.userRepository.findOne({
        where: { openID: openID },
      })
    )?.avatarPath;
    return avatarPath === undefined ? null : avatarPath;
  }

  async updateUser(
    openID: string,
    userName?: string,
    avatarPath?: string,
  ): Promise<boolean> {
    const updateObject: object = {};
    try {
      if (userName === undefined && avatarPath === undefined) {
        this.logger.warn(`没有更新任何数据`);
        return false;
      }
      if (userName !== undefined) updateObject['userName'] = userName;
      if (avatarPath !== undefined) updateObject['avatarPath'] = avatarPath;
      const updateResult = await this.userRepository.update(
        { openID: openID },
        updateObject,
      );
      if (updateResult.affected !== undefined && updateResult.affected > 0) {
        this.logger.log(`成功更新到user实体中`);
        return true;
      } else {
        this.logger.warn(`没有找到对应的数据更新`);
        return false;
      }
    } catch (err) {
      throw new BadRequestException('wrong request body');
    }
  }
}
