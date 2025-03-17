export class NmeaParser {
  public static calculateChecksum(nmeaSentence: string): boolean {
    let checksum = 0;
    // 遍历从'$'后的第一个字符到'*'前的所有字符
    for (let i = 1; i < nmeaSentence.indexOf('*'); i++) {
      checksum ^= nmeaSentence.charCodeAt(i);
    }
    // 返回两位的十六进制表示
    return (
      checksum.toString(16).toUpperCase().padStart(2, '0') ===
      nmeaSentence.substring(nmeaSentence.length - 2)
    );
  }
  private static parseLatitudeLongitude(dm: string, hemisphere: string): string {
    const dotIndex = dm.indexOf('.');
    // 解析字符串，提取度的部分并转换为整数
    const degrees = parseInt(dm.substring(0, dotIndex - 2), 10);
    // 解析字符串，提取分钟的部分并转换为双精度浮点数
    const minutes = parseFloat(dm.substring(dotIndex - 2));
    // 将度和分钟转换为十进制度，因为1度=60分钟，所以用分钟除以60
    let result = degrees + minutes / 60;
    // 根据半球信息调整符号
    if (hemisphere === "S" || hemisphere === "W") {
        result = -result;
    }
    return String(result);
}
  public static splitByNumber(str: string): string[] {
    // 查找第一个数字的起始位置
    let startIndex = str.search(/\d/);
    if (startIndex === -1) {
      console.log('没有找到数字');
      return [str, ''];
    }

    // 从数字开始的地方查找非数字字符的位置作为结束位置
    let endIndex = startIndex;
    while (endIndex < str.length && /\d/.test(str.charAt(endIndex))) {
      endIndex++;
    }

    let leftPart = str.substring(0, endIndex); // 数字前的部分
    let rightPart = str.substring(endIndex).trim(); // 数字后的部分，去掉首尾空白字符

    return [leftPart, rightPart];
  }

  public static parseNmeaSignal(mode: string, metaData: string): object | null {
    // if (!this.calculateChecksum(metaData)) {
    //   return null;
    // }
    //实际用时再测试

    const argsArray: string[] = metaData.split('*');
    const resultArray: string[] = argsArray[0].split(',');
    switch (mode) {
      case 'GNRMC':
        return NmeaParser.GNRMC(resultArray, argsArray[1]);
      case 'GPGGA':
        return NmeaParser.GPGGA(resultArray, argsArray[1]);
      case 'GPGSA':
        return NmeaParser.GPGSA(resultArray, argsArray[1]);
      case 'GPRMC':
        return NmeaParser.GPRMC(resultArray, argsArray[1]);
      case 'GPVTG':
        return NmeaParser.GPVTG(resultArray, argsArray[1]);
      case 'GPGLL':
        return NmeaParser.GPGLL(resultArray, argsArray[1]);
      case 'GPZDA':
        return NmeaParser.GPZDA(resultArray, argsArray[1]);
      default:
        throw new Error('the mode is not supported');
    }
  }

  private static GPGGA(resultArray: string[], checksum: string): object {
    return {
      hostDomain: resultArray[0],
      utcTime: resultArray[1],
      latitude: resultArray[2],
      latitudeHemisphere: resultArray[3],
      longitude: resultArray[4],
      longitudeHemisphere: resultArray[5],
      gpsState: resultArray[6],
      usedSatellitesForPositioningCount: resultArray[7],
      hdopHorizontalPrecisionFactor: resultArray[8],
      altitude: resultArray[9] + resultArray[10],
      geoidHeight: resultArray[11] + resultArray[12],
      differentialTime: resultArray[13],
      diffRefBaseStationDesignator: resultArray[14],
      checksum: checksum,
    };
  }

  private static GPGSA(resultArray: string[], checksum: string): object {
    return {
      hostDomain: resultArray[0],
      mode: resultArray[1],
      targetType: resultArray[2],
      satelliteUseNumber: [
        resultArray[3],
        resultArray[4],
        resultArray[5],
        resultArray[6],
        resultArray[7],
        resultArray[8],
        resultArray[9],
        resultArray[10],
        resultArray[11],
        resultArray[12],
        resultArray[13],
        resultArray[14],
      ],
      pdop: resultArray[15],
      hdop: resultArray[16],
      vdop: resultArray[17],
      checksum: checksum,
    };
  }

  private static GPRMC(resultArray: string[], checksum: string): object {
    return {
      hostDomain: resultArray[0],
      utcTime: resultArray[1],
      positionStatus: resultArray[2],
      latitude: resultArray[3],
      latitudeHemisphere: resultArray[4],
      longitude: resultArray[5],
      longitudeHemisphere: resultArray[6],
      speed: resultArray[7],
      course: resultArray[8],
      UTCDate: resultArray[9],
      magneticDeclination: resultArray[10],
      magneticDeclinationDirection: resultArray[11],
      mode: resultArray[12],
      checksum: checksum,
    };
  }

  private static GPVTG(resultArray: string[], checksum: string): object {
    return {
      hostDomain: resultArray[0],
      trueNorthBasedGroundCourse: resultArray[1] + resultArray[2],
      magneticNorthBasedGroundCourse: resultArray[3] + resultArray[4],
      groundSpeedKnots: resultArray[5] + resultArray[6],
      groundSpeedKmph: resultArray[7] + resultArray[8],
      mode: resultArray[9],
      checksum: checksum,
    };
  }

  private static GPGLL(resultArray: string[], checksum: string): object {
    return {
      hostDomain: resultArray[0],
      latitude: resultArray[1],
      latitudeHemisphere: resultArray[2],
      longitude: resultArray[3],
      longitudeHemisphere: resultArray[4],
      utcTime: resultArray[5],
      positionStatus: resultArray[6],
      mode: resultArray[7],
      checksum: checksum,
    };
  }

  private static GPZDA(resultArray: string[], checksum: string): object {
    return {
      hostDomain: resultArray[0],
      utcTime: resultArray[1],
      day: resultArray[2],
      month: resultArray[3],
      year: resultArray[4],
      localTimeZoneHours: resultArray[5],
      localTimeZoneMinutes: resultArray[6],
      checksum: checksum,
    };
  }

  private static GNRMC(resultArray: string[], checksum: string) {
    const result = {
      hostDomain: resultArray[0],
      utcTime: resultArray[1],
      positionStatus: resultArray[2],
      latitude: resultArray[3],
      latitudeHemisphere: resultArray[4],
      longitude: resultArray[5],
      longitudeHemisphere: resultArray[6],
      speed: resultArray[7],
      course: resultArray[8],
      utcData: resultArray[9],
      checksum: checksum,
    }
    result.latitude=this.parseLatitudeLongitude(result.latitude,result.latitudeHemisphere)
    result.longitude=this.parseLatitudeLongitude(result.longitude,result.longitudeHemisphere)
    return result
  }
}
