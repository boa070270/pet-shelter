import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as keys from '@angular/cdk/keycodes';
import {hasModifierKey} from '@angular/cdk/keycodes';

// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
const KNOWN_KEYS = ['Enter', 'Tab',
  'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp',
  'Backspace', 'Delete', 'Insert',
];
const WHITESPACE_KEYS = ['Enter', 'Tab'];
const EDITING_KEYS = [
  'Backspace', 'Delete', 'Insert',
];
const NAVIGATION_KEYS = [
  'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp',
];
const TEXT_NODE = 3;
const ELEMENT_NODE = 1;
const DESIGNER_ATTR_NAME = '_design';
@Component({
  selector: 'app-test-sync',
  templateUrl: './test-sync.component.html',
  styleUrls: ['./test-sync.component.sass']
})
export class TestSyncComponent implements OnInit {
  position = 0;
  designAttr = 0;
  source = '';
  editor: HTMLDivElement;
  @ViewChild('editor', {static: true}) editorRef: ElementRef<HTMLDivElement>;
  constructor() { }

  ngOnInit(): void {
    this.editor = this.editorRef.nativeElement;
  }

  onClick(event: MouseEvent): void {
    this.syncOnTouch();
  }

  onKeyPress(event: KeyboardEvent): void {
    console.log(event);
    if (event.altKey || event.ctrlKey || event.metaKey) {
      console.log('onKeyPress', true);
      return;
    }
    if (event.key.length > 1 && !KNOWN_KEYS.includes(event.key)) {
      console.log('onKeyPress input not editable symbol', event.key);
      return;
    }
    const cursor = this.  syncOnTouch();
    if (WHITESPACE_KEYS.includes(event.key)) {
      this.whitespace(cursor, event.key);
    } else if (EDITING_KEYS.includes(event.key)) {
      this.editingKey(cursor, event.key);
    } else if (NAVIGATION_KEYS.includes(event.key)) {
      this.navigation(cursor, event.key);
    } else {
      this.simpleChar(cursor, event.key);
    }
    event.preventDefault();
  }
  syncOnTouch(): number {
    const {isCollapsed, anchorNode, anchorOffset, focusNode, focusOffset, rangeCount} = window.getSelection();
    console.log('syncOnTouch', isCollapsed, anchorOffset, focusOffset, rangeCount);
    if (focusNode) {
      let element = focusNode as HTMLElement;
      if (focusNode.nodeType === TEXT_NODE) {
        element = focusNode.parentElement;
      }
      const v = element.getAttribute(DESIGNER_ATTR_NAME);
      let from = 0;
      if (v) {
        from = this.source.indexOf(DESIGNER_ATTR_NAME + `="${v}"`);
        from = this.source.indexOf('>', from);
      }
      return from + focusOffset;
    } else {
      return 0;
    }
  }

  private whitespace(cursor: number, key: string): void {
    switch (key) {
      case 'Enter':
        this.source = this.source.substring(0, cursor) + '<br>' + this.source.substring(cursor);
        break;
      case 'Tab':
        break;
    }
    this.editor.innerHTML = this.source;
  }

  private editingKey(cursor: number, key: string): void {
    switch (key) {
      case 'Backspace':
        this.source = this.source.substring(0, cursor - 1) + this.source.substring(cursor);
        break;
      case 'Delete':
        this.source = this.source.substring(0, cursor) + this.source.substring(cursor + 1);
        break;
      case 'Insert':
        break;
    }
    this.editor.innerHTML = this.source;
  }

  private navigation(cursor: number, key: string): void {

  }

  private simpleChar(cursor: number, key: string): void {
    this.source = this.source.substring(0, cursor) + key + this.source.substring(cursor);
    this.editor.innerHTML = this.source;
    const sel = window.getSelection();
    window.getSelection().setPosition(sel.focusNode, sel.focusOffset + 1);
  }
}
