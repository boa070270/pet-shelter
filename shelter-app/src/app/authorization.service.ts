import {EventEmitter, Injectable} from '@angular/core';
import {Response, UserType} from './common/types';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, map, tap} from 'rxjs/operators';
import {from, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  authEmitter = new EventEmitter<UserType>();
  redirectUrl: string;
  private user: UserType;

  constructor(private http: HttpClient) {}

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
  logInBasic(userName, password): Observable<boolean> {
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
      }),
      map(() => {
        return !!this.user;
      }),
      catchError((err, caught) => {
        console.log(err, caught);
        // @ts-ignore
        return from(false);
      }));
  }
}
