import {Component} from '@angular/core';
import {DEF_TEMPLATE} from 'ui-lib';

@Component({
  selector: 'app-test-sync',
  templateUrl: './test-sync.component.html',
  styleUrls: ['./test-sync.component.scss']
})
export class TestSyncComponent {
  src: any = DEF_TEMPLATE;
}
