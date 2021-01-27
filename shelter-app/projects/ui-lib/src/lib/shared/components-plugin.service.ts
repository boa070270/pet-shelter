import {Injectable, Type} from '@angular/core';
import {SwaggerObject} from './swagger-object';

export interface ComponentPlugin {
  component: Type<any>;
  schema: SwaggerObject;
}
@Injectable({
  providedIn: 'root'
})
export class ComponentsPluginService {
  private plugins: {[key: string]: ComponentPlugin};

  constructor() { }

  addPlugin(selectorName: string, plugin: ComponentPlugin): void {
    this.plugins[selectorName] = plugin;
  }

  getPlugin(selectorName: string): ComponentPlugin {
    return this.plugins[selectorName];
  }
}
