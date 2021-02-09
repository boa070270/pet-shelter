import {Component, Input, OnInit} from '@angular/core';
import {TestTableService} from './test-table.service';
import {DialogService} from '../../../dialog-service';
import {ExtendedData} from '../../../dialogs';

@Component({
  selector: 'lib-test-table',
  templateUrl: './test-table.component.html',
  styleUrls: ['./test-table.component.css']
})
export class TestTableComponent implements OnInit {
  @Input()
  displayedColumns: string[];
  @Input()
  dataSource;

  constructor(private testTableService: TestTableService,
              private dialogService: DialogService) {
    this.displayedColumns = testTableService.columns;
    this.dataSource = testTableService.datasource;
  }

  ngOnInit(): void {
  }

  headerClick(): void {
    const extDate = new ExtendedData();
    extDate.data = {columns: this.displayedColumns};
    extDate.action = 'save_cancel';
    extDate.swagger = {
        orderControls: ['columns'],
        properties: {
          columns: {
            controlType: 'list-builder',
            type: 'string',
            constrictions: {
              enums: this.testTableService.columns
            }
          }
        }
      };
    const dialogRef = this.dialogService.infoExtDialog(extDate, true);
    dialogRef.afterClosed().subscribe(v => {
      this.displayedColumns = v.columns;
    });
  }
}
