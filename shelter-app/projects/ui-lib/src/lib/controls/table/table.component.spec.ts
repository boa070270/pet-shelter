import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';
import {Observable} from 'rxjs';
import {
  AbstractDataSource,
  CdkDataSource, EXT_SYSTEM_LANG,
  LanguageType, LoggerConfiguration,
  LoggerConfigurationToken,
  LogLevel,
  ObtainSystemLanguage, SharedModule, SwaggerNative, SwaggerObject,
  UILogger,
  UILoggerToken, UILoggerWriterToken, UILogWriter
} from '../../shared';
import {OverlayModule} from '@angular/cdk/overlay';
import {LoggerService} from '../../logger';
import {CommonModule} from '@angular/common';
import {ControlsModule} from '../controls.module';
import {ObtainSystemLanguageMock} from "../../../../test/system-language-mock";

const data = [
  ['cell1', 'cell2', 'cell3'],
  ['a', 0, false],
  ['b', 1, true]
];
const inputData = [
  {cell1: data[1][0], cell2: data[1][1], cell3: data[1][2]},
  {cell1: data[2][0], cell2: data[2][1], cell3: data[2][2]},
];

describe('TestTableComponent', () => {
  let component: TableComponent<any, any>;
  let fixture: ComponentFixture<TableComponent<any, any>>;
  let dataSource: AbstractDataSource<any>;
  let cdkDataSource: CdkDataSource<any, any>;
  let tableElement: HTMLTableElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayModule, CommonModule, SharedModule, ControlsModule],
      declarations: [ TableComponent ],
      providers: [
        {provide: EXT_SYSTEM_LANG, useClass: ObtainSystemLanguageMock},
        {provide: UILoggerToken, useClass: LoggerService},
        {provide: LoggerConfigurationToken, useValue: {level: LogLevel.Debug}},
        {provide: UILoggerWriterToken, useValue: {
            write(date: Date, level: LogLevel, message: string): void {}
          }}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
    component.swagger = new SwaggerObject(['cell1', 'cell2', 'cell3'], {
      cell1: SwaggerNative.asString(),
      cell2: SwaggerNative.asNumber(),
      cell3: SwaggerNative.asBoolean(),
    });
    fixture.detectChanges();
  });

  beforeEach(() => {
    dataSource = component.dataSource;
    cdkDataSource = dataSource.registerDS();
    expect(cdkDataSource).toBeTruthy();
    fixture.detectChanges();
    tableElement = fixture.nativeElement.querySelector('table');
    expect(tableElement).toBeTruthy();
  });

  it('data should be writable', () => {
    fixture.detectChanges();

    const initialDataLength = dataSource.total.getValue();
    expect(cdkDataSource.totalRecords.getValue()).toBe(0);
    expect(cdkDataSource.totalRecords.getValue()).toEqual(dataSource.total.getValue());
    // Add data to the table and recreate what the rendered output should be.
    component.writeValue(inputData);
    expect(cdkDataSource.totalRecords.getValue()).toBe(initialDataLength + inputData.length); // Make sure data was added
    expect(cdkDataSource.totalRecords.getValue()).toEqual(dataSource.total.getValue());
    fixture.detectChanges();

    expectTableToMatchContent(tableElement, data);
  });

  describe('row should change', () => {
    it('added', () => {
      const row = {cell1: 'c', cell2: 3, cell3: true};
      cdkDataSource.insertRow(row).subscribe(() => {
        fixture.detectChanges();
        expectTableToMatchContent(tableElement, [data[0], [row.cell1, row.cell2, row.cell3]]);
      });
    });

    it('edited', () => {
      const row = {cell1: 'c', cell2: 3, cell3: true};
      const editedRow = {cell1: 'd', cell2: 4, cell3: false};
      component.writeValue([row]);
      expect(cdkDataSource.totalRecords.getValue()).toBe(1);
      cdkDataSource.updateRow(editedRow, row).subscribe(() => {
        fixture.detectChanges();
        expectTableToMatchContent(tableElement,
          [data[0], [editedRow.cell1, editedRow.cell2, editedRow.cell3]]);
      });
    });

    it('deleted', () => {
      const row = {cell1: 'c', cell2: 3, cell3: true};
      component.writeValue([row]);
      expect(cdkDataSource.totalRecords.getValue()).toBe(1);
      cdkDataSource.deleteRow(row).subscribe(() => {
        fixture.detectChanges();
        expectTableToMatchContent(tableElement, [data[0]]);
      });
    });
  });

  it('data should be filtered', () => {
    component.writeValue(inputData);
    expect(cdkDataSource.totalRecords.getValue()).toBe(2);
    fixture.detectChanges();
    component.inputSearch.nativeElement.value = 'b';
    component.keyUp();
    cdkDataSource.filteredRecords.subscribe((n) => {
      expect(n).toBe(1);
    });
    fixture.detectChanges();
    expectTableToMatchContent(tableElement, [data[0], data[2]]);
  });

  it('order should change (this works strangely)', () => {
    component.writeValue([inputData[1], inputData[0]]);
    expect(cdkDataSource.totalRecords.getValue()).toBe(2);
    component.orderCell('cell1');
    component.orderCell('cell1');
    fixture.detectChanges();
    expectTableToMatchContent(tableElement, data);
  });

  it('page should change', () => {
    const input = [];
    for (let i = 0; i < 6; i++) {
      input.push(inputData[0], inputData[1]);
    }
    component.writeValue(input);
    component.page = 2;
    fixture.detectChanges();
    expectTableToMatchContent(tableElement, data);
  });

  // todo custom actions, trIn, trOut
  // todo rowClick()

});


function getElements(element: Element, query: string): HTMLElement[] {
  return [].slice.call(element.querySelectorAll(query));
}

function getHeaderRows(tableElement: Element): HTMLElement[] {
  return [].slice.call(tableElement.querySelectorAll('.cdk-header-row'));
}

function getRows(tableElement: Element): HTMLElement[] {
  return getElements(tableElement, '.cdk-row');
}

function getCells(row: Element): HTMLElement[] {
  if (!row) {
    return [];
  }

  let cells = getElements(row, '.cdk-cell');
  if (!cells.length) {
    cells = getElements(row, '.td.cdk-cell');
  }
  return cells;
}

function getHeaderCells(headerRow: Element): HTMLElement[] {
  let cells = getElements(headerRow, '.cdk-header-cell');
  if (!cells.length) {
    cells = getElements(headerRow, '.th.cdk-header-cell');
  }
  return cells;
}

function getActualTableContent(tableElement: Element): string[][] {
  let actualTableContent: Element[][] = [];
  getHeaderRows(tableElement).forEach(row => {
    actualTableContent.push(getHeaderCells(row));
  });

  // Check data row cells
  actualTableContent = actualTableContent.concat(getRows(tableElement).map(row => getCells(row)));

  // Convert the nodes into their text content;
  return actualTableContent.map(row => row.map(cell => cell.textContent.trim()));
}

export function expectTableToMatchContent(tableElement: Element, expected: any[]): void {
  const missedExpectations: string[] = [];
  function checkCellContent(actualCell: string, expectedCell: string): void {
    if (actualCell !== expectedCell) {
      missedExpectations.push(`Expected cell contents to be ${expectedCell} but was ${actualCell}`);
    }
  }

  const actual = getActualTableContent(tableElement);

  // Make sure the number of rows match
  if (actual.length !== expected.length) {
    missedExpectations.push(`Expected ${expected.length} total rows but got ${actual.length}`);
    fail(missedExpectations.join('\n'));
  }

  actual.forEach((row, rowIndex) => {
    const expectedRow = expected[rowIndex];

    // Make sure the number of cells match
    if (row.length !== expectedRow.length) {
      missedExpectations.push(`Expected ${expectedRow.length} cells in row but got ${row.length}`);
      fail(missedExpectations.join('\n'));
    }

    row.forEach((actualCell, cellIndex) => {
      const expectedCell = expectedRow ? expectedRow[cellIndex] : null;
      // actualCell obtains from dom as string
      checkCellContent(actualCell, expectedCell + '');
    });
  });

  if (missedExpectations.length) {
    fail(missedExpectations.join('\n'));
  }
}
