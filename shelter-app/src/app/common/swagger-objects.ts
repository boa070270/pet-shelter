import {I18NType, SwaggerArray, SwaggerNative, SwaggerObject, swaggerUI} from 'ui-lib';
const I18N_LANG = {
  lang_caption: [{lang: 'en', title: 'Lang'}, {lang: 'uk', title: 'Мова'}],
  lang_description: [{lang: 'en', title: 'Language code'}, {lang: 'uk', title: 'Коротка назва (en, uk)'}],
  lang_tooltip: [{lang: 'en', title: 'enter tooltip'}, {lang: 'uk', title: 'enter tooltip'}],
  lang_placeholder: [{lang: 'en', title: 'enter placeholder'}, {lang: 'uk', title: 'enter placeholder'}],
  displayName_caption: [{lang: 'en', title: 'Display'}, {lang: 'uk', title: 'Відображати'}],
  displayName_description: [{lang: 'en', title: 'Language code'}, {lang: 'uk', title: 'Коротка назва (en, uk)'}],
  displayName_tooltip: [{lang: 'en', title: 'enter tooltip'}, {lang: 'uk', title: 'enter tooltip'}],
  displayName_placeholder: [{lang: 'en', title: 'enter placeholder'}, {lang: 'uk', title: 'enter placeholder'}],
  rate_caption: [{lang: 'en', title: 'Rate'}, {lang: 'uk', title: 'Важливість'}],
  rate_description: [{lang: 'en', title: 'Language code'}, {lang: 'uk', title: 'Коротка назва (en, uk)'}],
  rate_tooltip: [{lang: 'en', title: 'enter tooltip'}, {lang: 'uk', title: 'enter tooltip'}],
  rate_placeholder: [{lang: 'en', title: 'enter placeholder'}, {lang: 'uk', title: 'enter placeholder'}]
};
export const SwaggerLanguageType = new SwaggerObject(
  ['lang', 'displayName', 'rate'],
  {
    lang: SwaggerNative.asString(
      'lib-input-control',
      {minLength: 2, maxLength: 6, immutable: true},
      swaggerUI(
        I18N_LANG.lang_caption,
        I18N_LANG.lang_description,
        I18N_LANG.lang_tooltip,
        I18N_LANG.lang_placeholder,
      )
    ),
    displayName: SwaggerNative.asString(
      'lib-input-control',
      {minLength: 3, maxLength: 16},
      swaggerUI(
        I18N_LANG.displayName_caption,
        I18N_LANG.displayName_description,
        I18N_LANG.displayName_tooltip,
        I18N_LANG.displayName_placeholder,
      )
    ),
    rate: SwaggerNative.asInteger(
      'lib-input-control',
      {minimum: 0, maximum: 99},
      swaggerUI(
        I18N_LANG.rate_caption,
        I18N_LANG.rate_description,
        I18N_LANG.rate_tooltip,
        I18N_LANG.rate_placeholder,
      )
    )
  }
);
const I18N_MENU = {
  path_caption: [{lang: 'en', title: 'Path'}, {lang: 'uk', title: 'Шлях'}],
  path_description: [{lang: 'en', title: 'Path to the page'}, {lang: 'uk', title: 'Визначте шлях'}],
  path_tooltip: [{lang: 'en', title: 'Input path to page'}, {lang: 'uk', title: 'Введіть шлях'}],
  path_placeholder: [{lang: 'en', title: 'e.g: about'}, {lang: 'uk', title: 'приклад: about'}],
  component_caption: [{lang: 'en', title: 'Title'}, {lang: 'uk', title: 'Назва'}],
  component_description: [{lang: 'en', title: 'The name we will see in menu'}, {lang: 'uk', title: 'Назва яка відоражається'}],
  component_tooltip: [{lang: 'en', title: 'Input the title'}, {lang: 'uk', title: 'Введіть назву'}],
  component_placeholder: [{lang: 'en', title: 'e.g.: About us'}, {lang: 'uk', title: 'приклад: Про нас'}],
  role_caption: [{lang: 'en', title: 'Role'}, {lang: 'uk', title: 'Доступ'}],
  role_description: [{lang: 'en', title: 'Who can see this menu'}, {lang: 'uk', title: 'Визначте доступ'}],
  role_tooltip: [{lang: 'en', title: 'Input role'}, {lang: 'uk', title: 'Введіть доступ'}],
  role_placeholder: [{lang: 'en', title: 'public,writer,admin'}, {lang: 'uk', title: 'public,writer,admin'}],
  position_caption: [{lang: 'en', title: 'Order'}, {lang: 'uk', title: 'Порядок'}],
  position_description: [{lang: 'en', title: 'Define order of this menu'}, {lang: 'uk', title: 'Визначте порядок цього меню'}],
  position_tooltip: [{lang: 'en', title: 'Input order'}, {lang: 'uk', title: 'Введіть число'}],
  position_placeholder: [{lang: 'en', title: 'number'}, {lang: 'uk', title: '0'}],
  parentId_caption: [{lang: 'en', title: 'Parent'}, {lang: 'uk', title: 'Верхній рівень'}],
  parentId_description: [{lang: 'en', title: 'Define parent of this menu, leve empty if menu is top'},
    {lang: 'uk', title: 'Визначте врехній рівень, залиште пустим якща меню верхнього рівня'}],
  parentId_tooltip: [{lang: 'en', title: 'Input path of parent menu'}, {lang: 'uk', title: 'Ввдедіть шлях батьківського меню'}],
  parentId_placeholder: [{lang: 'en', title: 'path of parent'}, {lang: 'uk', title: 'приклад: about'}],
};
export const SwaggerMenuType = new SwaggerObject(
  ['path', 'component', 'role', 'position', 'parentId'],
  {
    path: SwaggerNative.asString(null, {minLength: 1, maxLength: 16, immutable: true},
      swaggerUI(I18N_MENU.path_caption, I18N_MENU.path_description, I18N_MENU.path_tooltip, I18N_MENU.path_placeholder)),
    component: SwaggerNative.asString(null, {minLength: 1, maxLength: 16},
      // tslint:disable-next-line:max-line-length
      swaggerUI(I18N_MENU.component_caption, I18N_MENU.component_description, I18N_MENU.component_tooltip, I18N_MENU.component_placeholder)),
    role: SwaggerNative.asString(null, {minLength: 1, maxLength: 64},
      swaggerUI(I18N_MENU.role_caption, I18N_MENU.role_description, I18N_MENU.role_tooltip, I18N_MENU.role_placeholder)),
    position: SwaggerNative.asInteger(null, {},
      swaggerUI(I18N_MENU.position_caption, I18N_MENU.position_description, I18N_MENU.position_tooltip, I18N_MENU.position_placeholder)),
    parentId: SwaggerNative.asString(null, {minLength: 1, maxLength: 16},
      swaggerUI(I18N_MENU.parentId_caption, I18N_MENU.parentId_description, I18N_MENU.parentId_tooltip, I18N_MENU.parentId_placeholder)),
  },
  swaggerUI(),
  ['path', 'component']
);
const I18N_TITLE = {
  id_caption: [{lang: 'en', title: 'ID'}, {lang: 'uk', title: 'ID'}],
  id_description: [{lang: 'en', title: 'Element\'s ID'}, {lang: 'uk', title: 'ID елементу'}],
  id_tooltip: [{lang: 'en', title: 'Input ID'}, {lang: 'uk', title: 'ID'}],
  id_placeholder: [{lang: 'en', title: 'ID'}, {lang: 'uk', title: 'ID'}],
  lang_caption: [{lang: 'en', title: 'Lang'}, {lang: 'uk', title: 'Мова'}],
  lang_description: [{lang: 'en', title: 'The lang of this title'}, {lang: 'uk', title: 'Виберіть мову'}],
  lang_tooltip: [{lang: 'en', title: 'Select lang'}, {lang: 'uk', title: 'Виберіть мову'}],
  lang_placeholder: [{lang: 'en', title: 'e.g: en'}, {lang: 'uk', title: 'приклад: uk'}],
  title_caption: [{lang: 'en', title: 'Title'}, {lang: 'uk', title: 'Назва'}],
  title_description: [{lang: 'en', title: 'The title will be displayed'}, {lang: 'uk', title: 'Назва'}],
  title_tooltip: [{lang: 'en', title: 'Title'}, {lang: 'uk', title: 'Назва'}],
  title_placeholder: [{lang: 'en', title: 'e.g: Title'}, {lang: 'uk', title: 'приклад: Назва'}],
};
export const SwaggerTitleSwaggerType = new SwaggerObject(
  ['id', 'lang', 'title'],
  {
    id: SwaggerNative.asString(null, {minLength: 1, maxLength: 16},
      swaggerUI(I18N_TITLE.id_caption, I18N_TITLE.id_description, I18N_TITLE.id_tooltip, I18N_TITLE.id_placeholder)),
    lang: SwaggerNative.asString(null, {minLength: 2, maxLength: 6},
      swaggerUI(I18N_TITLE.lang_caption, I18N_TITLE.lang_description, I18N_TITLE.lang_tooltip, I18N_TITLE.lang_placeholder)),
    title: SwaggerNative.asString(null, {minLength: 1, maxLength: 64},
      swaggerUI(I18N_TITLE.title_caption, I18N_TITLE.title_description, I18N_TITLE.title_tooltip, I18N_TITLE.title_placeholder))
  },
  {},
  ['id', 'lang', 'title']
);
const I18N_FIELD = {
  name_caption: [{lang: 'en', title: 'Name'}, {lang: 'uk', title: 'Назва'}],
  name_description: [{lang: 'en', title: 'Field\'s name'}, {lang: 'uk', title: 'Назва поля'}],
  name_tooltip: [{lang: 'en', title: 'Input name'}, {lang: 'uk', title: 'Введіть назву (англійською)'}],
  name_placeholder: [{lang: 'en', title: 'name'}, {lang: 'uk', title: 'name'}],
  type_caption: [{lang: 'en', title: 'Type'}, {lang: 'uk', title: 'Тип'}],
  type_description: [{lang: 'en', title: 'Select Type'}, {lang: 'uk', title: 'Тип поля'}],
  type_tooltip: [{lang: 'en', title: 'Type'}, {lang: 'uk', title: 'Тип'}],
  type_placeholder: [{lang: 'en', title: 'Type'}, {lang: 'uk', title: 'Тип'}],
  subtype_caption: [{lang: 'en', title: 'Subtype'}, {lang: 'uk', title: 'Підтип'}],
  subtype_description: [{lang: 'en', title: 'Subtype'}, {lang: 'uk', title: 'Підтип'}],
  subtype_tooltip: [{lang: 'en', title: 'Subtype'}, {lang: 'uk', title: 'Підтип'}],
  subtype_placeholder: [{lang: 'en', title: 'Subtype'}, {lang: 'uk', title: 'підтип'}],
  order_caption: [{lang: 'en', title: 'Order'}, {lang: 'uk', title: 'Порядок'}],
  order_description: [{lang: 'en', title: 'Define order'}, {lang: 'uk', title: 'ВИзначте порядок цього поля'}],
  order_tooltip: [{lang: 'en', title: 'Input order'}, {lang: 'uk', title: 'Порядок поля'}],
  order_placeholder: [{lang: 'en', title: '0'}, {lang: 'uk', title: '0'}],
  enumValues_caption: [{lang: 'en', title: 'Enum'}, {lang: 'uk', title: 'Перелік'}],
  enumValues_description: [{lang: 'en', title: 'Input an enum definition as words separated by a comma'}, {lang: 'uk', title: 'Визначте перелік'}],
  enumValues_tooltip: [{lang: 'en', title: 'Input enum'}, {lang: 'uk', title: 'Введіть значеня'}],
  enumValues_placeholder: [{lang: 'en', title: 'one,two'}, {lang: 'uk', title: 'one,two'}],
};
export const SwaggerFieldType = new SwaggerObject(
  [ 'name', 'type', 'subtype', 'order', 'enumValues'],
  {
    name: SwaggerNative.asString(
      undefined,
      {minLength: 1, maxLength: 10},
      swaggerUI(I18N_FIELD.name_caption, I18N_FIELD.name_description, I18N_FIELD.name_tooltip, I18N_FIELD.name_placeholder)),
    type: SwaggerNative.asString(
      undefined,
      { enum: [ 'number', 'string', 'enum', 'date']},
      swaggerUI(I18N_FIELD.type_caption, I18N_FIELD.type_description, I18N_FIELD.type_tooltip, I18N_FIELD.type_placeholder)),
    subtype: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(I18N_FIELD.subtype_caption, I18N_FIELD.subtype_description, I18N_FIELD.subtype_tooltip, I18N_FIELD.subtype_placeholder)),
    order: SwaggerNative.asInteger(
      undefined,
      {},
      swaggerUI(I18N_FIELD.order_caption, I18N_FIELD.order_description, I18N_FIELD.order_tooltip, I18N_FIELD.order_placeholder)),
    enumValues: SwaggerNative.asString(
      undefined,
      {},
      // tslint:disable-next-line:max-line-length
      swaggerUI(I18N_FIELD.enumValues_caption, I18N_FIELD.enumValues_description, I18N_FIELD.enumValues_tooltip, I18N_FIELD.enumValues_placeholder)),
  },
  swaggerUI(),
  [ 'name', 'type', ],
  null,
  {type: [{c: '=enum', show: ['enumValues']}, {c: '!enum', hide: ['enumValues']}]}

);
export const SwaggerReferenceType = new SwaggerObject(
  [ 'refId', 'targetUrl', 'mimeType', 'tooltip', ],
  {
    refId: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'file id', }, ])),
    targetUrl: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'the URL that was used as href in anchor tag', }, ])),
    mimeType: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    tooltip: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'descriptions of resource', }, ])),

  },
  swaggerUI(null, [ { lang: 'en', title: 'expose file as reference', }, ]),
  [ 'refId', ]);
export const SwaggerPageType = new SwaggerObject(
  [ 'id', 'lang', 'title', 'summary', 'body', 'score', 'draft', 'tags', 'restriction', 'menuId', 'created', 'ref', ],
  {
    id: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    lang: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'page locale', }, ])),
    title: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'page\'s title', }, ])),
    summary: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'a summary of this page', }, ])),
    body: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'page\'s body', }, ])),
    score: SwaggerNative.asInteger(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'can be use as position/order', }, ])),
    draft: SwaggerNative.asBoolean(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'mark page as a draft', }, ])),
    tags: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'set of tags separated by comma defines what menu will expose this page', }, ])),
    restriction: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'you can restrict the access to this page', }, ])),
    menuId: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'bind a page to menu', }, ])),
    created: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    ref: new SwaggerArray(
      SwaggerReferenceType,
      {},
      swaggerUI()),

  },
  swaggerUI(),
  null);
export const SwaggerPageResponse = new SwaggerObject(
  [ 'data', 'status', ],
  {
    data: undefined,
    status: undefined,

  },
  swaggerUI(),
  null);
export const SwaggerPagesResponse = new SwaggerObject(
  [ 'data', 'status', ],
  {
    data: new SwaggerArray(
      undefined,
      {},
      swaggerUI()),
    status: undefined,

  },
  swaggerUI(),
  null);
export const SwaggerFileType = new SwaggerObject(
  [ 'id', 'originalName', 'encoding', 'mimeType', 'size', 'created', 'comment', 'numberOfReferences', ],
  {
    id: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    originalName: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    encoding: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    mimeType: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    size: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    created: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    comment: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    numberOfReferences: SwaggerNative.asNumber(
      undefined,
      {},
      swaggerUI()),

  },
  swaggerUI(),
  null);
export const SwaggerFileResponse = new SwaggerObject(
  [ 'data', 'status', ],
  {
    data: new SwaggerObject(
      [ 'file', 'references', ],
      {
        file: undefined,
        references: new SwaggerArray(
          new SwaggerObject(
            [ 'refId', 'refType', 'refName', ],
            {
              refId: SwaggerNative.asString(
                undefined,
                {},
                swaggerUI()),
              refType: SwaggerNative.asString(
                undefined,
                { enum: [ 'banner', 'page', 'pet', ], },
                swaggerUI()),
              refName: SwaggerNative.asString(
                undefined,
                {},
                swaggerUI()),

            },
            swaggerUI(),
            null),
          {},
          swaggerUI()),

      },
      swaggerUI(),
      null),
    status: undefined,

  },
  swaggerUI(),
  null);
export const SwaggerFilesResponse = new SwaggerObject(
  [ 'data', 'status', ],
  {
    data: new SwaggerArray(
      undefined,
      {},
      swaggerUI()),
    status: undefined,

  },
  swaggerUI(),
  null);
export const SwaggerCarouselType = new SwaggerObject(
  [ 'assetId', 'targetUrl', 'mimeType', 'tooltip', 'resource', ],
  {
    assetId: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    targetUrl: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'can be url to external resource or id of internal resource', }, ])),
    mimeType: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    tooltip: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'descriptions of resource', }, ])),
    resource: SwaggerNative.asString(
      undefined,
      { enum: [ 'banner', 'page', 'pet', ], },
      swaggerUI()),

  },
  swaggerUI(null, [ { lang: 'en', title: 'expose references of banners, pets, pages', }, ]),
  null);
export const SwaggerCarouselResponse = new SwaggerObject(
  [ 'data', 'status', ],
  {
    data: new SwaggerArray(
      undefined,
      {},
      swaggerUI()),
    status: undefined,

  },
  swaggerUI(),
  null);
export const AddSwaggerBannerType = new SwaggerObject(
  [ 'score', 'lang', 'ref', ],
  {
    score: SwaggerNative.asInteger(
      undefined,
      { default: null, },
      swaggerUI(null, [ { lang: 'en', title: 'can be use as position/order', }, ])),
    lang: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'locales are sequenced in line by comma', }, ])),
    ref: SwaggerReferenceType,
  },
  swaggerUI(),
  [ 'score', ]);
export const SwaggerBannerType = new SwaggerObject(
  [ 'id', 'score', 'lang', 'ref', ],
  {
    id: SwaggerNative.asString(
      undefined,
      {immutable: true},
      swaggerUI()),
    score: SwaggerNative.asInteger(
      undefined,
      { default: null, },
      swaggerUI(null, [ { lang: 'en', title: 'can be use as position/order', }, ])),
    lang: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'locales are sequenced in line by comma', }, ])),
    ref: SwaggerReferenceType,
  },
  swaggerUI(),
  [ 'score', ]);
export const SwaggerBannersResponse = new SwaggerObject(
  [ 'data', 'status', ],
  {
    data: new SwaggerArray(
      undefined,
      {},
      swaggerUI()),
    status: undefined,

  },
  swaggerUI(),
  null);
export const SwaggerFieldValueType = new SwaggerObject(
  [ 'name', 'value', ],
  {
    name: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    value: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),

  },
  swaggerUI(null, [ { lang: 'en', title: 'to transport the value of predefined FieldType. The value is encoded to string before transport and back after receive', }, ]),
  [ 'name', 'value', ]);
export const SwaggerPetType = new SwaggerObject(
  [ 'id', 'fields', 'ref', ],
  {
    id: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    fields: new SwaggerArray(
      undefined,
      {},
      swaggerUI()),
    ref: new SwaggerArray(
      undefined,
      {},
      swaggerUI()),

  },
  swaggerUI(),
  null);
export const SwaggerPetTypeResponse = new SwaggerObject(
  [ 'data', 'status', ],
  {
    data: undefined,
    status: undefined,

  },
  swaggerUI(),
  null);
export const SwaggerSearchType = new SwaggerObject(
  [ 'id', 'resource', 'lang', 'title', 'summary', 'body', 'score', 'draft', 'tags', 'restriction', 'ref', 'fields', 'originalName', 'mimeType', 'created', 'comment', ],
  {
    id: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    resource: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    lang: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'page locale', }, ])),
    title: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'page\'s title', }, ])),
    summary: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'a summary of this page', }, ])),
    body: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'page\'s body', }, ])),
    score: SwaggerNative.asInteger(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'can be use as position/order', }, ])),
    draft: SwaggerNative.asBoolean(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'mark page as a draft', }, ])),
    tags: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'set of tags separated by comma defines what menu will expose this page', }, ])),
    restriction: SwaggerNative.asString(
      undefined,
      { enum: [ 'admin', 'writer', 'public', ], },
      swaggerUI(null, [ { lang: 'en', title: 'you can restrict the access to this page', }, ])),
    ref: new SwaggerArray(
      undefined,
      {},
      swaggerUI()),
    fields: new SwaggerArray(
      undefined,
      {},
      swaggerUI()),
    originalName: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    mimeType: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    created: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    comment: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),

  },
  swaggerUI(),
  null);
export const SwaggerSearchResponse = new SwaggerObject(
  [ 'data', 'status', ],
  {
    data: new SwaggerObject(
      [ 'scrollId', 'data', ],
      {
        scrollId: SwaggerNative.asString(
          undefined,
          {},
          swaggerUI()),
        data: new SwaggerArray(
          undefined,
          {},
          swaggerUI()),

      },
      swaggerUI(),
      null),
    status: undefined,

  },
  swaggerUI(),
  null);
export const SwaggerQueryType = new SwaggerObject(
  [ 'operator', 'fields', ],
  {
    operator: SwaggerNative.asString(
      undefined,
      { enum: [ 'and', 'or', ], default: 'and', },
      swaggerUI()),
    fields: new SwaggerArray(
      undefined,
      {},
      swaggerUI()),

  },
  swaggerUI(),
  null);
export const SwaggerUserType = new SwaggerObject(
  [ 'login', 'authType', 'password', 'role', 'created', 'enabled', ],
  {
    login: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    authType: SwaggerNative.asString(
      undefined,
      { enum: [ 'basic', 'apiKey', 'oauth2', ], },
      swaggerUI()),
    password: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    role: new SwaggerArray(
      SwaggerNative.asString(
        undefined,
        { enum: [ 'admin', 'writer', 'public', ], },
        swaggerUI()),
      {},
      swaggerUI()),
    created: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    enabled: SwaggerNative.asBoolean(
      undefined,
      {},
      swaggerUI()),

  },
  swaggerUI(),
  [ 'login', 'authType', ]);
export const UsersResponse = new SwaggerObject(
  [ 'data', 'status', ],
  {
    data: new SwaggerArray(
      undefined,
      {},
      swaggerUI()),
    status: undefined,

  },
  swaggerUI(),
  null);
export const SwaggerVoteType = new SwaggerObject(
  [ 'who', 'resId', 'voteId', 'vote', 'count', ],
  {
    who: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    resId: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    voteId: SwaggerNative.asNumber(
      undefined,
      {},
      swaggerUI()),
    vote: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    count: SwaggerNative.asNumber(
      undefined,
      {},
      swaggerUI()),

  },
  swaggerUI(),
  null);
export const SwaggerVotesResponse = new SwaggerObject(
  [ 'data', 'status', ],
  {
    data: new SwaggerArray(
      undefined,
      {},
      swaggerUI()),
    status: undefined,

  },
  swaggerUI(),
  null);
export const SwaggerCommentType = new SwaggerObject(
  [ 'id', 'created', 'resId', 'nickName', 'commentId', 'comment', 'isMy', 'vote', 'numberOf', ],
  {
    id: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    created: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    resId: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    nickName: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    commentId: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    comment: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    isMy: SwaggerNative.asBoolean(
      undefined,
      {},
      swaggerUI()),
    vote: new SwaggerArray(
      undefined,
      {},
      swaggerUI()),
    numberOf: SwaggerNative.asInteger(
      undefined,
      {},
      swaggerUI()),

  },
  swaggerUI(),
  null);
export const SwaggerCommentsResponse = new SwaggerObject(
  [ 'data', 'status', ],
  {
    data: new SwaggerObject(
      [ 'lastComment', 'numberOf', 'responses', ],
      {
        lastComment: SwaggerNative.asString(
          undefined,
          {},
          swaggerUI()),
        numberOf: SwaggerNative.asInteger(
          undefined,
          {},
          swaggerUI()),
        responses: new SwaggerArray(
          undefined,
          {},
          swaggerUI()),

      },
      swaggerUI(),
      null),
    status: undefined,

  },
  swaggerUI(),
  null);
