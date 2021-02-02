import { Injectable } from '@angular/core';
import {TableSchema} from './table-schema';

@Injectable({
  providedIn: 'root'
})
export class TableSchemaService {
  private schemas = {};
  constructor() { }

  setTableSchema(name: string, schema: TableSchema): void {
    this.schemas[name] = schema;
  }
  getTableSchema(schema: string): TableSchema {
    return this.schemas[schema];
  }
}
