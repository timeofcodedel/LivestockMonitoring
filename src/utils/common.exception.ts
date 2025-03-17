import { HttpException, HttpStatus } from '@nestjs/common';

export class UniqueKeyViolationException extends HttpException {
  constructor(fieldName: string) {
    super(`${fieldName} had been used`, HttpStatus.BAD_REQUEST);
  }
}

export class InvalidNmeaSignalException extends HttpException {
  constructor() {
    super(`nmeaSignal is not a valid NMEA signal`, HttpStatus.BAD_REQUEST);
  }
}

export class UserNotFoundException extends HttpException {
  constructor() {
    super(`无法找到此用户信息,请确认是否注册此用户`, HttpStatus.NOT_FOUND);
    this.name = 'UserNotFoundException';
  }
}