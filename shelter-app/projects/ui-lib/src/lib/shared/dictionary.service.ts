import {Injectable} from '@angular/core';
import {I18NType} from './language';

/**
 * This service provides all texts that are used by other modules
 */
@Injectable({
  providedIn: 'root'
})
export class DictionaryService {
  constructor() { }
  private libDictionary: {[key: string]: I18NType} = {};
  private appDictionary: {[key: string]: I18NType} = {};
  private customDic: {[key: string]: I18NType} = {};

  setLibDictionary(key: string, value: I18NType): void {
    this.libDictionary[key] = value;
  }
  getLibDictionary(key: string, def?: I18NType): I18NType {
    return this.libDictionary[key] || def || {};
  }
  setAppDictionary(key: string, value: I18NType): void {
    this.appDictionary[key] = value;
  }
  getAppDictionary(key, def?: I18NType): I18NType {
    return this.appDictionary[key] || def || {};
  }
  setCustomDictionary(key: string, value: I18NType): void {
    this.customDic[key] = value;
  }
  getCustomDictionary(key: string, def?: I18NType): I18NType {
    return this.customDic[key] || def || {};
  }
}
