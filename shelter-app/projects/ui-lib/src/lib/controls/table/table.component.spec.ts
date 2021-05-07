import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';
import {Observable} from 'rxjs';
import {
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

const data = [
  ['cell1', 'cell2', 'cell3'],
  ['a', 0, false],
  ['b', 1, true]
];

describe('TestTableComponent', () => {
  let component: TableComponent<any, any>;
  let fixture: ComponentFixture<TableComponent<any, any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayModule, CommonModule, SharedModule, ControlsModule],
      declarations: [ TableComponent ],
      providers: [
        {provide: 'ObtainSystemLanguage', useClass: ObtainSystemLanguageMock},
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
    component.swagger = new SwaggerObject(['cell1', 'cell2', 'cell3'], {
      cell1: SwaggerNative.asString(),
      cell2: SwaggerNative.asNumber(),
      cell3: SwaggerNative.asBoolean(),
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('data should change', () => {
    const dataSource = component.dataSource;
    fixture.detectChanges();

    const initialDataLength = dataSource.total.getValue();
    expect(dataSource.total.getValue()).toBe(0);
    const tableElement = fixture.nativeElement.querySelector('table');
    expect(tableElement).toBeTruthy();
    // Add data to the table and recreate what the rendered output should be.
    dataSource.setData([
      {cell1: data[1][0], cell2: data[1][1], cell3: data[1][2]},
      {cell1: data[2][0], cell2: data[2][1], cell3: data[2][2]},
    ]);
    expect(dataSource.total.getValue()).toBe(initialDataLength + 2); // Make sure data was added
    fixture.detectChanges();

    expectTableToMatchContent(tableElement, data);
  });


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
    const cells = getHeaderCells(row);
    if (cells.length) {
      actualTableContent.push(cells);
    }
  });

  // Check data row cells
  const rows = getRows(tableElement).map(row => getCells(row));
  if (rows.length) {
    actualTableContent = actualTableContent.concat(rows);
  }

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
  console.log(actual);

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
class ObtainSystemLanguageMock implements ObtainSystemLanguage {
  getSystemLanguages(): Observable<Array<LanguageType>> {
    return new Observable(s => {
      s.next([{
        lang: 'en',
        displayName: 'en',
        rate: 0
      }]);
    });
  }
}
