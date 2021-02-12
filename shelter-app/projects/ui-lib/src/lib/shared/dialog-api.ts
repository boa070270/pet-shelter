import {SwaggerObject} from './swagger-object';

export type ActionType = 'ok' | 'save_cancel' | 'yes_no';

export class ExtendedData {
  data: any;
  action?: ActionType;
  swagger?: SwaggerObject;
  readOnly?: boolean;
  icon?: string;
  iconColor?: 'info-color' | 'warn-color' | 'error-color';
  caption?: string;
  static create(data: any, readonly: boolean, swagger?: SwaggerObject, action?: ActionType, caption?: string, icon?: string, iconColor?: 'info-color' | 'warn-color' | 'error-color'): ExtendedData {
    const result = new ExtendedData();
    result.data = data;
    result.readOnly = readonly;
    result.swagger = swagger;
    result.action = action;
    result.caption = caption;
    result.icon = icon;
    result.iconColor = iconColor;
    return result;
  }
}
