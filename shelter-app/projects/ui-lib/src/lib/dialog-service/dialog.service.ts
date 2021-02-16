import {
  ComponentRef,
  Injectable,
  Injector,
  OnDestroy,
  Optional,
  SkipSelf,
  StaticProvider,
  TemplateRef,
  Type
} from '@angular/core';
import {ActionType, ComponentsPluginService, ExtendedData} from '../shared';
import {ComponentType, Overlay, OverlayConfig, OverlayRef, ScrollStrategy} from '@angular/cdk/overlay';
import {DialogRef} from './dialog-ref';
import {defer, Observable, of as observableOf, Subject} from 'rxjs';
import {startWith} from 'rxjs/operators';
import {DIALOG_CONTAINER, DIALOG_DATA, DIALOG_REF} from './dialog-injectors';
import {Location} from '@angular/common';
import {DialogConfig} from './dialog-config';
import {CdkDialogContainer} from './dialog-container';
import {ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {Directionality} from '@angular/cdk/bidi';
import {PositionStrategy} from '@angular/cdk/overlay/position/position-strategy';

@Injectable({
  providedIn: 'root'
})
export class DialogService implements OnDestroy {
  private readonly simpleDialogComponent: Type<any>;
  private readonly snakeBarComponent: Type<any>;
  // tslint:disable-next-line:variable-name
  _afterAllClosedBase = new Subject<void>();
  // tslint:disable-next-line:variable-name
  _afterOpened: Subject<DialogRef<any>> = new Subject();

  afterAllClosed: Observable<void> = defer(() => this.openDialogs.length ?
    this._getAfterAllClosed() : this._getAfterAllClosed().pipe(startWith(undefined)));
  // tslint:disable-next-line:variable-name
  _openDialogs: DialogRef<any>[] = [];

  constructor(
    // tslint:disable-next-line:variable-name
    private _overlay: Overlay,
    // tslint:disable-next-line:variable-name
    private _injector: Injector,
    // tslint:disable-next-line:variable-name
    @Optional() @SkipSelf() private _parentDialog: DialogService,
    @Optional() location: Location,
    private componentsPlugin: ComponentsPluginService) {

    // Close all of the dialogs when the user goes forwards/backwards in history or when the
    // location hash changes. Note that this usually doesn't include clicking on links (unless
    // the user is using the `HashLocationStrategy`).
    if (!_parentDialog && location) {
      location.subscribe(() => this.closeAll());
    }

    this.simpleDialogComponent = this.componentsPlugin.getPlugin('simple-dialog').component;
    this.snakeBarComponent = this.componentsPlugin.getPlugin('snake-bar').component;
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
    return this.openFromComponent(this.simpleDialogComponent,
      {data: extData, disableClose: modal || false, scrollStrategies: {block: true}});
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
    const extData = ExtendedData.create(msg, true, null, action);
    return this.infoExtDialog(extData, modal);
  }
  warnMsgDialog(msg: string, modal?: boolean, action?: ActionType): DialogRef<any> {
    const extData = ExtendedData.create(msg, true, null, action);
    return this.warnExtDialog(extData, modal);
  }
  errorMsgDialog(msg: string, modal?: boolean, action?: ActionType): DialogRef<any> {
    const extData = ExtendedData.create(msg, true, null, action);
    return this.errorExtDialog(extData, modal);
  }
  openSnakeBar(extData: ExtendedData): void {
    const dlg = this.snakeFromComponent(this.snakeBarComponent, {data: extData, disableClose: false});
    setTimeout(() => dlg.close(), 5000);
  }
  snakeInfo(msg: string): void {
    const extData = ExtendedData.create(msg, true, null, 'ok', '', 'gm-info_outline', 'info-color');
    this.openSnakeBar(extData);
  }
  snakeWarn(msg: string): void {
    const extData = ExtendedData.create(msg, true, null, 'ok', '', 'gm-warning', 'warn-color');
    this.openSnakeBar(extData);
  }
  snakeError(msg: string): void {
    const extData = ExtendedData.create(msg, true, null, 'ok', '', 'gm-error', 'error-color');
    this.openSnakeBar(extData);
  }
  snakeFromComponent<T>(component: ComponentType<T>, config?: DialogConfig): DialogRef<any> {
    const cfg = config || {};
    cfg.position = {bottom: '0'};
    cfg.hasBackdrop = false;
    return this.openFromComponent(component, cfg);
  }
  snakeFromTemplate<T>(template: TemplateRef<T>, config?: DialogConfig): DialogRef<any> {
    const cfg = config || {};
    cfg.position = {bottom: '0'};
    cfg.hasBackdrop = false;
    return this.openFromTemplate(template, cfg);
  }
  /** Stream that emits when all dialogs are closed. */
  _getAfterAllClosed(): Observable<void> {
    return this._parentDialog ? this._parentDialog.afterAllClosed : this._afterAllClosedBase;
  }
  /** Stream that emits when a dialog is opened. */
  get afterOpened(): Subject<DialogRef<any>> {
    return this._parentDialog ? this._parentDialog.afterOpened : this._afterOpened;
  }

  /** Stream that emits when a dialog is opened. */
  get openDialogs(): DialogRef<any>[] {
    return this._parentDialog ? this._parentDialog.openDialogs : this._openDialogs;
  }


  /** Gets an open dialog by id. */
  getById(id: string): DialogRef<any> | undefined {
    return this._openDialogs.find(ref  => ref.id === id);
  }

  /** Closes all open dialogs. */
  closeAll(): void {
    this.openDialogs.forEach(ref => ref.close());
  }

  open<T>(compOrTemplate: ComponentType<T> | TemplateRef<T>, config?: DialogConfig): DialogRef<any> {
    if (compOrTemplate instanceof TemplateRef) {
      return this.openFromTemplate(compOrTemplate, config);
    } else {
      return this.openFromComponent(compOrTemplate, config);
    }
  }
  /** Opens a dialog from a component. */
  openFromComponent<T>(component: ComponentType<T>, config?: DialogConfig): DialogRef<any> {
    config = this._applyConfigDefaults(config);

    const overlayRef = this._createOverlay(config);
    const dialogContainer = this._attachDialogContainer(overlayRef, config);
    const dialogRef = this._attachDialogContentForComponent(component, dialogContainer,
      overlayRef, config);

    this._registerDialogRef(dialogRef);
    dialogContainer._initializeWithAttachedContent();

    return dialogRef;
  }

  /** Opens a dialog from a template. */
  openFromTemplate<T>(template: TemplateRef<T>, config?: DialogConfig): DialogRef<any> {
    config = this._applyConfigDefaults(config);

    const overlayRef = this._createOverlay(config);
    const dialogContainer = this._attachDialogContainer(overlayRef, config);
    const dialogRef = this._attachDialogContentForTemplate(template, dialogContainer,
      overlayRef, config);

    this._registerDialogRef(dialogRef);
    dialogContainer._initializeWithAttachedContent();

    return dialogRef;
  }

  ngOnDestroy(): void {
    // Only close all the dialogs at this level.
    this._openDialogs.forEach(ref => ref.close());
  }

  /**
   * Forwards emitting events for when dialogs are opened and all dialogs are closed.
   */
  private _registerDialogRef(dialogRef: DialogRef<any>): void {
    this.openDialogs.push(dialogRef);

    const dialogOpenSub = dialogRef.afterOpened().subscribe(() => {
      this.afterOpened.next(dialogRef);
      dialogOpenSub.unsubscribe();
    });

    const dialogCloseSub = dialogRef.afterClosed().subscribe(() => {
      const dialogIndex = this._openDialogs.indexOf(dialogRef);

      if (dialogIndex > -1) {
        this._openDialogs.splice(dialogIndex, 1);
      }

      if (!this._openDialogs.length) {
        this._afterAllClosedBase.next();
        dialogCloseSub.unsubscribe();
      }
    });
  }
  protected scrollStrategies(config: DialogConfig): ScrollStrategy {
    if (config.scrollStrategies) {
      if (config.scrollStrategies.block) {
        return this._overlay.scrollStrategies.block();
      } else if (config.scrollStrategies.close) {
        return this._overlay.scrollStrategies.close(config.scrollStrategies.close);
      } else if (config.scrollStrategies.reposition) {
        return this._overlay.scrollStrategies.reposition(config.scrollStrategies.reposition);
      }
    }
    return this._overlay.scrollStrategies.noop();
  }
  protected positionStrategy(config: DialogConfig): PositionStrategy {
    const position = this._overlay.position().global();
    if (config.position) {
      if (config.position.left) {
        position.left(config.position.left);
      } else if (config.position.right) {
        position.right(config.position.right);
      } else {
        position.centerHorizontally();
      }
      if (config.position.top) {
        position.top(config.position.top);
      } else if (config.position.bottom) {
        position.bottom(config.position.bottom);
      } else {
        position.centerHorizontally();
      }
    }
    return position;
  }
  /**
   * Creates an overlay config from a dialog config.
   * @param config The dialog configuration.
   * @returns The overlay configuration.
   */
  protected _createOverlay(config: DialogConfig): OverlayRef {
    const overlayConfig = new OverlayConfig({
      positionStrategy: this.positionStrategy(config),
      scrollStrategy: this.scrollStrategies(config),
      panelClass: config.panelClass,
      hasBackdrop: config.hasBackdrop,
      direction: config.direction,
      minWidth: config.minWidth,
      minHeight: config.minHeight,
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight
    });

    if (config.backdropClass) {
      overlayConfig.backdropClass = config.backdropClass;
    }
    return this._overlay.create(overlayConfig);
  }

  /**
   * Attaches an MatDialogContainer to a dialog's already-created overlay.
   * @param overlay Reference to the dialog's underlying overlay.
   * @param config The dialog configuration.
   * @returns A promise resolving to a ComponentRef for the attached container.
   */
  protected _attachDialogContainer(overlay: OverlayRef, config: DialogConfig): CdkDialogContainer {
    const container = config.containerComponent || CdkDialogContainer;
    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
    const injector = Injector.create({
      parent: userInjector || this._injector,
      providers: [{provide: DialogConfig, useValue: config}]
    });
    const containerPortal = new ComponentPortal(container, config.viewContainerRef, injector);
    const containerRef: ComponentRef<CdkDialogContainer> = overlay.attach(containerPortal);
    containerRef.instance._config = config;

    return containerRef.instance;
  }


  /**
   * Attaches the user-provided component to the already-created MatDialogContainer.
   * @param componentOrTemplateRef The type of component being loaded into the dialog,
   *     or a TemplateRef to instantiate as the content.
   * @param dialogContainer Reference to the wrapping MatDialogContainer.
   * @param overlayRef Reference to the overlay in which the dialog resides.
   * @param config The dialog configuration.
   * @returns A promise resolving to the MatDialogRef that should be returned to the user.
   */
  protected _attachDialogContentForComponent<T>(
    componentOrTemplateRef: ComponentType<T>,
    dialogContainer: CdkDialogContainer,
    overlayRef: OverlayRef,
    config: DialogConfig): DialogRef<any> {

    // Create a reference to the dialog we're creating in order to give the user a handle
    // to modify and close it.
    const dialogRef = this._createDialogRef(overlayRef, dialogContainer, config);
    const injector = this._createInjector<T>(config, dialogRef, dialogContainer);
    const contentRef = dialogContainer.attachComponentPortal(
      new ComponentPortal(componentOrTemplateRef, undefined, injector));
    dialogRef.componentInstance = contentRef.instance;
    return dialogRef;
  }

  /**
   * Attaches the user-provided component to the already-created MatDialogContainer.
   * @param componentOrTemplateRef The type of component being loaded into the dialog,
   *     or a TemplateRef to instantiate as the content.
   * @param dialogContainer Reference to the wrapping MatDialogContainer.
   * @param overlayRef Reference to the overlay in which the dialog resides.
   * @param config The dialog configuration.
   * @returns A promise resolving to the MatDialogRef that should be returned to the user.
   */
  protected _attachDialogContentForTemplate<T>(
    componentOrTemplateRef: TemplateRef<T>,
    dialogContainer: CdkDialogContainer,
    overlayRef: OverlayRef,
    config: DialogConfig): DialogRef<any> {

    // Create a reference to the dialog we're creating in order to give the user a handle
    // to modify and close it.
    const dialogRef = this._createDialogRef(overlayRef, dialogContainer, config);
    dialogContainer.attachTemplatePortal(
      // tslint:disable-next-line:no-non-null-assertion
      new TemplatePortal<T>(componentOrTemplateRef, null!,
        {$implicit: config.data, dialogRef} as any));
    return dialogRef;
  }


  /**
   * Creates a custom injector to be used inside the dialog. This allows a component loaded inside
   * of a dialog to close itself and, optionally, to return a value.
   * @param config Config object that is used to construct the dialog.
   * @param dialogRef Reference to the dialog.
   * @param dialogContainer Dialog container element that wraps all of the contents.
   * @returns The custom injector that can be used inside the dialog.
   */
  private _createInjector<T>(
    config: DialogConfig,
    dialogRef: DialogRef<T>,
    dialogContainer: CdkDialogContainer): Injector {

    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
    const providers: StaticProvider[] = [
      {provide: this._injector.get(DIALOG_REF, DialogRef), useValue: dialogRef},
      {provide: this._injector.get(DIALOG_CONTAINER, CdkDialogContainer), useValue: dialogContainer},
      {provide: DIALOG_DATA, useValue: config.data}
    ];

    if (config.direction &&
      (!userInjector || !userInjector.get<Directionality | null>(Directionality, null))) {
      providers.push({
        provide: Directionality,
        useValue: {value: config.direction, change: observableOf()}
      });
    }

    return Injector.create({parent: userInjector || this._injector, providers});
  }

  /** Creates a new dialog ref. */
  // tslint:disable-next-line:typedef
  private _createDialogRef(overlayRef: OverlayRef,
                           dialogContainer: CdkDialogContainer,
                           config: DialogConfig) {
    const dialogRef = new DialogRef<any>(overlayRef, dialogContainer, config.id);
    dialogRef.disableClose = config.disableClose;
    dialogRef.updateSize(config).updatePosition(config.position);
    return dialogRef;
  }

  /**
   * Expands the provided configuration object to include the default values for properties which
   * are undefined.
   */
  private _applyConfigDefaults(config?: DialogConfig): DialogConfig {
    return {...new DialogConfig(), ...config};
  }
}
