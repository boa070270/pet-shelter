import { SwaggerFormDirective } from './swagger-form.directive';

describe('DynamicFormDirective', () => {
  it('should create an instance', () => {
    const directive = new SwaggerFormDirective(null, null);
    expect(directive).toBeTruthy();
  });
});
