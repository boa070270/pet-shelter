import {Injectable, Type} from '@angular/core';

export interface ComponentWithSelector {
  selector?: string;
  component: Type<any>;
}

@Injectable()
export class DynamicHTMLOptions {
  components: Array<ComponentWithSelector>;
}
