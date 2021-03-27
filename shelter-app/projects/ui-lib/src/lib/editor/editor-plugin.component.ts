import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  Input,
  OnInit,
  Type,
  ViewChild
} from '@angular/core';
import {Form, NgForm} from '@angular/forms';
import {BehaviorSubject, Observable} from 'rxjs';
// import {TableSchema} from '../controls/table/table-schema';
import {ExtendedData, swaggerUI} from '../shared';
import {DialogService} from '../dialog-service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'editor-plugin',
    templateUrl: './editor-plugin.component.html',
    styleUrls: ['./editor-plugin.component.scss']
})
export class EditorPluginComponent {

    availableTags = ['lib-table-generator'];

    // TODO get from some service or something
    // componentParams: TableSchema;

    // TODO get from server into input and save on change
    tableDataSet = [
      {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
      {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
      {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
      {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
      {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
      {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
      {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
      {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
      {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
      {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
    ];
    tableColumnSet = ['position', 'name', 'weight', 'symbol'];
    tableCaption = 'Test table';
    tableData = new BehaviorSubject<any>(this.tableDataSet);

    tempServiceSave: {key: string, params: object};

    // params: { selector: string, attributes: string[] }[];
    selected: string;

    @ViewChild('editable') editableElement: ElementRef<HTMLDivElement>;
    @ViewChild('topDivElement') topDivElement: ElementRef<HTMLDivElement>;
    // @ViewChild('myForm') form: NgForm;
    @ViewChild('keyName') keyName: ElementRef<HTMLInputElement>;

    plugin: HTMLElement;
    pluginControlsHidden = true;

  /**
   * [component tag] - get from some list of available components
   * [key name for this plugin] - input to store it on server, put it in tag as property <lib-component schema='key'></lib-component>
   * [edit properties] - on plugin or open dialog to input or edit properties of component
   *                    need to get needed inputs of component from it
   * [upload to server] - button or on save or delete
   */

  constructor(private dialogService: DialogService) { }

    onSelect(event: Event): void {
        // const i = (event.target as HTMLSelectElement).options.selectedIndex;
        this.selected = (event.target as HTMLSelectElement).value;
    }

    setPlugin(el): void {
        this.plugin = el;
        // this.params.find(elem => {
        //     if (this.plugin.nodeName.toLowerCase() === elem.selector) {
        //         this.selected = elem;
        //     }
        // });
    }

    removePlugin(): void {
        const plugin = this.topDivElement.nativeElement.parentNode;
        plugin.parentNode.removeChild(plugin);
    }

    save(): void {
        if (!this.selected) {
            return;
        }
        const newPlugin = document.createElement(this.selected);
        newPlugin.setAttribute('schema', this.keyName.nativeElement.value);
        // Object.keys(attributes).forEach(key => {
        //     if (attributes[key]) {
        //         newPlugin.setAttribute(key, attributes[key]);
        //     } else {
        //         if (newPlugin.getAttribute(key)) {
        //             newPlugin.removeAttribute(key);
        //         }
        //     }
        // });
        // TODO could have errors
        if (this.editableElement.nativeElement.firstChild) {
            newPlugin.innerHTML = (this.editableElement.nativeElement.firstChild as Text).textContent;
        } else {
            newPlugin.innerHTML = '';
        }
        this.plugin = newPlugin;

        this.tempServiceSave = {
            key: this.keyName.nativeElement.value,
            params: {
              observableData: this.tableData,
              columns: this.tableColumnSet,
              caption: this.tableCaption,
            },
        };
    }

    // getAttribute(attrib: string): string {
    //     if (!this.plugin) {
    //         return '';
    //     }
    //     const val = this.plugin.getAttribute(attrib);
    //     if (val) {
    //         return val;
    //     }
    //     return '';
    // }

  // deprecated?
    transformToNormal(): void {
        const editorPlugin = this.topDivElement.nativeElement.parentNode;
        this.save();
        if (this.plugin) {
            editorPlugin.appendChild(this.plugin);
            editorPlugin.removeChild(this.topDivElement.nativeElement);
        } else {
            editorPlugin.parentNode.removeChild(editorPlugin);
        }
    }

    getTransformedInner(): string {
        this.save();
        if (!this.plugin) {
            return '';
        }
        return '<editor-plugin>' + this.plugin.outerHTML + '</editor-plugin>';
    }

    onClick(): void {
      // open dialog
      // try getting from server
      // if has something - should be in dialog
      // nothing - empty
      // on dialog close - save here, because to update/save on server we need key name
      const extData = new ExtendedData();
      extData.action = 'save_cancel';
      extData.caption = this.selected;
      // extData.icon = 'gm-warning';
      // extData.swagger = {
      //   orderControls: [],
      //   properties: {
      //     observableData: {
      //
      //     },
      //     columns: {
      //
      //     },
      //     caption: {
      //
      //     }
      //   }
      // };


        // [caption] = "tableSchema.caption"
        // [columns] = "tableSchema.columns"
        // [observableData] = "tableSchema.observableData"
        // [filtered] = "tableSchema.filtered"
        // [stickied] = "tableSchema.stickied"
        // [fnEqual] = "tableSchema.fnEqual"
        // [rowNumbers] = "tableSchema.rowNumbers"

      //        observableData: this.tableData,
      //        columns: this.tableColumnSet,
      //        caption: this.tableCaption,
      //   {
      //   required: ['login', 'password'],
      //   orderControls: ['login', 'password'],
      //   properties: {
      //     login: {
      //       type: 'string', controlType: 'input',
      //       ui: swaggerUI([{lang: 'en', title: 'Login'}, {lang: 'uk', title: 'Логін'}])
      //     },
      //     password: {
      //       type: 'string', controlType: 'input',
      //       ui: swaggerUI([{lang: 'en', title: 'Password'}, {lang: 'uk', title: 'Пароль'}]),
      //       constrictions: {format: 'password'}
      //     }
      //   }
      // };
      // extData.data = {login: 'admin', password: '******'}; -- what already have?
      const dialogRef = this.dialogService.warnExtDialog(extData, true);
      console.log('EditorPluginComponent.openDialog', dialogRef);
      dialogRef.afterOpened().subscribe(v => {
        console.log(v);
      });
      dialogRef.afterClosed().subscribe(v => {
        console.log(v);
      });
    }
}
