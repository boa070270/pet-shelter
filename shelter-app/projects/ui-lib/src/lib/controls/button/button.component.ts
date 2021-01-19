import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'lib-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent implements OnInit {

  constructor() { }
  @Input() value: string;
  @Input() hidden: boolean;
  @Input() type: string;
  @Input() disabled: boolean;
  @Input() id: string;
  @Input() accessKey: string;
  @Input() name: string;
  @Input() formTarget: string;
  @Input() formAction: string;
  @Input() formNoValidate: boolean;
  @Input() formMethod: string;
  @Input() formEnctype: string;
  @Input() autofocus: boolean;
  @Input() dir: string;
  @Input() tabIndex: number;
  private emitter: EventEmitter<Event> = new EventEmitter<Event>();

  @Output()
  get eventEmitter(): EventEmitter<Event> {
    return this.emitter;
  }

  ngOnInit(): void {
  }

  onToggle($event: Event): void {
    console.log('onToggle', $event);
  }

  onChange($event: Event): void {
    console.log('onChange', $event);
  }

  onInput($event: Event): void {
    console.log('onInput', $event);
  }

  onCancel($event: Event): void {
    console.log('onCancel', $event);
  }

  onClose($event: Event): void {
    console.log('onClose', $event);
  }

  onInvalid($event: Event): void {
    console.log('onInvalid', $event);
  }

  onFocus($event: FocusEvent): void {
    console.log('onFocus', $event);
  }

  onFocusIn($event: FocusEvent): void {
    console.log('onFocusIn', $event);
  }

  onFocusOut($event: FocusEvent): void {
    console.log('onFocusOut', $event);
  }

  onBlur($event: FocusEvent): void {
    console.log('onBlur', $event);
  }

  onKeyDown($event: KeyboardEvent): void {
    console.log('onKeyDown', $event);
  }

  onKeyUp($event: KeyboardEvent): void {
    console.log('onKeyUp', $event);
  }

  onKeyPress($event: KeyboardEvent): void {
    console.log('onKeyPress', $event);
  }

  onClick($event: MouseEvent): void {
    console.log('onClick', $event);
  }

  onContextMenu($event: MouseEvent): void {
    console.log('onContextMenu', $event);
  }

  onDblClick($event: MouseEvent): void {
    console.log('onDblClick', $event);
  }

  onMouseDown($event: MouseEvent): void {
    console.log('onMouseDown', $event);
  }

  onMouseUp($event: MouseEvent): void {
    console.log('onMouseUp', $event);
  }

  onMouseEnter($event: MouseEvent): void {
    console.log('onMouseEnter', $event);
  }

  onMouseLeave($event: MouseEvent): void {
    console.log('onMouseLeave', $event);
  }

  onMouseOut($event: MouseEvent): void {
    console.log('onMouseOut', $event);
  }

  onMouseMove($event: MouseEvent): void {
    console.log('onMouseMove', $event);
  }

  onMouseOver($event: MouseEvent): void {
    console.log('onMouseOver', $event);
  }

  onMouseWheel($event: WheelEvent): void {
    console.log('onMouseWheel', $event);
  }
}
