import {Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef} from '@angular/core';
import {PageType, PetType, SearchType} from './types';
import {CardPageComponent} from './card-page.component';
import {TabletPageComponent} from './tablet-page.component';
import {CardPetComponent} from './card-pet.component';
import {TabletPetComponent} from './tablet-pet.component';
import {ComponentType} from '@angular/cdk/overlay';

@Component({
  selector: 'app-search-type',
  templateUrl: './search-type.component.html',
  styleUrls: ['./search-type.component.sass']
})
export class SearchTypeComponent implements OnInit, OnChanges {
  @Input() searchType: SearchType;
  @Input() displayAs: string;
  key: string;

  constructor() { }

  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.key = this.searchType.resource;
    if (this.searchType.resource !== 'asset') {
      if (!this.displayAs) {
        this.displayAs = 'tablet';
      }
      this.key = this.displayAs + '_' + this.searchType.resource;
    }
  }

}
