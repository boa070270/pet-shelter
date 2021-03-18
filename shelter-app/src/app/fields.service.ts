import {Injectable, OnDestroy} from '@angular/core';
import {FieldAndTitlesType, FieldTypeUI, FieldValueType} from './common/types';
import {BehaviorSubject, Subscription} from 'rxjs';
import {CdkDataSource, SystemLang} from 'ui-lib';
import {DataSources} from './datasources';
import {ListRange} from '@angular/cdk/collections';

@Injectable({
  providedIn: 'root'
})
export class FieldsService implements OnDestroy {
  private fields: ReadonlyArray<FieldAndTitlesType>;
  private readonly subscription: Subscription;
  private cdkDS: CdkDataSource<FieldTypeUI, FieldAndTitlesType>;
  private subject = new BehaviorSubject<ListRange>({start: 0, end: Number.MAX_VALUE});

  constructor(private dataSources: DataSources) {
    this.cdkDS = this.dataSources.Fields.registerDS();
    this.cdkDS.trIn = (v) => {
      const res: FieldAndTitlesType[] = [];
      v.forEach(f => res.push({
        field: {name: f.name, order: f.order, type: f.type, enumValues: f.enumValues, subtype: f.subtype},
        titles: f.title
      }));
      return res;
    };
    this.subscription = this.cdkDS.connect({viewChange: this.subject})
      .subscribe(d => this.fields = d);
  }
  ngOnDestroy(): void {
    console.log('destroy FieldsService');
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.dataSources.Fields.unregisterDS(this.cdkDS);
  }
  getFields(): ReadonlyArray<FieldAndTitlesType> {
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
