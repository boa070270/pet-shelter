import {AfterViewInit, Directive, ElementRef, Input, Renderer2, Type} from '@angular/core';
import {TableControl} from './table-control';
import {TableRowSelectorDirective} from './table-row-selector.directive';

const fnDefault = (row: any, cell: string) => row[cell];
@Directive({
  selector: '[libTableCellData]'
})
export class TableCellDataDirective implements AfterViewInit {
  @Input() libTableCellData: string;
  private fnType: (row: any, cell: string) => string | Type<any>;

  constructor(private renderer: Renderer2,
              private tableControl: TableControl,
              private row: TableRowSelectorDirective,
              private element: ElementRef) {
  }
  ngAfterViewInit(): void {
    console.log('TableCellDataDirective.ngAfterViewInit', this.row.libTableRowSelector[this.libTableCellData]);
    // this.fnType = this.tableControl.columnTypes[this.libTableCellData] || fnDefault;
  }
  renderValue(): void {
    if (typeof this.fnType === 'function') {
      const text = this.renderer.createText(this.fnType(this.row.libTableRowSelector, this.libTableCellData) as string);
      this.renderer.appendChild(this.element, text);
    } else {

    }
  }
}
