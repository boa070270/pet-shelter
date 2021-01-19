import {Component, ElementRef, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {
  CommandEnum,
  EditTableConfiguration,
  makeColumnInfo,
  TableEvent,
  OkDialogComponent,
  DynamicFormDialogComponent, EditTableComponent
} from 'ui-lib';
import {BasicService} from '../basic.service';
import {MatDialog} from '@angular/material/dialog';
// from x-payload
import {BannerType, FileType, PageType, PetType} from '../common/types';
import {HttpEventType, HttpResponse} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import {FormsConfigurationService} from './forms-configuration.service';

@Component({
  selector: 'app-files-table',
  templateUrl: './files-table.component.html',
  styleUrls: ['./files-table.component.sass'] // TODO change to ...
})
export class FilesTableComponent implements OnInit {
  tableConfiguration: EditTableConfiguration<FileType>;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild('fileListContainer') fileListContainer: ElementRef<HTMLDivElement>;
  @ViewChild('viewDetails', {read: TemplateRef}) viewDetails: TemplateRef<any>;
  @ViewChild(EditTableComponent) editTableComponent: EditTableComponent<FileType>;
  @Input() fullForm = true;
  @Input() selectedRows: FileType[] = [];
  comment: string;

  constructor(public dialog: MatDialog, private service: BasicService, private formsConfiguration: FormsConfigurationService) {
  }

  ngOnInit(): void {
    this.tableConfiguration = {
      readonly: false,
      dataSource: this.service.getFilesDataSource(),
      getId: (r) => '' + r.id,
      getColumnValue: (element, column) => {
        return element[column];
      },
      getColumnMedia: (element, column) => {
        if (column === 'file') {
          return {mediaType: element.mimeType, mediaURI: `/api/v1/assets/${element.id}`};
        }
      },
      allColumns: [
        makeColumnInfo('id', 'Id', true, false),
        makeColumnInfo('originalName', 'OriginalName', true, false),
        makeColumnInfo('encoding', 'Encoding', this.fullForm, false),
        makeColumnInfo('mimeType', 'MimeType', this.fullForm, false),
        makeColumnInfo('size', 'Size', this.fullForm, false),
        makeColumnInfo('created', 'Created', this.fullForm, false),
        makeColumnInfo('numberOfReferences', 'NumberOfReferences', this.fullForm, false),
        makeColumnInfo('file', 'Show', true, true),
      ],
      extendCommands: [
        {iconName: 'description', menuName: 'Details', commandName: 'viewDetails'},
        {iconName: 'art_track', menuName: 'Make banner', commandName: 'makeBanner'},
        {iconName: 'pages', menuName: 'Make Page', commandName: 'makePage'},
        {iconName: 'pets', menuName: 'Make Pet', commandName: 'makePet'},
      ],
      selectedRows: this.selectedRows
    };
  }

  onDragOverFile(event: DragEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }

  onDropFile(event: DragEvent): void {
    event.preventDefault();
    this.uploadFile(event.dataTransfer.files);
  }
  getSelectedRows(): FileType[] {
    return this.editTableComponent.getSelectedRows();
  }

  private uploadFile(files: FileList, comment?: string): void {
    if (files.length === 0) {
      console.log('No file selected!');
      return;
    }
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.service.upload(file, comment).subscribe(
        event => {
          if (event.type === HttpEventType.UploadProgress) {
            const percentDone = Math.round(100 * event.loaded / event.total);
            console.log(`File is ${percentDone}% loaded.`);
          } else if (event instanceof HttpResponse) {
            console.log('File is completely loaded!');
          }
        },
        (err) => {
          console.log('Upload Error:', err);
        }, () => {
          console.log('Upload done');
        }
      );
    }
  }

  selectFile(event): void {
    const files: FileList = event.target.files;
    this.fileListContainer.nativeElement.innerHTML = ''; // clear on every change
    if (this.fileListContainer) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < files.length; i++){
        const file = files[i];
        this.fileListContainer.nativeElement.innerHTML += `<span><b>Name:</b> ${file.name}, <b>Size:</b> ${file.size}, <b>Type:</b> ${file.type}</span><br>`;
      }
    }
  }

  close(dialogRef: any, data: any): void {
    console.log(dialogRef);
    console.log(data);
    if (dialogRef) {
      dialogRef.close();
    }
  }
  upload(dialogRef: any, files: FileList, comment: string): void {
    this.uploadFile(files, comment);
    if (dialogRef) {
      dialogRef.close();
    }
  }
  handleTableEvent(event: TableEvent): void {
    if (event.command === CommandEnum.custom) {
      switch (event.customCommand) {
        case 'viewDetails':
          this.hdlViewDetails(event.rows);
          break;
        case 'makeBanner':
          this.hdlMakeBanner(event.rows);
          break;
        case 'makePage':
          this.hdlMakePage(event.rows);
          break;
        case 'makePet':
          this.hdlMakePet(event.rows);
          break;
      }
    }
  }
  private hdlViewDetails(rows: any[]): void {
    if (rows.length !== 1) {
      this.dialog.open(OkDialogComponent, {data: {msg: 'Please select one file'}});
    } else {
      const fileType = (rows[0] as FileType);
      this.service.getFile(fileType.id).subscribe(next => {
        this.dialog.open(this.viewDetails, {data: next});
      });
    }
  }

  private hdlMakeBanner(rows: any[]): void {
    if (rows.length !== 1) {
      this.dialog.open(OkDialogComponent, {data: {msg: 'Please select one file you want to make as banner'}});
    } else {
      const configuration = this.formsConfiguration.bannerFormConfiguration();
      configuration.options.readonly = false;
      const bannerDialog = this.dialog.open(DynamicFormDialogComponent, {
          data: {
            configuration,
            data: this.formsConfiguration.bannerNewItem()
          }
        });
      if (bannerDialog) {
        const subs = bannerDialog.afterClosed().subscribe(data => {
          if (data) {
            const fileType = (rows[0] as FileType);
            const banner: BannerType = Object.assign({}, data);
            banner.ref.refId = fileType.id;
            this.service.addBanner(banner).pipe(tap(next => {
              if (typeof next === 'string') {
                this.dialog.open(OkDialogComponent, {data: {msg:  `There was successfully added banners`}});
                subs.unsubscribe();
              }
            }));
          }
        });
      }
    }
  }
  private hdlMakePage(rows: any[]): void {
    if (rows.length === 0) {
      this.dialog.open(OkDialogComponent, {data: {msg: 'Please select files you want to make as page'}});
    } else {
      const configuration = this.formsConfiguration.pageFormConfiguration();
      configuration.options.readonly = false;
      const pageDialog = this.dialog.open(DynamicFormDialogComponent, {
        data: {
          configuration,
          data: this.formsConfiguration.pageNewItem()
        }
      });
      if (pageDialog) {
        const subs = pageDialog.afterClosed().subscribe(data => {
          if (data) {
            const promises = [];
            let successful = 0;
            for (const file of rows) {
              const fileType = (file as FileType);
              const page: PageType = Object.assign({}, data);
              page.ref.push({refId: fileType.id});
              promises.push(this.service.addPage(page).pipe(tap(next => {
                if (typeof next === 'string') {
                  successful++;
                }
              })).toPromise());
            }
            Promise.all(promises).then(() => {
              this.dialog.open(OkDialogComponent, {data: {msg:  `The page was successfully made with ${successful} assets`}});
              subs.unsubscribe();
            });
          }
        });
      }
    }
  }
  private hdlMakePet(rows: any[]): void {
    if (rows.length === 0) {
      this.dialog.open(OkDialogComponent, {data: {msg: 'Please select files you want to make as pet'}});
    } else {
      const configuration = this.formsConfiguration.petFormConfiguration();
      configuration.options.readonly = false;
      const petDialog = this.dialog.open(DynamicFormDialogComponent, {
        data: {
          configuration,
          data: this.formsConfiguration.petNewItem()
        }
      });
      if (petDialog) {
        const subs = petDialog.afterClosed().subscribe(data => {
          if (data) {
            const promises = [];
            let successful = 0;
            for (const file of rows) {
              const fileType = (file as FileType);
              const pet: PetType = Object.assign({}, data);
              pet.ref.push({refId: fileType.id});
              promises.push(this.service.addPet(pet).pipe(tap(next => {
                if (typeof next === 'string') {
                  successful++;
                }
              })).toPromise());
            }
            Promise.all(promises).then(() => {
              this.dialog.open(OkDialogComponent, {data: {msg:  `The pet was successfully made with ${successful} assets`}});
              subs.unsubscribe();
            });
          }
        });
      }
    }
  }
}
