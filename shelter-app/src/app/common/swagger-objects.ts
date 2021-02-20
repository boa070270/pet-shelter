import {
  SwaggerNativeString,
  SwaggerNativeInteger,
  SwaggerObject,
  swaggerUI,
  SwaggerNativeBoolean,
  SwaggerArray, SwaggerNativeNumber, SwaggerNative
} from 'ui-lib';

export const SwaggerStatusType = new SwaggerObject(
  ['code', 'message'],
  {
    code: SwaggerNative.asInteger(),
    details: new SwaggerObject([], {}),
    message: SwaggerNative.asString()
  }
);

export const SwaggerLanguageType = new SwaggerObject(
  ['lang', 'displayName', 'rate'],
  {
    lang: SwaggerNative.asString(
      'input',
      {minLength: 2, maxLength: 6},
      swaggerUI(
        [{lang: 'en', title: 'Lang'}, {lang: 'uk', title: 'Мова'}],
        [{lang: 'en', title: 'Language code'}, {lang: 'uk', title: 'Коротка назва (en, uk)'}],
        [{lang: 'en', title: 'enter tooltip'}, {lang: 'uk', title: 'enter tooltip'}],
        [{lang: 'en', title: 'enter placeholder'}, {lang: 'uk', title: 'enter placeholder'}],
      )
    ),
    displayName: SwaggerNative.asString(
      'input',
      {minLength: 3, maxLength: 16},
      swaggerUI(
        [{lang: 'en', title: 'Display'}, {lang: 'uk', title: 'Відображати'}],
        [{lang: 'en', title: 'Language code'}, {lang: 'uk', title: 'Коротка назва (en, uk)'}],
        [{lang: 'en', title: 'enter tooltip'}, {lang: 'uk', title: 'enter tooltip'}],
        [{lang: 'en', title: 'enter placeholder'}, {lang: 'uk', title: 'enter placeholder'}],
      )
    ),
    rate: SwaggerNative.asInteger(
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

export const SwaggerMenuType = new SwaggerObject(
  ['path', 'component', 'role', 'position', 'parentId'],
  {
    path: SwaggerNative.asString(),
    component: SwaggerNative.asString(),
    role: SwaggerNative.asString(),
    position: SwaggerNative.asInteger(),
    parentId: SwaggerNative.asString()
  },
  swaggerUI(),
  ['path', 'component']
);
export const SwaggerTitleSwaggerType = new SwaggerObject(
  ['id', 'lang', 'title'],
  {
    id: SwaggerNative.asString(),
    lang: SwaggerNative.asString(),
    title: SwaggerNative.asString()
  },
  {},
  ['id', 'lang', 'title']
);
export const SwaggerFieldType = new SwaggerObject(
  [ 'name', 'type', 'subtype', 'order', 'enumValues'],
  {
    name: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    type: SwaggerNative.asString(
      undefined,
      { enum: [ 'number', 'string', 'enum', 'date']},
      swaggerUI()),
    subtype: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    order: SwaggerNative.asInteger(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'define the order of displayed fields'}])),
    enumValues: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'input an enum definition as words separated by a comma', }, ])),

  },
  swaggerUI(),
  [ 'name', 'type', ]);
export const SwaggerFieldsResponse = new SwaggerObject(
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
export const SwaggerBannerType = new SwaggerObject(
  [ 'id', 'score', 'lang', 'ref', ],
  {
    id: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI()),
    score: SwaggerNative.asInteger(
      undefined,
      { default: null, },
      swaggerUI(null, [ { lang: 'en', title: 'can be use as position/order', }, ])),
    lang: SwaggerNative.asString(
      undefined,
      {},
      swaggerUI(null, [ { lang: 'en', title: 'locales are sequenced in line by comma', }, ])),
    ref: undefined,

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
