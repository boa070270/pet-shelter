import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FieldValueType, PetType} from './types';
import {Subscription} from 'rxjs';
import {BasicService} from '../basic.service';
import {ActivatedRoute} from '@angular/router';
import {IntervalObservableService} from 'ui-lib';
import {FieldsService} from '../fields.service';
import {SystemLang} from 'ui-lib';

@Component({
  selector: 'app-tablet-pet',
  templateUrl: './tablet-pet.component.html',
  styleUrls: ['./tablet-pet.component.sass']
})
export class TabletPetComponent implements OnInit, OnDestroy {
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
              private fieldService: FieldsService,
              private systemLang: SystemLang) { }

  ngOnInit(): void {
    if (!this.data) {
      const id = this.petId || this.route.snapshot.paramMap.get('id');
      this.subscription = this.service.getPet(id).subscribe(data => {
        this.data = data;
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
    const source = this.fieldService.firstFields(this.data.fields, this.maxFields);
    this.fields = [];
    for (const f of source) {
      this.fields.push(this.fieldService.fieldValueAsPair(f, this.systemLang));
    }
    if (this.data.ref) {
      if (this.imgIndex > this.data.ref.length - 1) {
        this.imgIndex = 0;
      }
      this.imgSrc = '/api/v1/assets/' + this.data.ref[this.imgIndex++].refId;
    }
  }
}
