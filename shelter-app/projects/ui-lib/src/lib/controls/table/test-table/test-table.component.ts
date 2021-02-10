import {Component, Input, OnInit} from '@angular/core';
import {TestTableService} from './test-table.service';
import {DialogService} from '../../../dialog-service';
import {ExtendedData} from '../../../shared';

@Component({
  selector: 'lib-test-table',
  // templateUrl: './test-table.component.html',
  template: `<table cdk-table [dataSource]="dataSource" >
    <!-- Position Column -->
    <ng-container cdkColumnDef="position" >
      <th cdk-header-cell *cdkHeaderCellDef> No. </th>
      <td cdk-cell *cdkCellDef="let element"> {{element.position}} </td>
    </ng-container>

    <!-- Name Column -->
    <ng-container cdkColumnDef="name" [sticky]="true">
      <th cdk-header-cell *cdkHeaderCellDef> Name </th>
      <td cdk-cell *cdkCellDef="let element"> {{element.name}} </td>
    </ng-container>

    <!-- Weight Column -->
    <ng-container cdkColumnDef="weight" >
      <th cdk-header-cell *cdkHeaderCellDef> Weight </th>
      <td cdk-cell *cdkCellDef="let element"> {{element.weight}} </td>
    </ng-container>

    <!-- Symbol Column -->
    <ng-container cdkColumnDef="symbol">
      <th cdk-header-cell *cdkHeaderCellDef> Symbol </th>
      <td cdk-cell *cdkCellDef="let element"> {{element.symbol}} </td>
    </ng-container>
    <ng-container cdkColumnDef="colA">
      <th cdk-header-cell *cdkHeaderCellDef>  colA  </th>
      <td cdk-cell *cdkCellDef="let element"> {{element.colA}} </td>
    </ng-container>
    <ng-container cdkColumnDef="colB">
      <th cdk-header-cell *cdkHeaderCellDef>  colB  </th>
      <td cdk-cell *cdkCellDef="let element"> {{element.colB}} </td>
    </ng-container>
    <ng-container cdkColumnDef="colC">
      <th cdk-header-cell *cdkHeaderCellDef>  colC  </th>
      <td cdk-cell *cdkCellDef="let element"> {{element.colC}} </td>
    </ng-container>
    <ng-container cdkColumnDef="colD">
      <th cdk-header-cell *cdkHeaderCellDef>  colD  </th>
      <td cdk-cell *cdkCellDef="let element"> {{element.colD}} </td>
    </ng-container>
    <ng-container cdkColumnDef="colE">
      <th cdk-header-cell *cdkHeaderCellDef>  colE  </th>
      <td cdk-cell *cdkCellDef="let element"> {{element.colE}} </td>
    </ng-container>

    <tr cdk-header-row *cdkHeaderRowDef="displayedColumns" (click)="headerClick()" ></tr>
    <tr cdk-row *cdkRowDef="let row; columns: displayedColumns;"></tr>
  </table>`,
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
      if (typeof v === 'object' && v !== null) {
        this.displayedColumns = v.columns;
      }
    });
  }
}
