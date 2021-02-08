import { TestBed } from '@angular/core/testing';

import { TestTableService } from './test-table.service';

describe('TestTableService', () => {
  let service: TestTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
