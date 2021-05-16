import {Component, OnDestroy, ViewChild} from '@angular/core';
import {
  AbstractComponent,
  AbstractDataSource,
  DialogService,
  DictionaryService,
  ExtendedData,
  SwaggerNative,
  SwaggerObject,
  swaggerUI,
  SystemLang,
  TitleType,
  UploadFilesComponent
} from 'ui-lib';
// from x-payload
import {BannerType, FileType, PageType, PetType} from '../common/types';
import {AddSwaggerBannerType, SwaggerFileType, SwaggerPageType, SwaggerPetType} from '../common/swagger-objects';
import {DataSources} from '../datasources';
import {BasicService} from '../basic.service';
import {HttpEventType, HttpResponse} from '@angular/common/http';
import {RootPageService} from "../../../projects/ui-lib/src/lib/shared";

const i18N = {
  dlg_caption: [{lang: 'en', title: 'Upload {0,1# file,[1..) files?}'}, {lang: 'uk', title: 'Загрузити {0,1# файл,[1..) файлів}?'}],
  dlg_comment: [{lang: 'en', title: 'Comment'}, {lang: 'uk', title: 'Коментарій'}],
  act_pet: [{lang: 'en', title: 'Register pet'}, {lang: 'uk', title: 'Реєструвати улюбленця'}],
  act_banner: [{lang: 'en', title: 'Add banner'}, {lang: 'uk', title: 'Створити банер'}],
  act_page: [{lang: 'en', title: 'Add page'}, {lang: 'uk', title: 'Створити сторінку'}]
};
@Component({
  selector: 'app-files-table',
  template: `<div>
    <lib-upload-files [(ngModel)]="files" (selected)="selectFiles($event)"></lib-upload-files>
      <button class="upload-files" (click)="uploadFiles()">Upload files</button>
    <lib-table [dataSource]="dataSource" [swagger]="swagger" (tableEvent)="tableAction($event)" [customActions]="actions"></lib-table>
  </div>`,
  styleUrls: ['./files-table.component.sass'] // TODO change to ...
})
export class FilesTableComponent extends AbstractComponent implements OnDestroy {
  dataSource: AbstractDataSource<FileType>;
  swagger = SwaggerFileType;
  files: File[];
  @ViewChild(UploadFilesComponent) uploadComponent: UploadFilesComponent;
  actions: Array<{icon: string, tooltip: string | TitleType[], command: string}> = [
    {icon: 'gm-pets', command: 'add-pet', tooltip: i18N.act_pet}, // was this.i18N.act_pet
    {icon: 'gm-image', command: 'add-banner', tooltip: i18N.act_banner}, // was this.i18N.act_banner
    {icon: 'gm-image', command: 'add-banner', tooltip: i18N.act_page} // was this.i18N.act_page
    ];
  readonly i18NSource: any;
  readonly dlgComment = new SwaggerObject(['comment'], {
    comment: SwaggerNative.asString(null, null, swaggerUI(i18N.dlg_comment))
  });
  constructor(protected dataSources: DataSources,
              protected  basicService: BasicService,
              protected  dialogService: DialogService,
              public  systemLang: SystemLang, protected rootPage: RootPageService,
              protected  dictionary: DictionaryService) {
    super(systemLang, rootPage, dictionary.getAppDictionary('FilesTableComponent', i18N));
    this.dataSource = this.dataSources.Files;
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  selectFiles(files): void {
    this.files = files;
  }
  uploadFiles(): void {
    if (this.files && this.files.length > 0) {
      const dlgRef = this.dialogService.openExtDialog(ExtendedData.create({}, false, this.dlgComment, 'yes_no'));
      dlgRef.afterClosed().subscribe((res) => {
        if (res) {
          const {comment} = res;
          for (const file of this.files) {
            this.basicService.upload(file, comment).subscribe(
              event => {
                if (event.type === HttpEventType.UploadProgress) {
                  this.uploadComponent.setProgress(file, Math.round(100 * event.loaded / event.total));
                } else if (event instanceof HttpResponse) {
                  this.uploadComponent.setProgress(file, Math.round(100));
                }
              },
              (err) => {
                console.log('Upload Error:', err);
              }, () => {
                console.log('Upload completed: ' + file.name);
                this.uploadComponent.clean(file);
                const i = this.files.indexOf(file);
                this.files.splice(i, 1);
              }
            );
          }
        }
      });
    }
  }
  tableAction(event: { cmd: string; rows: any[] }): void {
    switch (event.cmd) {
      case 'add-pet':
        this.hdlMakePet(event.rows);
        break;
      case 'add-banner':
        this.hdlMakeBanner(event.rows);
        break;
      case 'add-page':
        this.hdlMakePage(event.rows);
        break;
    }
  }

  private hdlMakeBanner(rows: any[]): void {
    const extData = ExtendedData.create({ref: {refId: rows[0].id}}, false, AddSwaggerBannerType, 'save_cancel', this.i18n.addBanner);
    const dlgRef = this.dialogService.openExtDialog(extData, true);
    dlgRef.afterClosed().subscribe(data => {
      if (data) {
        const banner: BannerType = Object.assign({}, data);
        for (const row of rows) {
          banner.ref.refId = row.id;
          this.basicService.addBanner2(banner).subscribe(r => console.log(r));
        }
      }
    });
  }
  private hdlMakePage(rows: any[]): void {
    // tslint:disable-next-line:max-line-length
    const extData = ExtendedData.create({ref: rows.map(r => ({refId: r.id}))}, false, SwaggerPageType, 'save_cancel', 'temp'); // was i18N.addBanner
    const dlgRef = this.dialogService.openExtDialog(extData, true);
    dlgRef.afterClosed().subscribe(data => {
      if (data) {
        const page: PageType = Object.assign({}, data);
        this.basicService.addPage2(page).subscribe(r => console.log(r));
      }
    });
  }
  private hdlMakePet(rows: any[]): void {
    // tslint:disable-next-line:max-line-length
    const extData = ExtendedData.create({ref: rows.map(r => ({refId: r.id}))}, false, SwaggerPetType, 'save_cancel', 'temp'); // was i18N.addBanner
    const dlgRef = this.dialogService.openExtDialog(extData, true);
    dlgRef.afterClosed().subscribe(data => {
      if (data) {
        const page: PetType = Object.assign({}, data);
        this.basicService.addPet2(page).subscribe(r => console.log(r));
      }
    });
  }

}
