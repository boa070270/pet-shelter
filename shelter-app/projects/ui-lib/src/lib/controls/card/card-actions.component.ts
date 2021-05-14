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
import {RootPageService} from "../../shared/root-page.service";

export interface CardActions {
  icon: string;
  tooltip: string | TitleType[];
  command: string;
  toggle?: {
    icon: string;
    toggled?: boolean;
  };
}

@Component({
  selector: 'lib-card-actions',
  templateUrl: './card-actions.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardActionsComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {

  @HostBinding() class = 'card-actions';

  @Input() actions: CardActions[] = [];

  @Output()
  actionEvent: EventEmitter<string> = new EventEmitter<string>();

  constructor(public systemLang: SystemLang, protected directionality: Directionality, protected rootPage: RootPageService) {
    super(systemLang, directionality, rootPage);
  }

  ngOnInit(): void {
  }

  customAction(action: CardActions): void {
    if (action.toggle) {
      action.toggle.toggled = !action.toggle.toggled;
    }
    this.actionEvent.next(action.command);
  }

}
