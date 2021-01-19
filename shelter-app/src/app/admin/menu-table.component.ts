import {Component, OnDestroy, OnInit} from '@angular/core';
import {BaseDataSource, EditTableConfiguration, makeColumnInfo} from 'ui-lib';
import {BasicService} from '../basic.service';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
// from x-payload
import {convertMenusToMenuArray, MenuAndTitlesType} from '../common/types';
import {map} from 'rxjs/operators';
import {fromPromise} from 'rxjs/internal-compatibility';
import {FormsConfigurationService} from './forms-configuration.service';

class DataSource extends BaseDataSource<MenuAndTitlesType> {

  constructor(private service: BasicService) {
    super(service.getMenus().pipe(map(value => convertMenusToMenuArray(value))));
  }

  delete(rows: MenuAndTitlesType[]): Observable<any> {
    const promises = [];
    for (const r of rows) {
      promises.push(this.service.deleteMenu(r.menu.path).toPromise());
    }
    return fromPromise(Promise.all(promises));
  }

  insert(row: MenuAndTitlesType): Observable<any> {
    return this.service.upsetMenu(row.menu, row.titles);
  }

  update(row: MenuAndTitlesType): Observable<any> {
    return this.service.upsetMenu(row.menu, row.titles);
  }

  refresh(): void {
    this._dataStream.newSource(this.service.getMenus().pipe(map(value => convertMenusToMenuArray(value))));
  }
}

@Component({
  selector: 'app-menu-table',
  templateUrl: './menu-table.component.html',
  styleUrls: ['./menu-table.component.sass'] // TODO change to ...
})
export class MenuTableComponent implements OnInit, OnDestroy {
  tableConfiguration: EditTableConfiguration<MenuAndTitlesType>;

  constructor(public dialog: MatDialog, private service: BasicService, private formConfiguration: FormsConfigurationService) {
  }

  ngOnInit(): void {
    this.tableConfiguration = {
      readonly: false,
      dataSource: new DataSource(this.service),
      newItem: () => {
        return this.formConfiguration.menuNewItem();
      },
      getId: (row) => '' + row.menu.path,
      getColumnValue: (row, column) => {
        switch (column) {
          case 'path':
            return row.menu.path;
          case 'parentId':
            return row.menu.parentId;
          case 'title':
            const titles = row.titles.map<string>(t => t.lang + ':' + t.title);
            return titles.join(',');
          case 'component':
            return row.menu.component;
          case 'role':
            return row.menu.role;
          case 'position':
            return '' + row.menu.position;
        }
      },
      allColumns: [
        makeColumnInfo('path', 'Path', true, false),
        makeColumnInfo('parentId', 'Parent', true, false),
        makeColumnInfo('title', 'Title', true, false),
        makeColumnInfo('component', 'Component', true, false),
        makeColumnInfo('role', 'Role', true, false),
        makeColumnInfo('position', 'Position', true, false),
      ],
      formConfiguration: this.formConfiguration.menuFormConfiguration()
    };
  }

  ngOnDestroy(): void {
    // this.subscriptions.unsubscribe();
  }

}
