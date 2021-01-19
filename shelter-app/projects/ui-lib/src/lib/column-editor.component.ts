import {Component, Inject} from '@angular/core';
import {ColumnEditInfo, Selector} from './ui-types';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

@Component({
  selector: 'lib-column-editor',
  templateUrl: './column-editor.component.html',
  styleUrls: ['./column-editor.component.scss']
})
export class ColumnEditorComponent {

  displayed: ColumnEditInfo[] = [];
  hidden: ColumnEditInfo[] = [];
  displaySelected: Selector<ColumnEditInfo> = new Selector<ColumnEditInfo>((r) => r.columnId);
  hideSelected: Selector<ColumnEditInfo> = new Selector<ColumnEditInfo>((r) => r.columnId);

  constructor(public dialogRef: MatDialogRef<ColumnEditorComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ColumnEditInfo[]) {
    data.forEach(v => {
      if (v.displayed){
        this.displayed.push(v);
      } else {
        this.hidden.push(v);
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  finish(): void {
    const result = [];
    this.displayed.forEach(v => {
      v.displayed = true;
      result.push(v);
    });
    this.hidden.forEach(v => {
      v.displayed = false;
      result.push(v);
    });
    this.dialogRef.close(result);
  }

  toDisplayed(): void {
    if (this.hideSelected.hasValue()) {
      const hidden = [];
      for (const c of this.hidden) {
        if (this.hideSelected.isSelected(c)) {
          this.displayed.push(c);
        } else {
          hidden.push(c);
        }
      }
      this.hidden = hidden;
      this.hideSelected.clear();
    }
  }

  toHidden(): void {
    if (this.displaySelected.hasValue()) {
      const displayed = [];
      for (const c of this.displayed) {
        if (this.displaySelected.isSelected(c)) {
          this.hidden.push(c);
        } else {
          displayed.push(c);
        }
      }
      this.displayed = displayed;
      this.displaySelected.clear();
    }
  }

  toDisplayedAll(): void {
    if (this.hidden.length > 0) {
      for (const c of this.hidden) {
        this.displayed.push(c);
      }
      this.hidden = [];
      this.hideSelected.clear();
    }
  }

  toHiddenAll(): void {
    if (this.displayed.length > 0) {
      for (const c of this.displayed) {
        this.hidden.push(c);
      }
      this.displayed = [];
      this.displaySelected.clear();
    }
  }

  clear(): void {
    this.displaySelected.clear();
    this.hideSelected.clear();
  }

  up(): void {
    if (this.displaySelected.hasValue()) {
      for (let i = 1; i < this.displayed.length; ++i) {
        const before = this.displayed[i - 1];
        const inPosition = this.displayed[i];
        if (this.displaySelected.isSelected(inPosition) && !this.displaySelected.isSelected(before)) {
          this.displayed[i - 1] = inPosition;
          this.displayed[i] = before;
        }
      }
    }
  }
  down(): void {
    if (this.displaySelected.hasValue()) {
      for (let i = 0; i < this.displayed.length - 1; ++i) {
        const inPosition = this.displayed[i];
        const next = this.displayed[i + 1];
        if (this.displaySelected.isSelected(inPosition) && !this.displaySelected.isSelected(next)) {
          this.displayed[i + 1] = inPosition;
          this.displayed[i] = next;
        }
      }
    }
  }
}
