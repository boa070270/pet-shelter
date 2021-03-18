import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BasicService} from './basic.service';
import {AbstractComponent, DictionaryService, SystemLang} from 'ui-lib';

const I18N = {
  searchCaption: [{lang: 'en', title: 'Search'}, {lang: 'uk', title: 'Пошук'}],
  searchDescription: [{lang: 'en', title: 'Full text search for this site'}, {lang: 'uk', title: 'Повнотекстовий пошук по сайту'}],
  searchTooltip: [{lang: 'en', title: 'Input search phrase'}, {lang: 'uk', title: 'Введіть строку пошуку'}],
  searchPlaceholder: [{lang: 'en', title: 'any words, asterisk'}, {lang: 'uk', title: 'люьий вислів, зірочка'}],
  displayCaption: [{lang: 'en', title: 'Display as'}, {lang: 'uk', title: 'Відображати як'}],
};

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.sass'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class SearchPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  query: string;
  queryOut: string;
  private size = 20;
  place: string;
  displayAs: string;
  displayOptions: ['card', 'tablet'];
  placeOptions: ['all', 'page', 'pet', 'asset'];
  constructor(private route: ActivatedRoute, private service: BasicService,
              public systemLang: SystemLang, dictionary: DictionaryService) {
    super(systemLang, dictionary.getAppDictionary('SearchPageComponent', I18N));
  }

  ngOnInit(): void {
    this.displayAs = 'card';
    if (!this.place) {
      this.place = 'all';
    }
    this.query = this.route.snapshot.paramMap.get('query');
    this.queryOut = this.query;
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  clickSearch(): void {
    this.queryOut = this.query;
  }
}
