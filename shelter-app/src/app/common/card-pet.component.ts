import {Component, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {FieldValueType, PageType, PetType, ReferenceType} from './types';
import {BasicService} from '../basic.service';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import { IntervalObservableService } from 'ui-lib';
import {FieldsService} from '../fields.service';

@Component({
  selector: 'app-card-pet',
  templateUrl: './card-pet.component.html',
  styleUrls: ['./card-pet.component.sass']
})
export class CardPetComponent implements OnInit, OnDestroy {
  @Input() data: PetType;
  @Input() petId: string;
  @Input() animate = false;
  @Input() interval = 10;
  @Input() maxFields = 5;
  imgIndex = 0;
  imgSrc: string;
  fields: FieldValueType[];
  private subscription: Subscription;
  private intervalSubscription: Subscription;


  constructor(private service: BasicService, private route: ActivatedRoute,
              private intervalObservable: IntervalObservableService,
              private fieldService: FieldsService) { }

  ngOnInit(): void {
    if (!this.data) {
      const id = this.petId || this.route.snapshot.paramMap.get('id');
      this.subscription = this.service.getPet(id).subscribe(data => {
        this.data = data;
        this.fields = this.fieldService.firstFields(this.data.fields, this.maxFields);
        this.nextImg();
      });
    } else {
      this.nextImg();
    }
    if (this.animate) {
      this.intervalSubscription = this.intervalObservable.scheduler(() => this.nextImg(), this.interval);
    }
  }
  ngOnDestroy(): void {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
      this.intervalSubscription = null;
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  nextImg(): void {
    if (this.data.ref) {
      if (this.imgIndex > this.data.ref.length - 1) {
        this.imgIndex = 0;
      }
      this.imgSrc = '/api/v1/assets/' + this.data.ref[this.imgIndex++].refId;
    }
  }
}
