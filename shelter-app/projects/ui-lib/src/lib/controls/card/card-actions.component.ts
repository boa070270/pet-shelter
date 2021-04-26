import {
  ChangeDetectionStrategy,
  Component, EventEmitter,
  HostBinding, Input,
  OnChanges,
  OnDestroy,
  OnInit, Output,
  ViewEncapsulation
} from '@angular/core';
import {BaseComponent} from "../base.component";
import {ControlValueAccessor} from "@angular/forms";
import {SwaggerSchema, TitleType} from "../../shared";
import {SystemLang} from "../../i18n";
import {Directionality} from "@angular/cdk/bidi";

@Component({
  selector: 'lib-card-actions',
  templateUrl: './card-actions.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardActionsComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {

  @HostBinding() class = 'card-actions';
  _actions: Array<{icon: string, tooltip: string | TitleType[], command: string}> = [];

  @Input()
  set actions(arr: Array<{icon: string, tooltip: string | TitleType[], command: string}>) {
    this._actions = arr;
  }
  get actions(): Array<{icon: string, tooltip: string | TitleType[], command: string}> {
    return this._actions;
  }

  @Output()
  actionEvent: EventEmitter<string> = new EventEmitter<string>();

  constructor(public systemLang: SystemLang, protected directionality: Directionality) {
    super(systemLang, directionality);
  }

  ngOnInit(): void {
  }

  customAction(cmd: string): void {
    this.actionEvent.next(cmd);
  }

}
