import {EventEmitter, Injectable, OnDestroy, Output} from '@angular/core';
import {SwaggerSchema} from './swagger-object';
import {BrowserStorageService} from '../shared';

const FORM_KEYS = 'ui-lib-swagger-form-keys';
const KEY_PREFIX = 'ui-lib-swagger-form-key-';
@Injectable({
  providedIn: 'root'
})
export class SwaggerFormService implements OnDestroy {
  private formCollection: {[key: string]: {swagger: SwaggerSchema, modified: boolean}} = {};
  @Output() changeEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(private storageService: BrowserStorageService) {
    this.loadCollection();
  }

  ngOnDestroy(): void {
    this.saveModified();
    this.changeEmitter.complete();
  }
  getSchema(key: string): SwaggerSchema {
    if (key) {
      const s = this.formCollection[key];
      if (s) {
        return s.swagger;
      }
    }
  }
  addSchemaIfNotExists(key: string, swagger: SwaggerSchema): SwaggerSchema {
    if (key && swagger) {
      if (!this.formCollection[key]) {
        this.formCollection[key] = {swagger, modified: true};
      }
      return this.formCollection[key].swagger;
    }
  }
  updateSchema(key: string, swagger: SwaggerSchema): void {
    if (key && swagger) {
      this.formCollection[key] = {swagger, modified: true};
    }
  }
  deleteSchema(key: string): void {
    if (key) {
      this.storageService.remove(KEY_PREFIX + key);
      delete this.formCollection[key];
    }
  }
  private loadCollection(): void {
    const s = this.storageService.get(FORM_KEYS) || '';
    const keys = s.split(',');
    for (const key of keys) {
      const form = this.storageService.getObj(key);
      if (form) {
        this.formCollection[key] = form;
      }
    }
  }
  private saveModified(): void {
    const keys = Object.keys(this.formCollection);
    if (keys.length > 0) {
      this.storageService.set(FORM_KEYS, keys.join(','));
    }
    for (const key of keys) {
      const swagger = this.storageService[key].swagger;
      if (swagger) {
        this.storageService.setObj(KEY_PREFIX + key, this.storageService[key].swagger);
      }
    }
  }

}
