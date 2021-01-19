import {Injectable, OnDestroy} from '@angular/core';
import {FieldAndTitlesType, FieldType, FieldTypeTypeEnum, FieldValueType} from './common/types';
import {BasicService} from './basic.service';
import {Subscription} from 'rxjs';
import {SystemLang} from 'ui-lib';

@Injectable({
  providedIn: 'root'
})
export class FieldsService implements OnDestroy {
  private fields: FieldAndTitlesType[];
  private readonly subscription: Subscription;

  constructor(private service: BasicService) {
    this.subscription = service.getFieldsDataSource().select().subscribe( v => {
      this.fields = v;
    });
  }
  ngOnDestroy(): void {
    console.log('destroy FieldsService');
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  getFields(): FieldAndTitlesType[] {
    return this.fields;
  }
  fieldValueAsString(fv: FieldValueType, systemLang: SystemLang): string {
    if (fv) {
      const f = this.fields.find(v => v.field.name === fv.name);
      if (f && f.titles && f.titles.length > 0) {
        return systemLang.getTitle(f.titles) + ': ' + fv.value;
      }
    }
  }
  fieldValueAsPair(fv: FieldValueType, systemLang: SystemLang): FieldValueType {
    if (fv) {
      const f = this.fields.find(v => v.field.name === fv.name);
      if (f && f.titles && f.titles.length > 0) {
        return {name: systemLang.getTitle(f.titles), value: fv.value};
      } else {
        return fv;
      }
    }
  }
  orderOfField(field: FieldValueType): number {
    if (this.fields) {
      const f = this.fields.find(v => v.field.name === field.name);
      if (f) {
        return f.field.order;
      }
    }
    return 100;
  }
  sortFields(fields: FieldValueType[]): FieldValueType[] {
    return fields.sort((a, b) => {
      return this.orderOfField(a) - this.orderOfField(b);
    });
  }
  firstFields(fields: FieldValueType[], numberOf: number): FieldValueType[] {
    const sorted = this.sortFields(fields);
    if (sorted.length > numberOf) {
      return sorted.slice(0, numberOf);
    }
    return sorted;
  }
}
