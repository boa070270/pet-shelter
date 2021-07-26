import {Injectable, Injector, Type} from '@angular/core';
import {SwaggerObject} from './swagger-object';
import {TitleType} from './language';
import {createCustomElement} from '@angular/elements';
import {HtmlElementContent, HtmlRules} from './html-rules';
import {Attributes} from './html-helper';

export interface PluginDescription {
  selectorName?: string; // this field is set by system
  icon?: string; // to show on plugin panel
  caption?: string | TitleType[]; // to show on plugin panel
  description?: string | TitleType[]; // to show on plugin panel
  tag?: string; // if this is present this tag would be published by ui-element module
  attr?: Attributes; // the default attributes that will be added to on drag preview and in editor
  elementContent?: HtmlElementContent[]; // if absent or empty, this element belong Flow content and can have children from Flow content
}
export interface ComponentPlugin {
  component: Type<any>;
  schema?: SwaggerObject; // describes form that will displayed in editor to collect need parameters
  description?: PluginDescription;
}
@Injectable({
  providedIn: 'root'
})
export class ComponentsPluginService {
  private plugins: {[key: string]: ComponentPlugin} = {};

  constructor() { }

  addPlugin(selectorNames: string[], plugin: ComponentPlugin, injector?: Injector): void {
    selectorNames.forEach(selectorName => {
      this.plugins[selectorName] = plugin;
    });

    if (plugin.description && plugin.description.tag && injector) {
      const ce = plugin.description;
      const component = createCustomElement(plugin.component, {injector});
      customElements.define(ce.tag.toLowerCase(), component);
      HtmlRules.elements[ce.tag.toLowerCase()] = ce.elementContent || HtmlRules.defCustomContent;
    }
  }

  getPlugin(selectorName: string): ComponentPlugin {
    return this.plugins[selectorName];
  }
  listPlugins(): Array<PluginDescription> {
    const res: Array<PluginDescription> = [];
    for (const [k, v] of Object.entries(this.plugins)) {
      if (v.description) {
        const d = v.description;
        res.push({
          selectorName: k,
          description: d.description,
          caption: d.caption,
          icon: d.icon,
          attr: d.attr,
          tag: d.tag,
          elementContent: d.elementContent
        });
      }
    }
    return res;
  }
}
