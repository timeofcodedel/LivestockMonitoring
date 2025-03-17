import { extname } from 'path';
import * as path from 'node:path';
import { promises as fsPromises } from 'fs'; // 引入 fs/promises

export async function saveAvatarPicture(
  file: Express.Multer.File,
): Promise<string | undefined> {
  if (file === undefined) return undefined;
  const randomName = Array(32)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  const newFilename = `${randomName}${extname(file.originalname)}`; //整合文件名
  const filePath = path.join('upload/avatars', newFilename); //拼接路径
  try {
    await fsPromises.writeFile(filePath, file.buffer); //fs写入位置
  } catch (err) {
    throw err; // 或者根据需要处理错误
  }

  // 清理 buffer 引用
  // @ts-ignore
  file.buffer = null;
  return filePath;
}

export async function deleteAvatarPicture(avatarPath: string | undefined) {
  if (avatarPath === undefined) return false;
  try {
    await fsPromises.unlink(avatarPath);
    return true;
  } catch (err) {
    return false;
  }
}
