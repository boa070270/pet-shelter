import { SystemLang } from './system-lang.service';
import {LanguageType, ObtainSystemLanguage} from '../shared/language';
import {BrowserStorageService} from '../shared';
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
    expect(new SystemLang(obtainSystemLanguage, new BrowserStorageService(storage))).toBeTruthy();
  });
});
