import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import * as mysql from 'mysql2';
import { promises as fs, readFileSync } from 'fs';
import { getMetadata, hasMetadata } from 'reflect-metadata/no-conflict';

import { setDBMateDataDecorator } from './setDBMetaDataDecorator';

export class InitializerDatabase {
  private static async messageQuery(): Promise<object> {
    const r1: readline.Interface = readline.createInterface({
      input,
      output,
    });
    r1.on('SIGINT',()=>{
      console.log('\n正在关闭询问流')
      r1.close();
    });
    const info: string[] = [];
    const DBHost: string = await r1.question(
      `请数据库地址(默认值: ${'localhost'}): `,
    );
    const DBPort: string = await r1.question(
      `请数据库端口(默认值: ${'3306'}): `,
    );
    const DBName: string = await r1.question(
      `请数据库名称(默认值: ${'root'}): `,
    );
    let DBPassword: string = await r1.question(`请数据库密码: `);

    while (DBPassword === '') {
      DBPassword = await r1.question(`请数据库密码: `);
    }
    r1.close();
    info.push(DBHost === '' ? 'localhost' : DBHost);
    info.push(DBPort === '' ? '3306' : DBPort);
    info.push(DBName === '' ? 'root' : DBName);
    info.push(DBPassword);
    return this.adapterInfoToDict(info);
  }

  @setDBMateDataDecorator()
  public static async connectionSQL(): Promise<void> {
    let info: object = {};
    if (!(await this.checkConfigExists())) {
      info = await this.messageQuery(); //询问用户
      await this.writeConfig(info); //写入文件
    } else {
      // 获取数据库元数据
      info = getMetadata(
        'custom:DBConfig',
        InitializerDatabase,
        'connectionSQL',
      );
    }
    const connectInstance = mysql.createConnection({
      host: info['host'],
      port: Number(info['port']),
      user: info['user'],
      password: info['password'],
    });
    try {
      connectInstance.execute('CREATE DATABASE IF NOT EXISTS animal_track_db');
      console.log('数据库初始化正在执行中.....');
    } catch (err) {
      throw new Error('数据库初始化错误');
    } finally {
      connectInstance.end();
    }
  }

  private static async writeConfig(info: object): Promise<boolean> {
    const jsonData: string = JSON.stringify(info, null, 2);
    const filePath: string = 'AppConfig.json';
    console.log('正在创建配置文件');
    try {
      await fs.writeFile(filePath, jsonData, 'utf8');
      console.log('成功创建配置文件....');
      return true;
    } catch (err) {
      console.error('创建配置文件时发生错误');
      return false;
    }
  }

  public static readConfig<T>(): T | null {
    try {
      console.log('正在读取配置文件.....');
      const filePath: string = 'AppConfig.json';
      const fileContent = readFileSync(filePath, 'utf8');
      console.log('读取配置文件成功');
      return JSON.parse(fileContent);
    } catch (err) {
      console.error('找不到该配置文件:');
      return null;
    }
  }

  private static async checkConfigExists(): Promise<boolean> {
    try {
      await fs.stat('AppConfig.json');
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // ENOENT表示文件或目录不存在
        console.warn('AppConfig配置文件不存在');
        return false;
      } else {
        throw error('发生其他错误'); // 如果是其他错误，重新抛出
      }
    }
  }

  private static async adapterInfoToDict(info: string[]): Promise<object> {
    return {
      host: info[0],
      port: Number(info[1]),
      user: info[2],
      password: info[3],
    };
  }
}
