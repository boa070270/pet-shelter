import {Component} from '@angular/core';
import {AbstractDataSource} from 'ui-lib';
// from x-payload
import {FileType} from '../common/types';
import {SwaggerFileType} from '../common/swagger-objects';
import {DataSources} from '../datasources';

@Component({
  selector: 'app-files-table',
  template: `
    <lib-upload-files [(ngModel)]="files" (selected)="uploadFiles($event)"></lib-upload-files>
    <lib-table [dataSource]="dataSource" [swagger]="swagger"></lib-table>
  `,
  styleUrls: ['./files-table.component.sass'] // TODO change to ...
})
export class FilesTableComponent {
  dataSource: AbstractDataSource<FileType>;
  swagger = SwaggerFileType;
  files: any;

  constructor(datasources: DataSources) {
    this.dataSource = datasources.Files;
  }

  uploadFiles(files): void {
    console.log('FilesTableComponent.uploadFiles', files);
  }
}
