import { TestBed } from '@angular/core/testing';

import { RootPageServiceImpl } from './root-page.service';
import {ROOT_PAGE_DATA, RootPageService} from './services-api';

describe('RootPageService', () => {
  let service: RootPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ROOT_PAGE_DATA);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
