import {
  AfterViewInit,
  Component,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  Inject,
  Input,
  NgZone, OnDestroy,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {ComponentsPluginService, PluginDescription, SYSTEM_LANG_TOKEN, SystemLang, deepCloneNode} from '../shared';
import {DIALOG_DATA, DialogRef} from '../dialog-service';
import {CdkDropList} from '@angular/cdk/drag-drop';
import {DOCUMENT} from '@angular/common';
import {Subscription} from 'rxjs';

@Component({
  selector: 'lib-plugins-panel',
  templateUrl: './plugins-panel.component.html',
  styleUrls: ['./plugins-panel.component.scss']
})
export class PluginsPanelComponent implements OnInit, AfterViewInit, OnDestroy {
  showIcons: boolean;
  list: PluginDescription[];
  @Input()
  emitter: EventEmitter<string>;
  @ViewChild('titleBar', {static: true}) titleBar: ElementRef<HTMLDivElement>;
  @ViewChild('tmpl', {static: true}) tmpl: TemplateRef<any>;
  @ViewChild('vc', {read: ViewContainerRef, static: true}) viewContainerRef: ViewContainerRef;
  cdkDropListDest: CdkDropList;
  private _previewRef: EmbeddedViewRef<any>;
  private subs: Subscription;

  constructor(private element: ElementRef<HTMLElement>,
              @Inject(SYSTEM_LANG_TOKEN) private systemLang: SystemLang,
              private componentsPlugin: ComponentsPluginService,
              @Optional() @Inject(DIALOG_DATA) protected dialogData: any,
              @Optional() public dialogRef: DialogRef<any>,
              @Inject(DOCUMENT) private _document: Document,
              private _ngZone: NgZone) {
    this.list = componentsPlugin.listPlugins();
    this.subs = this.systemLang.onChange().subscribe(() => this.changeLang());
    this.changeLang();
    if (dialogData && dialogData.emitter) {
      this.emitter = dialogData.emitter;
      this.cdkDropListDest = dialogData.fCdkDropList();
    }
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  close(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  select(selectorName: string): void {
    if (this.emitter) {
      this.emitter.emit(selectorName);
    }
  }

  drag(event: DragEvent, selectorName: string): void {
    // console.log('PluginsPanelComponent.drag', event.dataTransfer);
  }

  dragStart(e: DragEvent, selectorName: string): void {
    // const plugin = this.componentsPlugin.getPlugin(selectorName);
    e.dataTransfer.setData('plugin/json', selectorName);
    console.log('PluginsPanelComponent.dragStart', e.dataTransfer);
    const preview = this._createPreviewElement(selectorName, e);
    // e.dataTransfer.setDragImage(preview, 0, 0);
    // this._ngZone.runOutsideAngular(() => {
    //   setTimeout(() => preview.remove());
    // });
  }
  dragEnd(event: DragEvent, selectorName: string): void {
    event.dataTransfer.setData('text/plain', selectorName);
    console.log('PluginsPanelComponent.dragEnd', event.dataTransfer);
  }
  private _createPreviewElement(selectorName: string, e: DragEvent): HTMLElement {
    const previewTemplate = this.tmpl; // previewConfig ? previewConfig.template : null;

    const viewRef = this.viewContainerRef.createEmbeddedView(previewTemplate, {$implicit: {selectorName}});
    viewRef.detectChanges();
    const result = deepCloneNode(getRootNode(viewRef, this._document)); // getRootNode(viewRef, this._document);
    this.createDragImage(result, e);
    this._previewRef = viewRef;
    removeNodes(viewRef);
    return result as HTMLElement;
  }
  createDragImage(node: Node, e: DragEvent): void {
    const img = node.cloneNode(true) as HTMLElement;
    img.style.top = Math.max(0, e.pageY - e.offsetY) + 'px';
    img.style.left = Math.max(0, e.pageX - e.offsetX) + 'px';
    img.style.position = 'absolute';
    img.style.pointerEvents = 'none';
    img.style.zIndex = '1000';
    this._document.body.appendChild(img);

    this._ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        img.remove();
      });
    });

    e.dataTransfer.setDragImage(img, 0, 0);
  }

  private changeLang(): void {
    this.list.forEach(v => {
      if (v.caption && typeof v.caption !== 'string') {
        v.caption = this.systemLang.getTitle(v.caption);
      }
      if (v.description && typeof v.description !== 'string') {
        v.description = this.systemLang.getTitle(v.description);
      }
    });
  }
}
function removeNodes(viewRef: EmbeddedViewRef<any>): void {
  for (const n of viewRef.rootNodes) { // TODD what is node here
    n.remove();
  }
}
function getRootNode(viewRef: EmbeddedViewRef<any>, _document: Document): HTMLElement {
  const rootNodes: Node[] = viewRef.rootNodes;

  if (rootNodes.length === 1 && rootNodes[0].nodeType === _document.ELEMENT_NODE) {
    return rootNodes[0] as HTMLElement;
  }

  const wrapper = _document.createElement('div');
  rootNodes.forEach(node => wrapper.appendChild(node));
  return wrapper;
}
