import {ErrorHandler, Inject, Injectable} from '@angular/core';
import {UILogger, UILoggerToken} from '../shared';

@Injectable()
export class UIErrorHandler implements ErrorHandler {
  constructor(@Inject(UILoggerToken) private logger: UILogger) {
  }
  handleError(error: any): void {
    this.logger.error('{0}', error);
  }
}
