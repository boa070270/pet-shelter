import {isTitleType, LanguageType, ObtainSystemLanguage, TitleType} from '../shared/language';
import {EventEmitter, Inject, Injectable, OnDestroy} from '@angular/core';
import {BrowserStorageService} from '../shared';
import {Subscription} from 'rxjs';

const KEY_LANGUAGES = 'SystemLanguages';
const KEY_LOCALE = 'Locale';
@Injectable({
  providedIn: 'root'
})
export class SystemLang implements OnDestroy {
  private locale: string;
  private languages: LanguageType[] = [];
  private readonly subscription: Subscription;
  private readonly change = new EventEmitter<any>();

  constructor(@Inject('ObtainSystemLanguage') private service: ObtainSystemLanguage, private storage: BrowserStorageService) {
    console.log('constructor SystemLang');
    this.languages = storage.getObj(KEY_LANGUAGES);
    const locale = storage.get(KEY_LOCALE);
    if (!locale) {
      this.setLocale('uk');
    } else {
      this.setLocale(locale);
    }
    this.refresh();
  }
  refresh(): void {
    this.service.getSystemLanguages().subscribe(languages => {
      this.languages = languages.sort(a => a.rate);
      this.storage.setObj(KEY_LANGUAGES, languages);
      this.change.emit(this.languages);
    });
  }
  ngOnDestroy(): void {
    console.log('destroy SystemLang');
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.locale) {
      this.storage.set('Locale', this.locale);
    }
  }
  onChange(): EventEmitter<any> {
    return this.change;
  }
  getLanguages(): LanguageType[] {
    return this.languages;
  }
  getDisplayName(lang: string): string {
    for (const l of this.languages) {
      if (l.lang === lang) {
        return l.displayName;
      }
    }
  }
  setLocale(locale: string): void {
    this.locale = locale;
    this.storage.set(KEY_LOCALE, this.locale);
    this.change.emit(this.locale);
  }
  getLocale(): string {
    return this.locale;
  }
  getTitle(titles: TitleType | TitleType[]): string {
    if (Array.isArray(titles) && titles.length > 0) {
      const title = titles.find(value => value.lang === this.locale);
      if (isTitleType(title)){
        return title.title;
      }
      for (const l of this.languages) {
        const found = titles.find(v => v.lang === l.lang);
        if (found) {
          return found.title;
        }
      }
      return titles[0].title;
    }
    if (isTitleType(titles as TitleType)) {
      return (titles as TitleType).title;
    }
  }

}
