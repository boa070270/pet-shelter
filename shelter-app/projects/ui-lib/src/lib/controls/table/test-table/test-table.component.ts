import {Component, Input, OnInit} from '@angular/core';
import {TestTableService} from './test-table.service';

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

  constructor(testTableService: TestTableService) {
    this.displayedColumns = testTableService.columns;
    this.dataSource = testTableService.datasource;
  }

  ngOnInit(): void {
  }

}
