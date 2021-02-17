import {
  SwaggerNativeString,
  SwaggerNativeInteger,
  SwaggerObject,
  swaggerUI,
  SwaggerNativeBoolean,
  SwaggerArray, SwaggerNativeNumber
} from 'ui-lib';

export const StatusType = new SwaggerObject(
  ['code', 'message'],
  {
    code: new SwaggerNativeInteger(),
    details: new SwaggerObject([], {}),
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
export const TitleSwaggerType = new SwaggerObject(
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
  [ 'name', 'type', 'subtype', 'order', 'enumValues'],
  {
    name: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    type: new SwaggerNativeString(
      undefined,
      { enum: [ 'number', 'string', 'enum', 'date']},
      swaggerUI()),
    subtype: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    order: new SwaggerNativeInteger(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'define the order of displayed fields'}])),
    enumValues: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'input an enum definition as words separated by a comma', }, ])),

  },
  swaggerUI(),
  [ 'name', 'type', ]);
export const FieldsResponse = new SwaggerObject(
  [ 'data', 'status', ],
  {
    data: new SwaggerObject(
      [ 'fields', 'titles', ],
      {
        fields: new SwaggerArray(
          undefined,
          {},
          swaggerUI()),
        titles: new SwaggerArray(
          undefined,
          {},
          swaggerUI()),

      },
      swaggerUI(),
      [ 'fields', 'titles', ]),
    status: undefined,

  },
  swaggerUI(),
  null);
export const ReferenceType = new SwaggerObject(
  [ 'refId', 'targetUrl', 'mimeType', 'tooltip', ],
  {
    refId: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'file id', }, ])),
    targetUrl: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'the URL that was used as href in anchor tag', }, ])),
    mimeType: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    tooltip: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'descriptions of resource', }, ])),

  },
  swaggerUI(null, [ { lang: 'en', title: 'expose file as reference', }, ]),
  [ 'refId', ]);
export const PageType = new SwaggerObject(
  [ 'id', 'lang', 'title', 'summary', 'body', 'score', 'draft', 'tags', 'restriction', 'menuId', 'created', 'ref', ],
  {
    id: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    lang: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'page locale', }, ])),
    title: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'page\'s title', }, ])),
    summary: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'a summary of this page', }, ])),
    body: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'page\'s body', }, ])),
    score: new SwaggerNativeInteger(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'can be use as position/order', }, ])),
    draft: new SwaggerNativeBoolean(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'mark page as a draft', }, ])),
    tags: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'set of tags separated by comma defines what menu will expose this page', }, ])),
    restriction: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'you can restrict the access to this page', }, ])),
    menuId: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'bind a page to menu', }, ])),
    created: new SwaggerNativeString(
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
export const PageResponse = new SwaggerObject(
  [ 'data', 'status', ],
  {
    data: undefined,
    status: undefined,

  },
  swaggerUI(),
  null);
export const PagesResponse = new SwaggerObject(
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
export const FileType = new SwaggerObject(
  [ 'id', 'originalName', 'encoding', 'mimeType', 'size', 'created', 'comment', 'numberOfReferences', ],
  {
    id: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    originalName: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    encoding: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    mimeType: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    size: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    created: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    comment: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    numberOfReferences: new SwaggerNativeNumber(
      undefined,
      {},
      swaggerUI()),

  },
  swaggerUI(),
  null);
export const FileResponse = new SwaggerObject(
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
              refId: new SwaggerNativeString(
                undefined,
                {},
                swaggerUI()),
              refType: new SwaggerNativeString(
                undefined,
                { enum: [ 'banner', 'page', 'pet', ], },
                swaggerUI()),
              refName: new SwaggerNativeString(
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
export const FilesResponse = new SwaggerObject(
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
export const CarouselType = new SwaggerObject(
  [ 'assetId', 'targetUrl', 'mimeType', 'tooltip', 'resource', ],
  {
    assetId: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    targetUrl: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'can be url to external resource or id of internal resource', }, ])),
    mimeType: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    tooltip: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'descriptions of resource', }, ])),
    resource: new SwaggerNativeString(
      undefined,
      { enum: [ 'banner', 'page', 'pet', ], },
      swaggerUI()),

  },
  swaggerUI(null, [ { lang: 'en', title: 'expose references of banners, pets, pages', }, ]),
  null);
export const CarouselResponse = new SwaggerObject(
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
export const BannerType = new SwaggerObject(
  [ 'id', 'score', 'lang', 'ref', ],
  {
    id: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    score: new SwaggerNativeInteger(
      undefined,
      { default: null, },
      swaggerUI(null, [ { lang: 'en', title: 'can be use as position/order', }, ])),
    lang: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'locales are sequenced in line by comma', }, ])),
    ref: undefined,

  },
  swaggerUI(),
  [ 'score', ]);
export const BannersResponse = new SwaggerObject(
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
export const FieldValueType = new SwaggerObject(
  [ 'name', 'value', ],
  {
    name: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    value: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),

  },
  swaggerUI(null, [ { lang: 'en', title: 'to transport the value of predefined FieldType. The value is encoded to string before transport and back after receive', }, ]),
  [ 'name', 'value', ]);
export const PetType = new SwaggerObject(
  [ 'id', 'fields', 'ref', ],
  {
    id: new SwaggerNativeString(
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
export const PetTypeResponse = new SwaggerObject(
  [ 'data', 'status', ],
  {
    data: undefined,
    status: undefined,

  },
  swaggerUI(),
  null);
export const SearchType = new SwaggerObject(
  [ 'id', 'resource', 'lang', 'title', 'summary', 'body', 'score', 'draft', 'tags', 'restriction', 'ref', 'fields', 'originalName', 'mimeType', 'created', 'comment', ],
  {
    id: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    resource: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    lang: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'page locale', }, ])),
    title: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'page\'s title', }, ])),
    summary: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'a summary of this page', }, ])),
    body: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'page\'s body', }, ])),
    score: new SwaggerNativeInteger(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'can be use as position/order', }, ])),
    draft: new SwaggerNativeBoolean(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'mark page as a draft', }, ])),
    tags: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'set of tags separated by comma defines what menu will expose this page', }, ])),
    restriction: new SwaggerNativeString(
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
    originalName: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    mimeType: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    created: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    comment: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),

  },
  swaggerUI(),
  null);
export const SearchResponse = new SwaggerObject(
  [ 'data', 'status', ],
  {
    data: new SwaggerObject(
      [ 'scrollId', 'data', ],
      {
        scrollId: new SwaggerNativeString(
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
export const QueryType = new SwaggerObject(
  [ 'operator', 'fields', ],
  {
    operator: new SwaggerNativeString(
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
export const UserType = new SwaggerObject(
  [ 'login', 'authType', 'password', 'role', 'created', 'enabled', ],
  {
    login: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    authType: new SwaggerNativeString(
      undefined,
      { enum: [ 'basic', 'apiKey', 'oauth2', ], },
      swaggerUI()),
    password: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    role: new SwaggerArray(
      new SwaggerNativeString(
        undefined,
        { enum: [ 'admin', 'writer', 'public', ], },
        swaggerUI()),
      {},
      swaggerUI()),
    created: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    enabled: new SwaggerNativeBoolean(
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
export const VoteType = new SwaggerObject(
  [ 'who', 'resId', 'voteId', 'vote', 'count', ],
  {
    who: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    resId: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    voteId: new SwaggerNativeNumber(
      undefined,
      {},
      swaggerUI()),
    vote: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    count: new SwaggerNativeNumber(
      undefined,
      {},
      swaggerUI()),

  },
  swaggerUI(),
  null);
export const VotesResponse = new SwaggerObject(
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
export const CommentType = new SwaggerObject(
  [ 'id', 'created', 'resId', 'nickName', 'commentId', 'comment', 'isMy', 'vote', 'numberOf', ],
  {
    id: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    created: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    resId: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    nickName: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    commentId: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    comment: new SwaggerNativeString(
      undefined,
      {},
      swaggerUI()),
    isMy: new SwaggerNativeBoolean(
      undefined,
      {},
      swaggerUI()),
    vote: new SwaggerArray(
      undefined,
      {},
      swaggerUI()),
    numberOf: new SwaggerNativeInteger(
      undefined,
      {},
      swaggerUI()),

  },
  swaggerUI(),
  null);
export const CommentsResponse = new SwaggerObject(
  [ 'data', 'status', ],
  {
    data: new SwaggerObject(
      [ 'lastComment', 'numberOf', 'responses', ],
      {
        lastComment: new SwaggerNativeString(
          undefined,
          {},
          swaggerUI()),
        numberOf: new SwaggerNativeInteger(
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
