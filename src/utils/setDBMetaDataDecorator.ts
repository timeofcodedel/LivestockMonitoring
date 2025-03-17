import { defineMetadata,hasMetadata } from 'reflect-metadata/no-conflict';

import { InitializerDatabase } from './InitializerDB';


export function setDBMateDataDecorator(): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const dbMetaData = InitializerDatabase.readConfig();
    if (dbMetaData) {
      defineMetadata('custom:DBConfig', dbMetaData, target, propertyKey);
    }
  };
}
