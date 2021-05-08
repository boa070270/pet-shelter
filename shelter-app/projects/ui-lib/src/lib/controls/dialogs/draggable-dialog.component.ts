import {Component, EventEmitter, Inject, Input, OnInit, Optional, Output} from '@angular/core';
import {DIALOG_DATA, DialogRef} from '../../dialog-service';
import {SwaggerObject} from "../../shared";

@Component({
  selector: 'lib-draggable-dialog',
  templateUrl: './draggable-dialog.component.html',
  styleUrls: ['./draggable-dialog.component.scss']
})
export class DraggableDialogComponent implements OnInit {
  showIcons: boolean;
  swagger: SwaggerObject;
  data: any;
  caption: string;
  btnOk: string;
  btnCancel: string;
  @Output()
  emitter: EventEmitter<string>;
  @Input()
  title: string;
  @Input()
  actions: Array<{icon: string, tooltip: string, command: string}> = [];
  offset;

  constructor(@Optional() @Inject(DIALOG_DATA) protected dialogData: any,
              @Optional() public dialogRef: DialogRef<any>) {
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

  onDragDialog(event: MouseEvent): void {
    if (this.dialogRef && this.offset) {
      this.dialogRef.updatePosition({top: event.clientY - this.offset.top + 'px', left: event.clientX - this.offset.left + 'px'});
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
  customAction(cmd: string): void {
    this.emitter.next(cmd);
  }
}
