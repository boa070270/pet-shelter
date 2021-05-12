import {LanguageType, ObtainSystemLanguage} from "../src/lib/shared";
import {Observable} from "rxjs";

export class ObtainSystemLanguageMock implements ObtainSystemLanguage {
  getSystemLanguages(): Observable<Array<LanguageType>> {
    return new Observable(s => {
      s.next([{
        lang: 'en',
        displayName: 'en',
        rate: 0
      }]);
    });
  }
}
