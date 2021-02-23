import {Observable} from 'rxjs';

export interface LanguageType {
  lang: string;
  displayName: string;
  rate: number;
}
export interface TitleType {
  id?: string;
  lang: string;
  title: string;
}
export interface I18NType {
  [key: string]: string | TitleType[];
}

export function isTitleType(title: any, strict: boolean = false): boolean {
  return title && typeof title.lang === 'string' && typeof title.title === 'string' && (!strict || typeof title.id === 'string');
}
export function distinctTitleId(tt: TitleType | TitleType[]): string[] {
  const result = [];
  if (Array.isArray(tt)) {
    tt.forEach(t => {
      if (isTitleType(t) && t.id && !result.includes(t.id)) {
        result.push(t.id);
      }
    });
  } else if (isTitleType(tt)) {
    result.push(tt.id);
  }
  return result;
}
export interface ObtainSystemLanguage {
  getSystemLanguages(): Observable<Array<LanguageType>>;
}
