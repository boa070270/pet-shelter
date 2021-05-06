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

  onDragDialogStart(event: DragEvent): void {
    if (this.dialogRef) {
      event.dataTransfer.setDragImage(this.dialogRef._overlayRef.overlayElement, 0, 0);
      console.log('onDrag', event);
    }
    event.preventDefault();
  }
  onDragDialog(event: DragEvent): void {
    if (this.dialogRef) {
      this.dialogRef.updatePosition({top: event.clientY + 'px', left: event.clientX + 'px'});
      console.log('onDrag', event);
    }
    event.preventDefault();
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
