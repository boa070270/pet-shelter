import {Inject, Injectable, OnDestroy} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisibilityChangeService implements OnDestroy {
  private hiddenProperty = 'hidden';
  private visibilityChange = 'visibilitychange';
  private subject = new Subject<boolean>();
  private readonly listener = () => { this.handleVisibilityChange(); };

  constructor(@Inject(DOCUMENT) private document: Document) {
    console.log('constructor VisibilityChangeService');
    if (typeof document.hidden === 'undefined') {
      const browserPrefixes = ['moz', 'ms', 'o', 'webkit'];
      for (const prefix of browserPrefixes) {
        const chk = prefix + 'Hidden';
        if (typeof (document as any)[chk] !== 'undefined') {
          this.hiddenProperty = chk;
          this.visibilityChange = prefix + 'visibilitychange';
        }
      }
    }
    document.addEventListener(this.visibilityChange, this.listener, false);
  }

  ngOnDestroy(): void {
    this.document.removeEventListener(this.visibilityChange, this.listener);
  }
  handleVisibilityChange(): void {
    if (this.document[this.hiddenProperty]) {
      console.log('hidden');
      this.subject.next(false);
    } else {
      console.log('show');
      this.subject.next(true);
    }
  }
  hiddenName(): string {
    return this.hiddenProperty;
  }
  visibilityChangeName(): string {
    return this.visibilityChange;
  }
  observable(): Observable<boolean> {
    return this.subject;
  }
}
