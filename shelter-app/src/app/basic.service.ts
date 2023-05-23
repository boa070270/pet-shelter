import {Inject, Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpEvent, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Observable, Subscription} from 'rxjs';
import {
  BROWSER_STORAGE,
  CommentResponse, DsDataType, DsType,
  LanguageType as UILanguageType,
  ObtainSystemLanguage,
  StorageService,
  UILogger,
  UILoggerToken,
  VoteType
} from 'ui-lib';
import {map, tap} from 'rxjs/operators';
import {
  BannerType,
  CarouselType,
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
  TitleType,
  UserType,
} from './common';
import {AuthorizationService} from './authorization.service';

const API_URL = '/api/v1';

@Injectable({
  providedIn: 'root'
})
export class BasicService implements ObtainSystemLanguage, OnDestroy {

  private authHeaders: Array<{ name: string, value: string | string[] }>;
  private authSubscription: Subscription;
  private clientId: string;

  constructor(@Inject(UILoggerToken) private logger: UILogger,
              private http: HttpClient, private authService: AuthorizationService,
              @Inject(BROWSER_STORAGE) private storage: StorageService) {
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
  /**** Lang ****/
  getLangs(): Observable<LanguageType[]> {
    this.logger.debug('getLangs');
    return this.http.get<HttpResponse<Response<LanguageType[]>>>(API_URL + '/lang', this.httpOptions()).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    }), map(resp => resp.data));
  }
  getSystemLanguages(): Observable<UILanguageType[]> {
    this.logger.debug('getSystemLanguages');
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
  deleteLanguage(lang: string): Observable<HttpResponse<IdResponse>> {
    return this.http.delete<HttpResponse<IdResponse>>(API_URL + `/lang/${lang}`, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  upsertLanguage(lang: UILanguageType): Observable<HttpResponse<IdResponse>> {
    this.logger.debug(lang);
    return this.http.post<HttpResponse<IdResponse>>(API_URL + '/lang', lang, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  selectLanguage(): Observable<HttpResponse<Response<LanguageType[]>>> {
    return this.http.get<HttpResponse<Response<LanguageType[]>>>(API_URL + '/lang', this.httpOptions()).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  /**** Menu ****/
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
  getMenus2(): Observable<HttpResponse<Response<MenusAndTitlesType>>> {
    return this.http.get<HttpResponse<Response<MenusAndTitlesType>>>(API_URL + '/menu', this.httpOptions()).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  upsetMenu2(menu: MenuType, titles: TitleType[]): Observable<HttpResponse<IdResponse>> {
    return this.http.post<HttpResponse<IdResponse>>(API_URL + '/menu', {menu, titles}, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  deleteMenu2(path: string): Observable<HttpResponse<IdResponse>> {
    return this.http.delete<HttpResponse<IdResponse>>(API_URL + `/menu/${path}`, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  /**** Fields ****/
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
  getFields2(): Observable<HttpResponse<Response<FieldsAndTitlesType>>> {
    return this.http.get<HttpResponse<Response<FieldsAndTitlesType>>>(API_URL + '/fields', this.httpOptions()).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  addField2(field: FieldAndTitlesType ): Observable<HttpResponse<IdResponse>> {
    return this.http.post<HttpResponse<IdResponse>>(API_URL + '/fields', field, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  deleteField2(name: string): Observable<HttpResponse<IdResponse>> {
    return this.http.delete<HttpResponse<IdResponse>>(API_URL + `/fields/${name}`, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }

  /**** Pets ****/
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
  getPets2(): Observable<HttpResponse<Response<PetType[]>>> {
    return this.http.get<HttpResponse<Response<PetType[]>>>(API_URL + '/pets', this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  addPet2(pet: PetType): Observable<HttpResponse<IdResponse>> {
    return this.http.post<HttpResponse<IdResponse>>(API_URL + '/pets', pet, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  updatePet2(pet: PetType): Observable<HttpResponse<IdResponse>> {
    return this.http.put<HttpResponse<IdResponse>>(API_URL + '/pets', pet, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  deletePet2(id: string): Observable<HttpResponse<IdResponse>> {
    return this.http.delete<HttpResponse<IdResponse>>(API_URL + `/pets/${id}`, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }

  /**** LargeObjects ****/
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
  getFiles2(): Observable<HttpResponse<Response<FileType[]>>> {
    return this.http.get<HttpResponse<Response<FileType[]>>>(API_URL + '/files', this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  deleteFile2(id: string): Observable<HttpResponse<IdResponse>> {
    return this.http.delete<HttpResponse<IdResponse>>(API_URL + `/files/${id}`, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  /**** Banners ****/
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
  getCarousel2(resource: string, lang?: string, count?: number, offset?: number): Observable<HttpResponse<Response<CarouselType[]>>> {
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
    return this.http.get<HttpResponse<Response<CarouselType[]>>>(API_URL + path, this.httpOptions()).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  getBanners2(): Observable<HttpResponse<Response<BannerType[]>>> {
    return this.http.get<HttpResponse<Response<BannerType[]>>>(API_URL + '/banners', this.httpOptions()).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  addBanner2(banner: BannerType): Observable<HttpResponse<IdResponse>> {
    return this.http.post<HttpResponse<IdResponse>>(API_URL + '/banners', banner, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  updateBanner2(banner: BannerType): Observable<HttpResponse<IdResponse>> {
    return this.http.put<HttpResponse<IdResponse>>(API_URL + '/banners', banner, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  deleteBanner2(id: string): Observable<HttpResponse<IdResponse>> {
    return this.http.delete<HttpResponse<IdResponse>>(API_URL + `/banners/${id}`, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
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
  /**** Pages ****/
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
  getPages2(): Observable<HttpResponse<Response<PageType[]>>> {
    return this.http.get<HttpResponse<Response<PageType[]>>>(API_URL + '/page', this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  addPage2(page: PageType): Observable<HttpResponse<IdResponse>> {
    return this.http.post<HttpResponse<IdResponse>>(API_URL + '/page', page, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  updatePage2(page: PageType): Observable<HttpResponse<IdResponse>> {
    console.log(page);
    return this.http.put<HttpResponse<IdResponse>>(API_URL + '/page', page, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  deletePage2(id: string): Observable<HttpResponse<IdResponse>> {
    return this.http.delete<HttpResponse<IdResponse>>(API_URL + `/page/${id}`, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  /**** Users ****/
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

  getUsers2(): Observable<HttpResponse<Response<UserType[]>>> {
    return this.http.get<HttpResponse<Response<UserType[]>>>(API_URL + '/user', this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  addUser2(user: UserType): Observable<HttpResponse<IdResponse>> {
    return this.http.post<HttpResponse<IdResponse>>(API_URL + '/user', user, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  updateUser2(user: UserType): Observable<HttpResponse<IdResponse>> {
    return this.http.put<HttpResponse<IdResponse>>(API_URL + '/user', user, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  deleteUser2(login: string): Observable<HttpResponse<IdResponse>> {
    return this.http.delete<HttpResponse<IdResponse>>(API_URL + `/user/${login}`, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  /**** Votes ****/
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
  getDs(): Observable<HttpResponse<Response<string[]>>> {
    this.logger.debug('getDs');
    return this.http.get<HttpResponse<Response<string[]>>>(API_URL + '/ds', this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  getDsFields(name): Observable<HttpResponse<Response<DsType>>> {
    this.logger.debug('getDsFields');
    return this.http.get<HttpResponse<Response<DsType>>>(API_URL + `/ds-fields/${name}`, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  getAllDsFields(): Observable<HttpResponse<Response<DsType[]>>> {
    this.logger.debug('getDsAllFields');
    return this.http.get<HttpResponse<Response<DsType[]>>>(API_URL + '/ds-fields', this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  addDs(ds): Observable<HttpResponse<IdResponse>> {
    this.logger.debug('addDs');
    return this.http.put<HttpResponse<IdResponse>>(API_URL + '/ds', ds , this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  deleteDs(name): Observable<HttpResponse<IdResponse>> {
    this.logger.debug('deleteDs');
    return this.http.delete<HttpResponse<IdResponse>>(API_URL + `/ds/${name}`, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  deleteDsData(ds): Observable<HttpResponse<IdResponse>> {
    this.logger.debug('deleteDsData');
    return this.http.post<HttpResponse<IdResponse>>(API_URL + `/ds-data/${ds.ds}`, ds.filter, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  addDsData(ds): Observable<HttpResponse<IdResponse>> {
    this.logger.debug('addDsData');
    return this.http.put<HttpResponse<IdResponse>>(API_URL + '/ds-data', ds , this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  getDsData(ds): Observable<HttpResponse<Response<{ds: string, data: DsDataType[]}>>> {
    this.logger.debug('getDsFields');
    return this.http.get<HttpResponse<Response<{ds: string, data: DsDataType[]}>>>(API_URL + `/ds-data/${ds}`, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
  updateDsData(ds): Observable<HttpResponse<IdResponse>> {
    this.logger.debug('updateDsFields');
    return this.http.post<HttpResponse<IdResponse>>(API_URL + `/ds-data`, ds, this.httpOptions(true)).pipe(
      tap(r => this.setClientId(r.headers.get('x-client-id')))
    );
  }
}

