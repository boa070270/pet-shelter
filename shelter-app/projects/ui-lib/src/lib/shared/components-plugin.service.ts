import {Injectable, Type} from '@angular/core';
import {SwaggerObject} from './swagger-object';
import {TitleType} from './language';

export interface PluginDescription {
  selectorName?: string; // this field is set by system
  icon?: string;
  caption?: string | TitleType[];
  description?: string | TitleType[];
  phrasing?: boolean; // true if this component is inline-block, false for block element
}
export interface ComponentPlugin {
  component: Type<any>;
  schema: SwaggerObject;
  description?: PluginDescription;
}
@Injectable({
  providedIn: 'root'
})
export class ComponentsPluginService {
  private plugins: {[key: string]: ComponentPlugin} = {};

  constructor() { }

  addPlugin(selectorName: string, plugin: ComponentPlugin): void {
    this.plugins[selectorName] = plugin;
  }

  getPlugin(selectorName: string): ComponentPlugin {
    return this.plugins[selectorName];
  }
  listPlugins(): Array<PluginDescription> {
    return Object.keys(this.plugins).map(k => {
      const desc = this.plugins[k].description || {};
      return {
        icon: desc.icon || 'gm-device_unknown',
        caption: desc.caption || k,
        selectorName: k,
        description: desc.description || k
      };
    });
  }
}
