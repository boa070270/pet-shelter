import { SafeHtmlPipe } from './safe-html.pipe';
import {DomSanitizer} from '@angular/platform-browser';

describe('SafeHtmlPipePipe', () => {
  it('create an instance', () => {
    const pipe = new SafeHtmlPipe(DomSanitizer.ɵfac());
    expect(pipe).toBeTruthy();
  });
});
