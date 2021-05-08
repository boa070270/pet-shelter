import {Component, ElementRef, EventEmitter, Inject, Input, OnInit, Optional, ViewChild} from '@angular/core';
import {ComponentsPluginService, PluginDescription} from '../shared';
import {DIALOG_DATA, DialogRef} from '../dialog-service';
import {DragDrop, DragRef} from '@angular/cdk/drag-drop';

@Component({
  selector: 'lib-plugins-panel',
  templateUrl: './plugins-panel.component.html',
  styleUrls: ['./plugins-panel.component.scss']
})
export class PluginsPanelComponent implements OnInit {
  showIcons: boolean;
  list: PluginDescription[];
  @Input()
  emitter: EventEmitter<string>;

  constructor(private element: ElementRef<HTMLElement>, private componentsPlugin: ComponentsPluginService,
              @Optional() @Inject(DIALOG_DATA) protected dialogData: any, private dragDrop: DragDrop,
              @Optional() public dialogRef: DialogRef<any>) {
    this.list = componentsPlugin.listPlugins();
    if (dialogData && dialogData.emitter) {
      this.emitter = dialogData.emitter;
    }
  }

  ngOnInit(): void {
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
    // event.dataTransfer.setData('text', selectorName);
    console.log('drag', event.dataTransfer);
  }
  dragStart(event: DragEvent, selectorName: string): void {
    event.dataTransfer.setData('text', selectorName);
    console.log('dragStart', event.dataTransfer);
  }
  dragEnd(event: DragEvent, selectorName: string): void {
    event.dataTransfer.setData('text', selectorName);
    console.log('dragEnd', event.dataTransfer);
  }

}
