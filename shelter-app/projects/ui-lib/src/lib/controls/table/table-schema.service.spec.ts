import { TestBed } from '@angular/core/testing';

import { TableSchemaService } from './table-schema.service';

describe('TableSchemaService', () => {
  let service: TableSchemaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableSchemaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
