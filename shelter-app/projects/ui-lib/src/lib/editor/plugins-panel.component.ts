import {Component, EventEmitter, Inject, Input, OnInit, Optional} from '@angular/core';
import {ComponentsPluginService, PluginDescription} from '../shared';
import {DIALOG_DATA, DialogRef} from '../dialog-service';

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
  offset;

  constructor(private componentsPlugin: ComponentsPluginService,
              @Optional() @Inject(DIALOG_DATA) protected dialogData: any,
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

  onDragDialog(event: MouseEvent): void {
    if (this.dialogRef && this.offset) {
      this.dialogRef.updatePosition({top: event.clientY - this.offset.top + 'px', left: event.clientX - this.offset.left + 'px'});
      // console.log('onDrag', event);
    }
    event.preventDefault();
  }
  startDrag(event: MouseEvent): void {
    if (this.dialogRef) {
      const rect = this.dialogRef._overlayRef.overlayElement.getBoundingClientRect();
      this.offset = {top: event.clientY - rect.top, left: event.clientX - rect.left};
    }
  }
  endDrag(): void {
    this.offset = null;
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
