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
}
