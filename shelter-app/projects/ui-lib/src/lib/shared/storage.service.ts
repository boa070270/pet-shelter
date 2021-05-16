import {Inject, Injectable} from '@angular/core';
import {LOCAL_STORAGE, StorageService} from './services-api';

@Injectable()
export class BrowserStorageService implements StorageService {
  constructor(@Inject(LOCAL_STORAGE) public storage: Storage) {}

  get(key: string): string {
    return this.storage.getItem(key);
  }
  set(key: string, value: string): void {
    this.storage.setItem(key, value);
  }
  getObj(key: string): any {
    const str = this.get(key);
    if (str) {
      try{
        return JSON.parse(str);
      } catch (e) {
        console.log('BrowserStorageService: parsing error');
      }
    }
    return null;
  }
  setObj(key: string, value: any): void {
    try {
      this.set(key, JSON.stringify(value));
    } catch (e) {
      console.log('BrowserStorageService: stringify error');
    }
  }
  remove(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }
}
// #enddocregion inject-storage-token
