import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractComponent} from './abstract.component';
import {SystemLang} from '../i18n';
import {RootPageService, TitleType} from '../shared';

@Component({
  selector: 'lib-toolbar',
  template: `<div class="ui-toolbar"><div>
    <button *ngFor="let act of actions" (click)="customAction(act.command)" class="{{act.icon}}" [title]="act.tooltip"></button>
  </div></div>`,
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent extends AbstractComponent implements OnDestroy {
  @Input()
  customActions: Array<{icon: string, tooltip: string | TitleType[], command: string}> = [];
  actions: Array<{icon: string, tooltip: string, command: string}> = [];
  @Output()
  toolbarEvent = new EventEmitter<string>();
  constructor(public systemLang: SystemLang, protected rootPage: RootPageService) {
    super(systemLang, rootPage);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
  onChangeLang(): void {
    super.onChangeLang();
    if (this.customActions) {
      this.actions = [];
      for (const act of this.customActions) {
        this.actions.push({icon: act.icon, command: act.command, tooltip: this.doIfNeedI18n(act.tooltip)});
      }
    }
  }
  customAction(cmd: string): void {
    this.toolbarEvent.emit(cmd);
  }

}
