import {SwaggerObject} from './swagger-object';
import {TitleType} from "./language";
import {EventEmitter} from "@angular/core";

export type ActionType = 'ok' | 'ok_cancel' | 'save_cancel' | 'yes_no';
export class TitleBarData {
  title: string;
  predefinedActions?: {
    cancel?: boolean,
    save?: boolean
  };
  customActions?: {
    actions: Array<{icon: string, tooltip: string | TitleType[], command: string }>,
    emitter: EventEmitter<string>
  };
  static create(title: string, predefinedActions?: {cancel?: boolean, save?: boolean},
                customActions?: {actions: Array<{icon: string, tooltip: string | TitleType[], command: string }>,
                  emitter: EventEmitter<string>}): TitleBarData {
    const result = new TitleBarData();
    result.title = title;
    result.predefinedActions = predefinedActions;
    result.predefinedActions.cancel = predefinedActions.cancel !== false;
    result.customActions = customActions;
    return result;
  }
}

export class ExtendedData {
  data: any;
  action?: ActionType;
  swagger?: SwaggerObject;
  readOnly?: boolean;
  icon?: string;
  iconColor?: 'info-color' | 'warn-color' | 'error-color';
  caption?: string;
  titleBar?: TitleBarData;
  static create(data: any, readonly: boolean, swagger?: SwaggerObject, action?: ActionType, caption?: string,
                icon?: string, iconColor?: 'info-color' | 'warn-color' | 'error-color', titleBar?: TitleBarData): ExtendedData {
    const result = new ExtendedData();
    result.data = data;
    result.readOnly = readonly;
    result.swagger = swagger;
    result.action = action;
    result.caption = caption;
    result.icon = icon;
    result.iconColor = iconColor;
    result.titleBar = titleBar;
    return result;
  }
}
