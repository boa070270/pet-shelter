import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';
import {Observable} from "rxjs";
import {
  LanguageType, LoggerConfiguration,
  LoggerConfigurationToken,
  LogLevel,
  ObtainSystemLanguage, SharedModule,
  UILogger,
  UILoggerToken, UILoggerWriterToken, UILogWriter
} from "../../shared";
import {OverlayModule} from "@angular/cdk/overlay";
import {LoggerService} from "../../logger";
import {CommonModule} from "@angular/common";
import {ControlsModule} from "../controls.module";

// const UILoggerToken =
//   new InjectionToken<UILogger>('LoggerService');

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

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(TableComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  it('should create', () => {
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    // const dataSource = component.dataSource;
    // fixture.detectChanges();
    //
    // const initialDataLength = dataSource.total.getValue();
    // expect(dataSource.total.getValue()).toBe(0);
    // const tableElement = fixture.nativeElement.querySelector('.lib-table');
    //
    // let data = dataSource.data;
    // expectTableToMatchContent(tableElement, [
    //   ['Column A', 'Column B', 'Column C'],
    //   [data[0].a, data[0].b, data[0].c],
    //   [data[1].a, data[1].b, data[1].c],
    //   [data[2].a, data[2].b, data[2].c],
    //   ['Footer A', 'Footer B', 'Footer C'],
    // ]);
    //
    // // Add data to the table and recreate what the rendered output should be.
    // dataSource.setData(['a']);
    // expect(dataSource.data.length).toBe(initialDataLength + 1); // Make sure data was added
    // fixture.detectChanges();
    //
    // data = dataSource.data;
    // expectTableToMatchContent(tableElement, [
    //   ['Column A', 'Column B', 'Column C'],
    //   [data[0].a, data[0].b, data[0].c],
    //   [data[1].a, data[1].b, data[1].c],
    //   [data[2].a, data[2].b, data[2].c],
    //   [data[3].a, data[3].b, data[3].c],
    //   ['Footer A', 'Footer B', 'Footer C'],
    // ]);
    // expect(new TableComponent(null, null, null, null, null)).toBeTruthy();
    expect(component).toBeTruthy();
  });
});


function getElements(element: Element, query: string): HTMLElement[] {
  return [].slice.call(element.querySelectorAll(query));
}

function getHeaderRows(tableElement: Element): HTMLElement[] {
  return [].slice.call(tableElement.querySelectorAll('.cdk-header-row'));
}

function getFooterRows(tableElement: Element): HTMLElement[] {
  return [].slice.call(tableElement.querySelectorAll('.cdk-footer-row'));
}

function getRows(tableElement: Element): HTMLElement[] {
  return getElements(tableElement, '.cdk-row');
}

function getCells(row: Element): HTMLElement[] {
  if (!row) {
    return [];
  }

  let cells = getElements(row, 'cdk-cell');
  if (!cells.length) {
    cells = getElements(row, 'td.cdk-cell');
  }

  return cells;
}

function getHeaderCells(headerRow: Element): HTMLElement[] {
  let cells = getElements(headerRow, 'cdk-header-cell');
  if (!cells.length) {
    cells = getElements(headerRow, 'th.cdk-header-cell');
  }

  return cells;
}

function getFooterCells(footerRow: Element): HTMLElement[] {
  let cells = getElements(footerRow, 'cdk-footer-cell');
  if (!cells.length) {
    cells = getElements(footerRow, 'td.cdk-footer-cell');
  }

  return cells;
}

function getActualTableContent(tableElement: Element): string[][] {
  let actualTableContent: Element[][] = [];
  getHeaderRows(tableElement).forEach(row => {
    actualTableContent.push(getHeaderCells(row));
  });

  // Check data row cells
  const rows = getRows(tableElement).map(row => getCells(row));
  actualTableContent = actualTableContent.concat(rows);

  getFooterRows(tableElement).forEach(row => {
    actualTableContent.push(getFooterCells(row));
  });

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
      checkCellContent(actualCell, expectedCell);
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

// class LoggerServiceMock implements LoggerService {
//   constructor(@Optional() @Inject(LoggerConfigurationToken) private loggerConfig: LoggerConfiguration,
//               @Inject(UILoggerWriterToken) private writer: UILogWriter) { }
//   debug(message: any, ...params): void {
//   }
//
//   error(message: any, ...params): void {
//   }
//
//   info(message: any, ...params): void {
//   }
//
//   private out(level: LogLevel, message: any, ...params): void {
//   }
//
//   warn(message: any, ...params): void {
//   }
// }
