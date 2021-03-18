import { TestBed } from '@angular/core/testing';

import { SwaggerFormService } from './swagger-form.service';

describe('DynamicFormService', () => {
  let service: SwaggerFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwaggerFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
