import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpEvent, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Observable, Subscription} from 'rxjs';
import {BaseDataSource, BrowserStorageService} from 'ui-lib';
import {map} from 'rxjs/operators';
import {
  BannerType,
  CarouselType, CommentType,
  convertFieldsToFieldArray,
  FieldAndTitlesType,
  FieldsAndTitlesType,
  FileDetailsType,
  FileType,
  IdResponse,
  LanguageType,
  MenuAndTitlesType,
  MenusAndTitlesType,
  MenuType,
  PageType,
  PetType,
  QueryType,
  Response,
  SearchResult,
  TitleType, UserType,
} from './common/types';
import {fromPromise} from 'rxjs/internal-compatibility';
import {AuthorizationService} from './authorization.service';
import {CommentResponse, ObtainSystemLanguage, LanguageType as UILanguageType, VoteType} from 'ui-lib';

const API_URL = '/api/v1';

@Injectable({
  providedIn: 'root'
})
export class BasicService implements ObtainSystemLanguage, OnDestroy {

  private dataSourceLang: DataSourceLang;
  private dataSourceFiles: DataSourceFiles;
  private dataSourceFields: DataSourceFields;
  private authHeaders: Array<{name: string, value: string | string[]}>;
  private authSubscription: Subscription;
  private clientId: string;

  constructor(private http: HttpClient, private authService: AuthorizationService, private storage: BrowserStorageService) {
    this.authSubscription = authService.authEmitter.subscribe(u => {
      if (u) {
        this.authHeaders = u.authHeaders;
      } else {
        this.authHeaders = null;
      }
    });
    this.clientId = storage.get('x-client-id');
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }
  private setClientId(clientId): void {
    if (clientId && this.clientId !== clientId) {
      this.clientId = clientId;
      this.storage.set('x-client-id', this.clientId);
    }
  }
  private addAuthHeader(headers: any): void {
    if (this.authHeaders) {
      for (const v of this.authHeaders) {
        headers[v.name] = v.value;
      }
    }
  }
  httpOptions(withAuth: boolean = false, extHeader?: any): object {
    const headers = {'Content-Type': 'application/json'};
    if (extHeader && typeof extHeader === 'object') {
      for (const [key, value] of Object.entries(extHeader)) {
        headers[key] = value;
      }
    }
    if (this.clientId) {
      headers['X-Client-ID'] = this.clientId;
    }
    if (withAuth) {
      this.addAuthHeader(headers);
    }
    return {
      headers: new HttpHeaders(headers),
      observe: 'response'
    };
  }
  getLangs(): Observable<LanguageType[]> {
    return this.http.get<HttpResponse<Response<LanguageType[]>>>(API_URL + '/lang', this.httpOptions()).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }
  getSystemLanguages(): Observable<UILanguageType[]> {
    return this.http.get<HttpResponse<Response<UILanguageType[]>>>(API_URL + '/lang', this.httpOptions()).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }


  upsetLang(lang: LanguageType): Observable<string> {
    return this.http.post<HttpResponse<IdResponse>>(API_URL + '/lang', lang, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  deleteLang(lang: string): Observable<string> {
    return this.http.delete<HttpResponse<IdResponse>>(API_URL + `/lang/${lang}`, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  getMenus(): Observable<MenusAndTitlesType> {
    return this.http.get<HttpResponse<Response<MenusAndTitlesType>>>(API_URL + '/menu', this.httpOptions()).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }

  upsetMenu(menu: MenuType, titles: TitleType[]): Observable<string> {
    return this.http.post<HttpResponse<IdResponse>>(API_URL + '/menu', {menu, titles}, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  getMenu(path): Observable<MenuAndTitlesType> {
    return this.http.get<HttpResponse<Response<MenuAndTitlesType>>>(API_URL + '/menu/${path}', this.httpOptions()).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }

  deleteMenu(path: string): Observable<string> {
    return this.http.delete<HttpResponse<IdResponse>>(API_URL + `/menu/${path}`, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  getFields(): Observable<FieldsAndTitlesType> {
    return this.http.get<HttpResponse<Response<FieldsAndTitlesType>>>(API_URL + '/fields', this.httpOptions()).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }

  addField(field: FieldAndTitlesType ): Observable<string> {
    return this.http.post<HttpResponse<IdResponse>>(API_URL + '/fields', field, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  deleteField(name: string): Observable<string> {
    return this.http.delete<HttpResponse<IdResponse>>(API_URL + `/fields/${name}`, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  getPets(): Observable<PetType[]> {
    return this.http.get<HttpResponse<Response<PetType[]>>>(API_URL + '/pets', this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }

  addPet(pet: PetType): Observable<string> {
    return this.http.post<HttpResponse<IdResponse>>(API_URL + '/pets', pet, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  updatePet(pet: PetType): Observable<string> {
    return this.http.put<HttpResponse<IdResponse>>(API_URL + '/pets', pet, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  getPet(id: string): Observable<PetType> {
    return this.http.get<HttpResponse<Response<PetType>>>(API_URL + `/pets/${id}`, this.httpOptions()).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }

  deletePet(id: string): Observable<string> {
    return this.http.delete<HttpResponse<IdResponse>>(API_URL + `/pets/${id}`, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  read(id: string): Observable<any> {
    return this.http.get<any>(API_URL + `/assets/${id}`, this.httpOptions());
  }

  upload(file: File, comment?: string): Observable<HttpEvent<any>> {
    const formData = new FormData();
    const headers = {};
    this.addAuthHeader(headers);
    formData.append('upfile', file);
    if (comment) {
      formData.append('comment', comment);
    }
    return this.http.post<HttpResponse<IdResponse>>(API_URL + '/files', formData,
      {reportProgress: true, observe: 'events', headers: new HttpHeaders(headers)}
    );
  }

  getFiles(): Observable<FileType[]> {
    return this.http.get<HttpResponse<Response<FileType[]>>>(API_URL + '/files', this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }

  getFile(id: string): Observable<FileDetailsType> {
    return this.http.get<HttpResponse<Response<FileDetailsType>>>(API_URL + `/files/${id}`, this.httpOptions()).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }

  deleteFile(id: string): Observable<string> {
    return this.http.delete<HttpResponse<IdResponse>>(API_URL + `/files/${id}`, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  getCarousel(resource: string, lang?: string, count?: number, offset?: number): Observable<CarouselType[]> {
    let path = `/carousel/${resource}`;
    const params = [];
    if (lang) {
      params.push('lang=' + lang);
    }
    if (count) {
      params.push('count=' + count);
    }
    if (offset + 1 > 0) {
      params.push('offset=' + offset);
    }
    if (params.length > 0) {
      path = path + '?' + params.join('&');
    }
    return this.http.get<HttpResponse<Response<CarouselType[]>>>(API_URL + path, this.httpOptions()).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }

  getBanners(): Observable<BannerType[]> {
    return this.http.get<HttpResponse<Response<BannerType[]>>>(API_URL + '/banners', this.httpOptions()).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }

  addBanner(banner: BannerType): Observable<string> {
    return this.http.post<HttpResponse<IdResponse>>(API_URL + '/banners', banner, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  updateBanner(banner: BannerType): Observable<string> {
    return this.http.put<HttpResponse<IdResponse>>(API_URL + '/banners', banner, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  deleteBanner(id: string): Observable<string> {
    return this.http.delete<HttpResponse<IdResponse>>(API_URL + `/banners/${id}`, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  search(index?: string, lang?: string, query?: string, size?: number, from?: number): Observable<SearchResult> {
    const params = [];
    if (lang) {
      params.push('lang=' + lang);
    }
    if (query) {
      params.push('query=' + query);
    }
    if (index) {
      params.push('index=' + index);
    }
    if (size > 0) {
      params.push('size=' + size);
    }
    if (from) {
      params.push('from=' + from);
    }
    let path = '/search';
    if (params.length > 0) {
      path = path + '?' + params.join('&');
    }
    return this.http.get<HttpResponse<Response<SearchResult>>>(API_URL + path, this.httpOptions()).pipe(map(resp => {
        this.setClientId(resp.headers.get('x-client-id'));
        return resp.body;
      }),
      map(resp => resp.data));
  }

  searchPet(query: QueryType, size?: number, from?: number): Observable<SearchResult> {
    const params = [];
    if (size > 0) {
      params.push('count=' + size);
    }
    if (from) {
      params.push('from=' + from);
    }
    let path = '/search-pet';
    if (params.length > 0) {
      path = path + '?' + params.join('&');
    }
    return this.http.post<HttpResponse<Response<SearchResult>>>(API_URL + path, query, this.httpOptions()).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }

  getPages(): Observable<PageType[]> {
    return this.http.get<HttpResponse<Response<PageType[]>>>(API_URL + '/page', this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }
  getPage(id: string): Observable<PageType> {
    return this.http.get<HttpResponse<Response<PageType>>>(API_URL + `/page/${id}`, this.httpOptions()).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }
  getPageMenu(menuId: string): Observable<PageType> {
    return this.http.get<HttpResponse<Response<PageType>>>(API_URL + `/page-to-path?menuId=${menuId}`, this.httpOptions()).pipe(
      map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }

  addPage(page: PageType): Observable<string> {
    return this.http.post<HttpResponse<IdResponse>>(API_URL + '/page', page, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  updatePage(page: PageType): Observable<string> {
    console.log(page);
    return this.http.put<HttpResponse<IdResponse>>(API_URL + '/page', page, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  deletePage(id: string): Observable<string> {
    return this.http.delete<HttpResponse<IdResponse>>(API_URL + `/page/${id}`, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  getUsers(): Observable<UserType[]> {
    return this.http.get<HttpResponse<Response<UserType[]>>>(API_URL + '/user', this.httpOptions(true)).pipe(
      map(resp => {
        this.setClientId(resp.headers.get('x-client-id'));
        return resp.body;
      }),
      map(resp => resp.data)
    );
  }

  addUser(user: UserType): Observable<string> {
    return this.http.post<HttpResponse<IdResponse>>(API_URL + '/user', user, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  updateUser(user: UserType): Observable<string> {
    return this.http.put<HttpResponse<IdResponse>>(API_URL + '/user', user, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }

  deleteUser(login: string): Observable<string> {
    return this.http.delete<HttpResponse<IdResponse>>(API_URL + `/user/${login}`, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }
  // Votes
  getVotes(resId: string): Observable<VoteType[]> {
    return this.http.get<HttpResponse<Response<VoteType[]>>>(API_URL + `/vote/${resId}`, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }
  vote(resId: string, vote: string, voteId?: number): Observable<string> {
    const body: any = {vote};
    if (voteId) {
      body.voteId = voteId;
    }
    return this.http.post<HttpResponse<IdResponse>>(API_URL + `/vote/${resId}`, body, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }
  getComments(resId: string, size?: number, from?: number, commentId?: string): Observable<CommentResponse> {
    const params = [];
    if (size > 0) {
      params.push('size=' + size);
    }
    if (from) {
      params.push('from=' + from);
    }
    if (commentId) {
      params.push('commentId=' + commentId);
    }
    let path = `/comment/${resId}`;
    if (params.length > 0) {
      path = path + '?' + params.join('&');
    }
    return this.http.get<HttpResponse<Response<CommentResponse>>>(API_URL + path, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }
  addComment(resId: string, comment: string, nickName?: string, commentId?: string): Observable<string> {
    const body: any = {comment};
    if (nickName) {
      body.nickName = nickName;
    }
    if (commentId) {
      body.commentId = commentId;
    }
    return this.http.post<HttpResponse<IdResponse>>(API_URL + `/comment/${resId}`, body, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }
  updateComment(resId: string, comment: string, commentId: string): Observable<string> {
    const body: any = {comment, commentId};
    return this.http.post<HttpResponse<IdResponse>>(API_URL + `/comment/${resId}`, body, this.httpOptions(true)).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data.id));
  }
  // common datasource
  getLangDataSource(): DataSourceLang {
    if (!this.dataSourceLang) {
      this.dataSourceLang = new DataSourceLang(this);
    }
    return this.dataSourceLang;
  }
  getFilesDataSource(): DataSourceFiles {
    if (!this.dataSourceFiles) {
      this.dataSourceFiles = new DataSourceFiles(this);
    }
    return this.dataSourceFiles;
  }
  getFieldsDataSource(): DataSourceFields {
    if (!this.dataSourceFields) {
      this.dataSourceFields = new DataSourceFields(this);
    }
    return this.dataSourceFields;
  }
}

class DataSourceLang extends BaseDataSource<LanguageType> {

  constructor(private service: BasicService) {
    super(service.getLangs());
  }

  delete(rows: LanguageType[]): Observable<any> {
    const promises = [];
    for (const r of rows) {
      promises.push(this.service.deleteLang(r.lang).toPromise());
    }
    return fromPromise(Promise.all(promises));
  }

  insert(row: LanguageType): Observable<any> {
    return this.service.upsetLang(row);
  }

  update(row: LanguageType): Observable<any> {
    return this.service.upsetLang(row);
  }

  refresh(): void {
    this._dataStream.newSource(this.service.getLangs());
  }
}

class DataSourceFiles extends BaseDataSource<FileType>{

  constructor(private service: BasicService) {
    super(service.getFiles());
  }

  delete(rows: FileType[]): Observable<any> {
    const promises = [];
    for (const file of rows) {
      promises.push(this.service.deleteFile(file.id).toPromise());
    }
    return fromPromise(Promise.all(promises));
  }

  refresh(): void {
    this._dataStream.newSource(this.service.getFiles());
  }
  getFile(id: string): Observable<FileDetailsType> {
    return this.service.getFile(id);
  }
}

class DataSourceFields extends BaseDataSource<FieldAndTitlesType>{

  constructor(private service: BasicService) {
    super(service.getFields().pipe(map(value => convertFieldsToFieldArray(value))));
  }

  delete(rows: FieldAndTitlesType[]): Observable<any> {
    const promises = [];
    for (const r of rows) {
      promises.push(this.service.deleteField(r.field.name).toPromise());
    }
    return fromPromise(Promise.all(promises));
  }

  insert(row: FieldAndTitlesType): Observable<any> {
    return this.service.addField(row);
  }

  update(row: FieldAndTitlesType): Observable<any> {
    return this.service.addField(row);
  }

  refresh(): void {
    this._dataStream.newSource(
      this.service.getFields().pipe(map(value => convertFieldsToFieldArray(value)))
    );
  }
}
