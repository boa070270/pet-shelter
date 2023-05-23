import { TestBed } from '@angular/core/testing';

import { HierarchyPageServiceImpl } from './root-page.service';
import {ROOT_PAGE_DATA, HierarchyPageService} from './services-api';

describe('RootPageService', () => {
  let service: HierarchyPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ROOT_PAGE_DATA);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
