import {ErrorHandler, Inject, Injectable} from '@angular/core';
import {UILoggerToken} from '../shared/services-api';

@Injectable()
export class UIErrorHandler implements ErrorHandler {
  constructor(@Inject(UILoggerToken) private logger) {
  }
  handleError(error: any): void {
    this.logger.errback(error);
  }
}
