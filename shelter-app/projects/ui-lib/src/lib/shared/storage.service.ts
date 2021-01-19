// #docregion
import { Inject, Injectable, InjectionToken } from '@angular/core';

// #docregion storage-token
export const BROWSER_STORAGE = new InjectionToken<Storage>('Browser Storage', {
  providedIn: 'root',
  factory: () => localStorage
});
// #enddocregion storage-token

// #docregion inject-storage-token
@Injectable({
  providedIn: 'root'
})
export class BrowserStorageService {
  constructor(@Inject(BROWSER_STORAGE) public storage: Storage) {}

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
    this.set(key, JSON.stringify(value));
  }
  remove(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }
}
// #enddocregion inject-storage-token
