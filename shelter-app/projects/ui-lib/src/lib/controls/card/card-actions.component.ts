import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewContainerRef
} from '@angular/core';
import {BaseComponent} from '../base.component';
import {ControlValueAccessor} from '@angular/forms';
import {TitleType} from '../../shared';

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

  constructor(protected _view: ViewContainerRef) {
    super(_view);
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
