import {Inject, Injectable} from '@angular/core';
import {BROWSER_STORAGE, LogLevel, StorageService, UILogWriter} from 'ui-lib';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Response} from './common';
import {map} from 'rxjs/operators';

const API_URL = '/api/v1';

@Injectable({
  providedIn: 'root'
})
export class LogWriterService implements UILogWriter{
  private clientId: string;

  constructor(private http: HttpClient, @Inject(BROWSER_STORAGE) private storage: StorageService) {
    this.clientId = storage.get('x-client-id');
  }
  httpOptions(extHeader?: any): object {
    const headers = {'Content-Type': 'application/json'};
    if (extHeader && typeof extHeader === 'object') {
      for (const [key, value] of Object.entries(extHeader)) {
        headers[key] = value;
      }
    }
    if (this.clientId) {
      headers['X-Client-ID'] = this.clientId;
    }
    return {
      headers: new HttpHeaders(headers),
      observe: 'response'
    };
  }
  private setClientId(clientId): void {
    if (clientId && this.clientId !== clientId) {
      this.clientId = clientId;
      this.storage.set('x-client-id', this.clientId);
    }
  }
  /**** LogWriter ****/
  write(date: Date, level: LogLevel, message: string): void {
    // tslint:disable-next-line:max-line-length
    console.log(`LogWriterService.write: ${date.toISOString()} | ${LogLevel[level]} | ${message}`);
    this.http.post<HttpResponse<Response<string>>>(API_URL + '/log',
      {date, level: LogLevel[level], message}, this.httpOptions()).pipe(map(resp => {
      this.setClientId(resp.headers.get('x-client-id'));
      return resp.body;
    })).subscribe(() => {});
  }

}
