import {Component, Input, OnInit} from '@angular/core';
import {TableSchemaService} from './table-schema.service';
import {TableSchema} from './table-schema';

@Component({
  selector: 'lib-table-generator',
  // templateUrl: './table-generator.component.html',
  template: `<lib-table-control
    [caption]="tableSchema.caption"
    [columns]="tableSchema.columns"
    [observableData]="tableSchema.observableData"
    [filtered]="tableSchema.filtered"
    [stickied]="tableSchema.stickied"
    [fnEqual]="tableSchema.fnEqual"
    [rowNumbers]="tableSchema.rowNumbers"
    ></lib-table-control>`,
  styleUrls: ['./table-generator.component.css']
})
export class TableGeneratorComponent implements OnInit {
  @Input() schema: string;
  tableSchema: TableSchema;
  constructor(private tableSchemaService: TableSchemaService) { }

  ngOnInit(): void {
    this.tableSchema = this.tableSchemaService.getTableSchema(this.schema) || {};
  }

}
