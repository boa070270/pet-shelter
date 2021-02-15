import {TitleType} from './language';
import {Injectable} from '@angular/core';

/**
 * This service provides all texts that are used by other modules
 */
@Injectable({
  providedIn: 'root'
})
export class DictionaryService {
  constructor() { }
  private dictionary: {[key: string]: any} = {};

  setDictionary(key: string, value: any): void {
    this.dictionary[key] = value;
  }
  getDictionary(key): any {
    return this.dictionary[key];
  }
}
