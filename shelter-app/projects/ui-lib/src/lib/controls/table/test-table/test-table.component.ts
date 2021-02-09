import {Component, Input, OnInit} from '@angular/core';
import {TestTableService} from './test-table.service';
import {Dialog} from "@angular/cdk-experimental/dialog";

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

  constructor(testTableService: TestTableService,
              private dialog: Dialog) {
    this.displayedColumns = testTableService.columns;
    this.dataSource = testTableService.datasource;
  }

  ngOnInit(): void {
  }

  headerClick(): void {
    
  }
}
