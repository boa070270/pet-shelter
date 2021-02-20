import {Component, EventEmitter, forwardRef, OnInit, Output} from '@angular/core';
import {BaseComponent} from './base.component';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {DialogService} from '../dialog-service';
import {DictionaryService, I18NType} from '../shared';
import {SystemLang} from '../i18n';
import {Directionality} from '@angular/cdk/bidi';

const I18N: I18NType = {
  welcomeDropFile: [
    {lang: 'en', title: 'Drag one or more files to this Drop Zone ...'},
    {lang: 'en', title: 'Перетягніть один або кілька файлів до цієї зони ...'}
  ],
  dlgCaption: [
    {lang: 'en', title: 'Select files'},
    {lang: 'en', title: 'Виберіть файл'}
  ],
};
@Component({
  selector: 'lib-upload-files',
  template: `<div class="upload-files" (drop)="dropFiles($event)" (dragover)="dragOverHandler($event)">
    <span>{{i18n.welcomeDropFile}}</span><br>
    <div *ngFor="let file of files; let i = index" class="upload-files-container">
      <button (click)="delete(i)" class="gm-delete"></button><span>{{file.name}}</span><br>
    </div>
    <label>
        <input type="file" (change)="onSelectFile($event)" multiple [title]="i18n.dlgCaption">
    </label>
  </div>`,
  styleUrls: ['./upload-files.component.scss'],
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UploadFilesComponent), multi: true}]
})
export class UploadFilesComponent extends BaseComponent implements OnInit, ControlValueAccessor {
  @Output()
  selected: EventEmitter<File[]> = new EventEmitter<File[]>();
  files: File[] = [];
  constructor(public systemLang: SystemLang, protected directionality: Directionality,
              private dialogService: DialogService, dictionary: DictionaryService) {
    super(systemLang, directionality, Object.assign({}, I18N, (dictionary.getDictionary('COMPONENTS') || {}).fileUpload));
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
  onChangeLang(): void {
    super.onChangeLang();
  }
  writeValue(obj: any): void {
    super.writeValue(obj);
  }
  registerOnChange(fn: any): void {
    super.registerOnChange(fn);
  }
  registerOnTouched(fn: any): void {
    super.registerOnTouched(fn);
  }
  setDisabledState(isDisabled: boolean): void {
    super.setDisabledState(isDisabled);
  }

  protected emitChange(value: any): void {
    super.emitChange(value);
    this.selected.emit(value);
  }

  dragOverHandler(ev: DragEvent): void {
    ev.preventDefault();
  }
  dropFiles(ev: DragEvent): void {
    if (!this.disabled) {
      ev.preventDefault();
      if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < ev.dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          if (ev.dataTransfer.items[i].kind === 'file') {
            const file = ev.dataTransfer.items[i].getAsFile();
            console.log('... file[' + i + '].name = ' + file.name);
            this.files.push(file);
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        for (let i = 0; i < ev.dataTransfer.files.length; i++) {
          console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
          this.files.push(ev.dataTransfer.files[i]);
        }
      }
      // Pass event to removeDragData for cleanup
      this.removeDragData(ev);
      this.emitChange(this.files);
    }
  }
  removeDragData(ev: DragEvent): void {
    console.log('Removing drag data');

    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to remove the drag data
      ev.dataTransfer.items.clear();
    } else {
      // Use DataTransfer interface to remove the drag data
      ev.dataTransfer.clearData();
    }
  }

  delete(i: number): void {
    this.files.splice(i, 1);
  }

  onSelectFile(event: Event): void {
    const files: FileList = (event.target as HTMLInputElement).files;
    for (let i = 0; i < files.length; ++i) {
      this.files.push(files.item(i));
    }
    this.emitChange(this.files);
  }
}
