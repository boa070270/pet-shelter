import {
  SwaggerNativeString,
  SwaggerNativeInteger,
  SwaggerObject,
  swaggerUI,
  SwaggerNativeBoolean,
  SwaggerArray
} from 'ui-lib';

export const StatusType = new SwaggerObject(
  ['code', 'message'],
  {
    code: new SwaggerNativeInteger(),
    details: new SwaggerObject([],{}),
    message: new SwaggerNativeString()
  }
);

export const LanguageType = new SwaggerObject(
  ['lang', 'displayName', 'rate'],
  {
    lang: new SwaggerNativeString(
      'input',
      {minLength: 2, maxLength: 6},
      swaggerUI(
        [{lang: 'en', title: 'Lang'}, {lang: 'uk', title: 'Мова'}],
        [{lang: 'en', title: 'Language code'}, {lang: 'uk', title: 'Коротка назва (en, uk)'}],
        [{lang: 'en', title: 'enter tooltip'}, {lang: 'uk', title: 'enter tooltip'}],
        [{lang: 'en', title: 'enter placeholder'}, {lang: 'uk', title: 'enter placeholder'}],
      )
    ),
    displayName: new SwaggerNativeString(
      'input',
      {minLength: 3, maxLength: 16},
      swaggerUI(
        [{lang: 'en', title: 'Display'}, {lang: 'uk', title: 'Відображати'}],
        [{lang: 'en', title: 'Language code'}, {lang: 'uk', title: 'Коротка назва (en, uk)'}],
        [{lang: 'en', title: 'enter tooltip'}, {lang: 'uk', title: 'enter tooltip'}],
        [{lang: 'en', title: 'enter placeholder'}, {lang: 'uk', title: 'enter placeholder'}],
      )
    ),
    rate: new SwaggerNativeInteger(
      'input',
      {minimum: 0, maximum: 99},
      swaggerUI(
        [{lang: 'en', title: 'Rate'}, {lang: 'uk', title: 'Важливість'}],
        [{lang: 'en', title: 'Language code'}, {lang: 'uk', title: 'Коротка назва (en, uk)'}],
        [{lang: 'en', title: 'enter tooltip'}, {lang: 'uk', title: 'enter tooltip'}],
        [{lang: 'en', title: 'enter placeholder'}, {lang: 'uk', title: 'enter placeholder'}],
      )
    )
  }
);

export const MenuType = new SwaggerObject(
  ['path', 'component', 'role', 'position', 'parentId'],
  {
    path: new SwaggerNativeString(),
    component: new SwaggerNativeString(),
    role: new SwaggerNativeString(),
    position: new SwaggerNativeInteger(),
    parentId: new SwaggerNativeString()
  },
  swaggerUI(),
  ['path', 'component']
);
export const TitleSwagerType = new SwaggerObject(
  ['id', 'lang', 'title'],
  {
    id: new SwaggerNativeString(),
    lang: new SwaggerNativeString(),
    title: new SwaggerNativeString()
  },
  {},
  ['id', 'lang', 'title']
);
export const FieldType = new SwaggerObject(
  ['name', 'type', 'subtype', 'order', 'enumValues'],
  {
    name: new SwaggerNativeString(null, {minLength: 1, maxLength: 10}, swaggerUI()),
    type: new SwaggerNativeString(null, {enums: ['number', 'string', 'enum', 'date']}),
    subtype: new SwaggerNativeString(),
    order: new SwaggerNativeInteger(),
    enumValues: new SwaggerNativeString()
  },
  swaggerUI(),
  ['name', 'type']
);
export const ReferenceType = new SwaggerObject(
  [],
  {},
  swaggerUI(),
  []
);
export const PageType = new SwaggerObject(
  ['id', 'lang', 'title', 'summary', 'body', 'score'],
  {
    id: new SwaggerNativeString(),
    lang: new SwaggerNativeString(),
    title: new SwaggerNativeString(),
    summary: new SwaggerNativeString(),
    body: new SwaggerNativeString(),
    score: new SwaggerNativeInteger(),
    draft: new SwaggerNativeBoolean(),
    tags: new SwaggerNativeString(),
    restriction: new SwaggerNativeString(),
    menuId: new SwaggerNativeString(),
    created: new SwaggerNativeString(),
    ref: new SwaggerArray(
      ReferenceType
    )
}
);
