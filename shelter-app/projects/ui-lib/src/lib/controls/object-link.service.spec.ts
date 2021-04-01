import { TestBed } from '@angular/core/testing';

import { ObjectLinkService } from './object-list.service';

describe('ObjectListService', () => {
  let service: ObjectLinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjectLinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
