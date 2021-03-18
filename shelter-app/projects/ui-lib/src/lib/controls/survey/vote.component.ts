import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {SystemLang} from '../../i18n';
import {Subscription} from 'rxjs';
import {VoteOption, VoteType} from './disscution-api';

export type ShowResultType = 'always' | 'oncomplete' | 'never';
export type Direction = 'row' | 'column';

@Component({
  selector: 'lib-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.scss']
})
export class VoteComponent implements OnInit, OnDestroy, OnChanges {
  @Input() disableEdit: false;
  @Input() direction: Direction;
  @Input() showResult: ShowResultType;
  @Input() options: VoteOption[];
  @Input() multiVote: false;
  @Input() results: VoteType[];
  @Output() emitChoice = new EventEmitter<Array<string>>();
  opts: Array<{ icon: string, value: string; title: string }>;
  choice: Array<string> = [];
  voteResult: { [optionName: string]: number; } = {};
  classForResult: any;
  private subsLang: Subscription;

  constructor(private systemLang: SystemLang) {
    this.subsLang = systemLang.onChange().subscribe(next => this.onLangChange(next));
  }

  ngOnInit(): void {
    this.prepareOptions();
    this.prepareResult();
    this.classForResult = {};
    if (this.showResult === 'always' || this.showResult === 'oncomplete') {
      this.classForResult[this.showResult] = true;
    } else {
      this.classForResult.never = true;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.results) {
      this.prepareResult();
    }
    if (typeof changes.disableEdit === 'boolean' && this.showResult === 'oncomplete' && this.disableEdit) {
      this.classForResult = {always: true};
    }
  }
  ngOnDestroy(): void {
    this.subsLang.unsubscribe();
  }
  private onLangChange(next: any): void {
    if (typeof next === 'string') {
      this.prepareOptions();
    }
  }
  onClick(ev: MouseEvent): void {
    if (!this.disableEdit) {
      const target: any = ev.target;
      if (target.tagName === 'LI') {
        this.toggleChoice((target as HTMLLIElement).value);
      }
    }
  }
  private prepareOptions(): void {
    if (this.options) {
      const opts: Array<{icon: string, value: string; title: string}> = [];
      this.options.forEach( o => {
        const title = this.systemLang.getTitle(o.title);
        const icon = o.icon && !o.icon.startsWith('gm-') ? 'gm-' + o.icon : o.icon;
        opts.push({icon, value: o.option, title});
      });
      this.opts = opts;
    }
  }
  private prepareResult(): void {
    const voteResult: { [optionName: string]: number; } = {};
    if (Array.isArray(this.opts) && Array.isArray(this.results)) {
      this.opts.forEach(o => {
        const v = this.results.find(r => r.all && r.all.vote === o.value);
        voteResult[o.value] = v ? v.all.count : 0;
      });
      this.voteResult = voteResult;
      this.choice = this.results.filter(r => r.me && r.me.vote).map(v => v.me.vote);
    }
  }
  toggleChoice(i: number): void {
    const opt = this.opts[i];
    const present = this.choice.indexOf(opt.value);
    if (opt) {
      if (this.multiVote) {
        if (present >= 0) {
          this.choice = this.choice.slice(0, present).concat(this.choice.slice(present + 1));
        } else {
          this.choice.push(opt.value);
        }
      } else {
        if (present >= 0) {
          this.choice = [];
        } else {
          this.choice = [opt.value];
        }
      }
      this.emitChoice.emit(this.choice);
    }
  }
}
