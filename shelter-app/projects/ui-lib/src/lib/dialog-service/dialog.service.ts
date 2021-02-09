import {Injectable, Type} from '@angular/core';
import {Dialog, DialogRef} from '@angular/cdk-experimental/dialog';
import {ActionType, ComponentsPluginService, ExtendedData} from '../shared';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private readonly simpleDialogComponent: Type<any>;

  constructor(private dialog: Dialog,
              private componentsPlugin: ComponentsPluginService) {
    const plugin = this.componentsPlugin.getPlugin('simple-dialog');
    this.simpleDialogComponent = plugin.component;
  }

  /* e.g.
  const extData = new ExtendedData();
  extData.action = 'save_cancel';
  extData.caption = 'Hello World!';
  extData.icon = 'gm-warning';
  extData.iconColor = 'warn-color';
  extData.swagger = {
    required: ['login', 'password'],
    orderControls: ['login', 'password'],
    properties: {
      login: {
        type: 'string', controlType: 'input',
        ui: swaggerUI([{lang: 'en', title: 'Login'}, {lang: 'uk', title: 'Логін'}])
      },
      password: {
        type: 'string', controlType: 'input',
        ui: swaggerUI([{lang: 'en', title: 'Password'}, {lang: 'uk', title: 'Пароль'}]),
        constrictions: {format: 'password'}
      }
    }
  };
  extData.data = {login: 'admin', password: '******'};
   */
  openExtDialog(extData: ExtendedData, modal?: boolean): DialogRef<any> {
    return this.dialog.openFromComponent(this.simpleDialogComponent, {data: extData, disableClose: modal || false});
  }
  infoExtDialog(extData: ExtendedData, modal?: boolean): DialogRef<any> {
    extData.iconColor = 'info-color';
    extData.icon = 'gm-info_outline';
    return this.openExtDialog(extData, modal);
  }
  warnExtDialog(extData: ExtendedData, modal?: boolean): DialogRef<any> {
    extData.iconColor = 'warn-color';
    extData.icon = 'gm-warning';
    return this.openExtDialog(extData, modal);
  }
  errorExtDialog(extData: ExtendedData, modal?: boolean): DialogRef<any> {
    extData.iconColor = 'error-color';
    extData.icon = 'gm-error';
    return this.openExtDialog(extData, modal);
  }
  infoMsgDialog(msg: string, modal?: boolean, action?: ActionType): DialogRef<any> {
    const extData: ExtendedData = {data: msg, action};
    return this.infoExtDialog(extData, modal);
  }
  warnMsgDialog(msg: string, modal?: boolean, action?: ActionType): DialogRef<any> {
    const extData: ExtendedData = {data: msg, action};
    return this.warnExtDialog(extData, modal);
  }
  errorMsgDialog(msg: string, modal?: boolean, action?: ActionType): DialogRef<any> {
    const extData: ExtendedData = {data: msg, action};
    return this.errorExtDialog(extData, modal);
  }
}
