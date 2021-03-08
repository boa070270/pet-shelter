import { TestBed } from '@angular/core/testing';

import { LogWriterService } from './log-writer.service';

describe('LogWriterService', () => {
  let service: LogWriterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogWriterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
