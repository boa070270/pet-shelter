import {Injectable, Type} from '@angular/core';
import {SwaggerObject} from './swagger-object';
import {TitleType} from './language';

export interface PluginDescription {
  selectorName?: string; // this field is set by system
  icon?: string; // to show on plugin panel
  caption?: string | TitleType[]; // to show on plugin panel
  description?: string | TitleType[]; // to show on plugin panel
  tag?: string; // if this is present this tag would be published by ui-element module
  attr?: {[key: string]: string}; // the default attributes that will be added to on drag preview and in editor
  isPhrasing?: boolean; // true - this tag can be placed in <p>, <pre>, <h1-n> tags
}
export interface ComponentPlugin {
  component: Type<any>;
  schema: SwaggerObject; // describes form that will displayed in editor to collect need parameters
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
