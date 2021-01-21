import {Observable} from 'rxjs';

export interface LanguageType {
  lang: string;
  displayName: string;
  rate: number;
}
export interface TitleType {
  id: string;
  lang: string;
  title: string;
}
export function isTitleType(title: TitleType, strict: boolean = false): boolean {
  return title && typeof title.lang === 'string' && typeof title.title === 'string' && (!strict || typeof title.id === 'string');
}
export interface ObtainSystemLanguage {
  getSystemLanguages(): Observable<Array<LanguageType>>;
}
