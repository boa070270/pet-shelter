import {AbstractDataSource, CustomDSService, DsType} from 'ui-lib';

export class CustomDSServiceMock implements CustomDSService{
  knownDS(): Array<DsType> {
    console.log('callstack ' + new Error().stack);
    return undefined;
  }

  obtainDS<T extends AbstractDataSource<any>>(name: string): T {
    console.log('callstack ' + new Error().stack);
    return undefined;
  }
}
