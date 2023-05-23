import {Component} from '@angular/core';
import {HTML1, HTML2} from '../mock/test-data';

@Component({
  selector: 'app-test-sync',
  templateUrl: './test-sync.component.html',
  styleUrls: ['./test-sync.component.scss']
})
export class TestSyncComponent {
  src: any = HTML2;

}
