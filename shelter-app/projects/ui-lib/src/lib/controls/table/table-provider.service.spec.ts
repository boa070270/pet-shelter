import { TestBed } from '@angular/core/testing';

import { TableProviderService } from './table-provider.service';

describe('TestTableService', () => {
  let service: TableProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
