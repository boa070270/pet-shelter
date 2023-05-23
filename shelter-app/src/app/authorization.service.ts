import {EventEmitter, Injectable} from '@angular/core';
import {Response, UserType} from './common';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map, tap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {DialogRef, DialogService, ExtendedData, SwaggerNative, SwaggerObject, swaggerUI} from 'ui-lib';
import {UrlTree} from '@angular/router';

const I18N = {
  user_caption: [{lang: 'en', title: 'User name'}, {lang: 'uk', title: 'І\'мя користувача'}],
  user_description: [{lang: 'en', title: 'Please, input your user name or email'}, {lang: 'uk', title: 'Будьласка, введіть свій логін'}],
  user_tooltip: [{lang: 'en', title: 'Input your user name or email'}, {lang: 'uk', title: 'введіть свій логін'}],
  user_placeholder: [{lang: 'en', title: 'login or email'}, {lang: 'uk', title: 'логін або email'}],

  psw_caption: [{lang: 'en', title: 'Password'}, {lang: 'uk', title: 'Пароль'}],
  psw_description: [{lang: 'en', title: 'Please, input your password'}, {lang: 'uk', title: 'Будьласка, введіть свій пароль'}],
  psw_tooltip: [{lang: 'en', title: 'Input your user name or password'}, {lang: 'uk', title: 'введіть свій пароль'}],
  psw_placeholder: [{lang: 'en', title: 'password'}, {lang: 'uk', title: 'пароль'}],
  err: [{lang: 'en', title: 'Incorrect user name or password'}, {lang: 'uk', title: 'Будьласка, введіть свій пароль'}]
};
const DLG = new SwaggerObject(
  ['login', 'password'],
  {
    login: SwaggerNative.asString(null, null,
      swaggerUI(I18N.user_caption, I18N.user_description, I18N.user_tooltip, I18N.user_placeholder)),
    password: SwaggerNative.asString(null, {format: 'password'},
      swaggerUI(I18N.psw_caption, I18N.psw_description, I18N.psw_tooltip, I18N.psw_placeholder)),
  },
  null,
  ['login', 'password']);

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  authEmitter = new EventEmitter<UserType>();
  redirectUrl: string;
  private user: UserType;

  constructor(private http: HttpClient, private dialog: DialogService) {}

  getRoles(): string[] {
    if (this.user) {
      return this.user.role;
    }
    return null;
  }
  logOut(): void {
    this.user = null;
    this.authEmitter.emit(this.user);
  }
  logInBasic(userName, password): Observable<UserType> {
    const value = 'Basic ' + window.btoa(userName + ':' + password);
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: value
      })
    };
    return this.http.get<Response<UserType>>('/api/v1/login', options).pipe(
      map(resp => resp.data),
      tap(v => {
        this.user = v;
        this.user.authHeaders = [{name: 'Authorization', value}];
        this.authEmitter.emit(this.user);
      })
    );
  }
  private openDialog(): DialogRef<any> {
    const extData = ExtendedData.create({}, false, DLG, 'yes_no', 'Authorization', 'gm-login', 'info-color');
    return this.dialog.infoExtDialog(extData, true);
  }

  hasRight(mRole: string[]): Observable<boolean | UrlTree> {
    if (this.user) {
      return of(!!this.user.role.find(r => mRole.includes(r)));
    }
    return new Observable<boolean>(obs => {
      const dlgRef = this.openDialog();
      dlgRef.afterClosed().subscribe( d => {
        if (d) {
            this.logInBasic(d.login, d.password).subscribe( u => {
              if (u && u.role && u.role.find(r => mRole.includes(r)) !== undefined ) {
                obs.next(true);
              } else {
                obs.next(false);
              }
            },
              err => {
                obs.error(err);
              });
        } else {
          this.logOut();
          obs.next(false);
        }
      });
    });
  }
}
