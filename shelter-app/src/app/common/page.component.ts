import {Component, Inject, Input, OnInit} from '@angular/core';
import {
  AbstractDataSource,
  ArrayDataSource,
  ShowMediaType, SYSTEM_LANG_TOKEN,
  SystemLang,
} from 'ui-lib';
import {BasicService} from '../basic.service';
import {ActivatedRoute} from '@angular/router';
import {PageType} from './types';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {PetComponent} from './pet.component';
import {CarouselComponent} from './plugins/carousel.component';
import {LengthenListComponent} from './plugins/lengthen-list.component';

// const COMPONENTS_TO_EDITOR: DynamicHTMLOptions = {
//   components: [
//     {component: PetComponent},
//     {component: CarouselComponent},
//     {component: LengthenListComponent}
//   ]
// };

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.sass'],
  // providers: [
  //   {provide: DynamicHTMLOptions, useValue: COMPONENTS_TO_EDITOR},
  //   {provide: DynamicHTMLRenderer, useClass: DynamicHTMLRenderer}
  // ]
})
export class PageComponent implements OnInit {
  @Input() data: PageType;
  @Input() id: string;
  body: SafeHtml;
  datasource: AbstractDataSource<ShowMediaType>;

  constructor(private service: BasicService, private route: ActivatedRoute,
              @Inject(SYSTEM_LANG_TOKEN) private systemLang: SystemLang,
              private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    if (!this.data) {
      const id = this.id || this.route.snapshot.paramMap.get('id');
      this.service.getPage(id).subscribe(data => {
        this.data = data;
        this.body = data.body;
        this.makeDataSource();
      });
    } else {
      this.body = this.data.body;
      this.makeDataSource();
    }
  }
  private makeDataSource(): void {
    if (this.data) {
      const refs = this.data.ref;
      if (refs) {
        this.datasource = new ArrayDataSource(refs.map(v => ({
          mediaType: v.mimeType,
          mediaURI: `/api/v1/assets/${v.refId}`
        })));
      }
    } else {
      this.datasource = new ArrayDataSource([]);
    }
  }
}
