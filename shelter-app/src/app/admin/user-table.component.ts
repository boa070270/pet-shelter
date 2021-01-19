import {Component, OnInit} from '@angular/core';
import {
  BaseDataSource,
  BuilderFieldControlConfiguration,
  EditTableConfiguration,
  EnumInputType,
  makeColumnInfo
} from 'ui-lib';
import {BasicService} from '../basic.service';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
// from x-payload
import {FileType, UserType} from '../common/types';
import {fromPromise} from 'rxjs/internal-compatibility';

class DataSource extends BaseDataSource<UserType> {

  constructor(private service: BasicService) {
    super(service.getUsers());
  }

  delete(rows: UserType[]): Observable<any> {
    const promises = [];
    for (const r of rows) {
      promises.push(this.service.deleteUser(r.login).toPromise());
    }
    return fromPromise(Promise.all(promises));
  }

  insert(row: UserType): Observable<any> {
    return this.service.addUser(row);
  }

  update(row: UserType): Observable<any> {
    return this.service.updateUser(row);
  }

  refresh(): void {
    this._dataStream.newSource(this.service.getUsers());
  }
}

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.sass'] // TODO change to ...
})
export class UserTableComponent implements OnInit {
  tableConfiguration: EditTableConfiguration<UserType>;

  constructor(public dialog: MatDialog, private service: BasicService) {
  }

  ngOnInit(): void {
    this.tableConfiguration = {
      readonly: false,
      dataSource: new DataSource(this.service),
      newItem: () => ({login: '', authType: null, password: '', role: [], created: '', enabled: false}),
      getId: (r) => '' + r.login,
      getColumnValue: (element, column) => {
        if (column === 'role') {
          return element.role ? element.role.join(',') : '';
        }
        return element[column];
      },
      allColumns: [
        makeColumnInfo('login', 'Login', true, false),
        makeColumnInfo('authType', 'AuthType', true, false),
        makeColumnInfo('password', 'Password', true, false),
        makeColumnInfo('role', 'Role', true, false),
        makeColumnInfo('created', 'Created', true, false),
        makeColumnInfo('enabled', 'Enabled', true, false),
      ],

      formConfiguration: {
        options: {
          readonly: false,
          appearance: 'standard',
          formClass: 'form-class',
          converterToForm: r => {
            return r;
            },
          converterFromForm: r => {
            return r;
          }
        },
        controls: [
          {
            formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
            controlName: 'login',
            hint: 'Please, input login',
            title: 'Login',
            placeholder: 'There is unique login',
            required: true,
            matFormFieldClass: 'field-class',
            immutable: true,
          },
          {
            formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
            controlName: 'authType',
            hint: 'Please, input authType',
            title: 'AuthType',
            placeholder: 'There is unique authType',
            required: true,
            matFormFieldClass: 'field-class',
            immutable: true,
          },
          {
            formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
            controlName: 'password',
            hint: 'Please, input password',
            title: 'Password',
            placeholder: 'There is unique password',
            required: true,
            matFormFieldClass: 'field-class',
            immutable: true,
          },
          {
            formControl: BuilderFieldControlConfiguration.checkboxFieldConfiguration(
              ['public', 'writer', 'admin'],
              ['public']),
            controlName: 'role',
            hint: 'Please, input role',
            title: 'Role',
            placeholder: 'There is unique role',
            required: true,
            matFormFieldClass: 'field-class',
            immutable: true,
          },
          {
            formControl: BuilderFieldControlConfiguration.inputFieldConfiguration(EnumInputType.text),
            controlName: 'created',
            hint: 'Please, input created',
            title: 'Created',
            placeholder: 'There is unique created',
            required: true,
            matFormFieldClass: 'field-class',
            immutable: true,
          },
          {
            formControl: BuilderFieldControlConfiguration.booleanFieldConfiguration(true),
            controlName: 'enabled',
            hint: 'Please, input enabled',
            title: 'Enabled',
            placeholder: 'There is unique enabled',
            required: true,
            matFormFieldClass: 'field-class',
            immutable: true,
          },
        ]
      },
      extendCommands: null,
      selectedRows: null
    };
  }

}
