
export interface StatusType {
    code: number;
    detail: object;
    message: string;
}

export interface LanguageType {
    lang: string;
    displayName: string;
    rate: number;
}

export interface Response<T> {
  data: T;
  status: StatusType;
}

export interface IdResponse {
    data: {
      id: string;
    };
    status: StatusType;
}

export interface MenuTypeUI extends MenuType {
  title: TitleType[];
}

export interface MenuType {
    path: string;
    component: string;
    role: string;
    position: number;
    parentId: string;
}

export interface TitleType {
    id: string;
    lang: string;
    title: string;
}
export interface MenusAndTitlesType {
  menus: MenuType[];
  titles: TitleType[];
}
export interface MenuAndTitlesType {
  menu: MenuType;
  titles: TitleType[];
}
export interface MenuTree {
  path: string;
  title: string | TitleType[];
  component: string;
  role?: string;
  menu?: MenuTree[];
}
export interface VoteType {
  who: string;
  resId: string;
  voteId?: number;
  vote?: string;
  count?: number;
}
export interface CommentType {
  id: string;
  created: string;
  resId: string;
  nickName: string;
  commentId?: string;
  comment: string;
  isMy: boolean;
  vote: VoteType[];
  numberOf?: number;
}
export interface CommentsResponse {
  lastComment: string;
  numberOf: number;
  responses: CommentType[];
}
export function convertMenusToMenuArray(menus: MenusAndTitlesType): MenuAndTitlesType[] {
  const result: MenuAndTitlesType[] = [];
  for (const menu of menus.menus) {
    const titles = menus.titles.filter(value => value.id === menu.path);
    result.push({menu, titles});
  }
  return result;
}
export enum FieldTypeTypeEnum {
    number = 'number', string = 'string', text = 'text',  enum = 'enum', date = 'date'
}

export interface FieldType {
    name: string;
    type: FieldTypeTypeEnum;
    subtype: string;
    enumValues: string;
    order?: number;
}

export enum PageTypeRestrictionEnum {
    admin= 'admin', writer = 'writer', public = 'public'
}

export interface PageType {
    id: string;
    lang: string;
    title: string;
    summary: string;
    body: string;
    score: number;
    draft: boolean;
    tags: string;
    restriction: string;
    menuId?: string;
    created?: string;
    ref: ReferenceType[];
}

export interface FileType {
    id: string;
    originalName: string;
    encoding: string;
    mimeType: string;
    size: string;
    created?: string;
    comment?: string;
    numberOfReferences?: number;
}

export interface FileDetailsType {
  file: FileType;
  references: [{
    refId: string,
    refType: Anonymous4TypeRefTypeEnum,
    refName: string
  }];
}

export interface ReferenceType {
    refId: string;
    targetUrl?: string;
    mimeType?: string;
    tooltip?: string;
}

export enum CarouselTypeResourceEnum {
    banner= 'banner', page = 'page', pet = 'pet'
}

export interface CarouselType {
    assetId: string;
    targetUrl: string;
    mimeType: string;
    tooltip: string;
    resource: CarouselTypeResourceEnum;
}

export interface BannerType {
    id: string;
    score: number;
    lang?: string;
    ref: ReferenceType;
}

export interface FieldValueType {
    name: string;
    value: string;
}

export interface PetType {
    id: string;
    fields: FieldValueType[];
    ref: ReferenceType[];
}

export interface SearchType extends PageType {
  resource: string;
  fields: FieldValueType[];
  // add assets
  originalName: string;
  mimeType: string;
  comment: string;
}
export interface SearchResult {
  data: SearchType[];
  total: number;
  scrollId: string;
}

export enum QueryTypeOperatorEnum {
    and = 'and', or = 'or'
}

export interface QueryType {
    operator: QueryTypeOperatorEnum;
    fields: FieldValueType[];
}

export enum UserTypeAuthTypeEnum {
    basic = 'basic', apiKey = 'apiKey', oauth2 = 'oauth2'
}

export enum UserTypeRoleEnum {
    admin = 'admin', writer = 'writer', public = 'public'
}

export interface UserType {
    login: string;
    authType: UserTypeAuthTypeEnum;
    password: string;
    role: string[];
    created?: string;
    enabled: boolean;
    authHeaders?: Array<{name: string, value: string | string[]}>;
}

export interface FieldsAndTitlesType {
    fields: FieldType[];
    titles: TitleType[];
}
export interface FieldAndTitlesType {
  field: FieldType;
  titles: TitleType[];
}
export interface FieldTypeUI extends FieldType {
  title: TitleType[];
}
export function convertFieldsToFieldArray(fields: FieldsAndTitlesType): FieldAndTitlesType[] {
  const result: FieldAndTitlesType[] = [];
  for (const field of fields.fields) {
    const titles = fields.titles.filter(value => value.id === field.name);
    result.push({field, titles});
  }
  return result;
}
export enum Anonymous4TypeRefTypeEnum {
    banner = 'banner', page = 'page', pet = 'pet'
}
export const AdminMenu: MenusAndTitlesType = {
  menus: [
    {path: 'lang-table', component: 'LangTableComponent', role: 'admin', parentId: 'admin', position: 0},
    {path: 'menu-table', component: 'MenuTableComponent', role: 'admin', parentId: 'admin', position: 0},
    {path: 'fields-table', component: 'FieldsTableComponent', role: 'admin', parentId: 'admin', position: 0},
    {path: 'files-table', component: 'FilesTableComponent', role: 'admin', parentId: 'admin', position: 0},
    {path: 'pets-table', component: 'PetsTableComponent', role: 'admin,writer', parentId: 'admin', position: 0},
    {path: 'banners-table', component: 'BannersTableComponent', role: 'admin', parentId: 'admin', position: 0},
    {path: 'page-table', component: 'PageTableComponent', role: 'admin,writer', parentId: 'admin', position: 0},
    {path: 'user-table', component: 'UserTableComponent', role: 'admin', parentId: 'admin', position: 0},
  ],
  titles: [
    {id: 'lang-table', lang: 'en', title: 'Settings Language'},
    {id: 'menu-table',  lang: 'en', title: 'Settings Menu'},
    {id: 'fields-table',  lang: 'en', title: 'Settings Fields'},
    {id: 'files-table',  lang: 'en', title: 'Settings Files'},
    {id: 'pets-table',  lang: 'en', title: 'Settings Pets'},
    {id: 'banners-table',  lang: 'en', title: 'Settings Banners'},
    {id: 'page-table',  lang: 'en', title: 'Settings Page'},
    {id: 'user-table',  lang: 'en', title: 'Settings User'},

    {id: 'lang-table', lang: 'uk', title: 'Конфігурація мов'},
    {id: 'menu-table',  lang: 'uk', title: 'Конфігурація меню'},
    {id: 'fields-table',  lang: 'uk', title: 'Конфігурація полів'},
    {id: 'files-table',  lang: 'uk', title: 'Конфігурація файлів'},
    {id: 'pets-table',  lang: 'uk', title: 'Конфігурація питомців'},
    {id: 'banners-table',  lang: 'uk', title: 'Конфігурація банерів'},
    {id: 'page-table',  lang: 'uk', title: 'Конфігурація сторінок'},
    {id: 'user-table',  lang: 'uk', title: 'Конфігурація користувачів'},

    {id: 'lang-table', lang: 'ru', title: 'Натройка язіков'},
    {id: 'menu-table',  lang: 'ru', title: 'Натройка меню'},
    {id: 'fields-table',  lang: 'ru', title: 'Натройка полей'},
    {id: 'files-table',  lang: 'ru', title: 'Натройка файлов'},
    {id: 'pets-table',  lang: 'ru', title: 'Натройка питомцев'},
    {id: 'banners-table',  lang: 'ru', title: 'Натройка баннеров'},
    {id: 'page-table',  lang: 'ru', title: 'Натройка страниц'},
    {id: 'user-table',  lang: 'ru', title: 'Натройка пользователей'},
  ]
};
