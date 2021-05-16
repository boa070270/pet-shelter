import { SystemLangImpl } from './system-lang.service';
import {LanguageType, ObtainSystemLanguage} from './language';
import {BrowserStorageService} from './index';
import {Observable} from 'rxjs';

class ObtainSystemLanguageMock implements ObtainSystemLanguage {
  getSystemLanguages(): Observable<Array<LanguageType>> {
    return undefined;
  }
}
describe('SystemLang', () => {
  const obtainSystemLanguage = new ObtainSystemLanguageMock();
  const storage = new Storage();
  it('should create an instance', () => {
    expect(new SystemLangImpl(obtainSystemLanguage, new BrowserStorageService(storage))).toBeTruthy();
  });
});
