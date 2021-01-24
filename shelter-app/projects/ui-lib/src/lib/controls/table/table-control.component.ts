import {Component, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject, isObservable, Observable, Subject, Subscription} from 'rxjs';
import {SystemLang} from '../../i18n';
import {TitleType} from '../../shared';
import {BaseControlComponent} from '../base-control.component';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'lib-table-control',
  templateUrl: './table-control.component.html',
  styleUrls: ['./table-control.component.scss']
})
export class TableControlComponent<R> extends BaseControlComponent implements OnInit, OnChanges, OnDestroy {
  @Input() observableData: Observable<ReadonlyArray<R>>;
  @Input() observableColl: Observable<string[]>;
  @Input() filtered: boolean;
  @Input() stickied: boolean;
  @Input() rowNumbers: boolean;
  @Output() selectedRows: Subject<ReadonlyArray<R>> = new BehaviorSubject<ReadonlyArray<R>>([]);
  data: ReadonlyArray<R>;
  displayedColumns: string[];
  columnTitles: ReadonlyArray<{[cell: string]: string | TitleType[]}>;
  columnType: {[cell: string]: string} = {};
  pColumnTitles: {[cell: string]: string};
  private selected: Array<R>;
  private dataSubscription: Subscription;
  private columnSubscription: Subscription;
  private destroy: Subject<any> = new Subject();

  constructor(public systemLang: SystemLang) {
    super(systemLang);
  }
  onChangeLang(): void {
    this.pColumnTitles = this.doIfNeedI18n(this.columnTitles, {});
  }

  ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
  }
  ngOnInit(): void {
    super.ngOnInit();
    if (isObservable(this.observableData)) {
      this.dataSubscription = this.observableData.pipe(takeUntil(this.destroy)).subscribe(d => this.data = d);
    }
    if (isObservable(this.observableColl)) {
      this.columnSubscription = this.observableColl.pipe(takeUntil(this.destroy)).subscribe(c => this.displayedColumns = c);
    }
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.unsubscribeData();
    this.unsubscribeColumn();
    this.destroy.next(true);
    this.destroy.complete();
    this.selectedRows.complete();
  }
  toggleSelected(row: R): void {
    const i = this.selected.indexOf(row);
    if (i >= 0) {
      this.selected.splice(i, 1);
    }
  }
  private unsubscribeData(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
      this.dataSubscription = null;
    }
  }
  private unsubscribeColumn(): void {
    if (this.columnSubscription) {
      this.columnSubscription.unsubscribe();
      this.columnSubscription = null;
    }
  }
}
