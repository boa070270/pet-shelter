import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PageComponent} from './page.component';
import {PetComponent} from './pet.component';
import {SafeHtmlPipe} from './safe-html.pipe';
import {ControlsModule, DynamicHTMLModule, } from 'ui-lib';
import {CardPetComponent} from './card-pet.component';
import {CardPageComponent} from './card-page.component';
import {TabletPetComponent} from './tablet-pet.component';
import {TabletPageComponent} from './tablet-page.component';
import {CarouselComponent} from './plugins/carousel.component';
import {RouterModule} from '@angular/router';
import {SearchTypeComponent} from './search-type.component';
import {BreadcrumbsComponent} from './breadcrumbs.component';
import { LengthenListComponent } from './plugins/lengthen-list.component';
import { VoteComponent } from './plugins/vote.component';

@NgModule({
  declarations: [
    PageComponent,
    PetComponent,
    SafeHtmlPipe,
    CardPetComponent,
    CardPageComponent,
    TabletPetComponent,
    TabletPageComponent,
    CarouselComponent,
    SearchTypeComponent,
    BreadcrumbsComponent,
    LengthenListComponent,
    VoteComponent
  ],
    exports: [
        PetComponent,
        PageComponent,
        SearchTypeComponent,
        CardPageComponent,
        BreadcrumbsComponent,
        CarouselComponent,
        LengthenListComponent
    ],
    imports: [
        CommonModule,
        DynamicHTMLModule,
        RouterModule,
        ControlsModule
    ],
})
export class ShelterCommonModule {}
