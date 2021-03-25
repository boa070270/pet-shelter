import { TestBed } from '@angular/core/testing';

import { IntervalObservableService } from './interval-observable.service';

describe('IntervalObservableService', () => {
  let service: IntervalObservableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntervalObservableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
