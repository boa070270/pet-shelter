import {ActionType, ExtendedData} from "./dialog-api";
import {DialogConfig, DialogRef} from "../dialog-service";
import {ComponentType} from "@angular/cdk/overlay";
import {TemplateRef} from "@angular/core";

export interface IDialogService {
  openExtDialog(extData: ExtendedData, modal?: boolean): DialogRef<any>;

  infoExtDialog(extData: ExtendedData, modal?: boolean): DialogRef<any>;

  warnExtDialog(extData: ExtendedData, modal?: boolean): DialogRef<any>;

  errorExtDialog(extData: ExtendedData, modal?: boolean): DialogRef<any>;

  infoMsgDialog(msg: string, modal?: boolean, action?: ActionType): DialogRef<any>;

  warnMsgDialog(msg: string, modal?: boolean, action?: ActionType): DialogRef<any>;

  errorMsgDialog(msg: string, modal?: boolean, action?: ActionType): DialogRef<any>;

  snakeInfo(msg: string): void;

  snakeWarn(msg: string): void;

  snakeError(msg: string): void;

  /** Gets an open dialog by id. */
  getById(id: string): DialogRef<any> | undefined;

  /** Closes all open dialogs. */
  closeAll(): void;

  sideLeft<T>(compOrTemplate: ComponentType<T> | TemplateRef<T>, config?: DialogConfig): DialogRef<any>;

  open<T>(compOrTemplate: ComponentType<T> | TemplateRef<T>, config?: DialogConfig): DialogRef<any>;
}
