/* tslint:disable:prefer-const */
import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommentType, VoteOption, VoteType} from './disscution-api';
import {DiscussionComponent} from './discussion.component';
import {Subscription} from 'rxjs';

@Component({
  selector: 'lib-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit, OnDestroy {
  @Input() comment: CommentType;
  private processing: CommentType[] = [];
  private readSubs: Subscription;
  cutText = true;
  showForm = false;
  actionUpdate = 'Send'; // we use one endpoint to add and update
  newComment: string;
  enableEdit: boolean;
  enableAdd: boolean;
  get expanded(): boolean {
    return this.comment ? this.comment.expand : false;
  }
  set expanded(v: boolean) {
    if (this.comment) {
      this.comment.expand = v;
    }
  }
  get responses(): CommentType[] {
    return this.comment && this.comment.responses ? this.comment.responses : [];
  }
  get nickName(): string {
    return this.comment ? this.comment.nickName : 'anonymous';
  }
  get whoami(): string {
    return this.discussion.nickName;
  }
  set whoami(nick: string) {
    this.discussion.nickName = nick;
  }
  get text(): string {
    const t = this.comment ? this.comment.comment : '';
    if (t.length > 256 && this.cutText) {
      return t.slice(0, 256) + '...';
    } else {
      return t;
    }
  }
  get totalNumber(): number {
    return this.comment ? this.comment.numberOf : 0;
  }
  get enableEditNick(): boolean {
    return this.discussion.enableEditNick;
  }
  get voteOptions(): VoteOption[] {
    return this.discussion.voteOptions;
  }
  get voteResult(): VoteType[] {
    return this.comment ? this.comment.vote : [];
  }
  get isMy(): boolean {
    return this.comment ? this.comment.isMy : false;
  }
  @ViewChild('formComponent') formComponent: ElementRef<HTMLDivElement>;
  constructor(private discussion: DiscussionComponent) {
    this.enableAdd = this.discussion.canWrite;
  }

  ngOnInit(): void {
    this.enableEdit = this.discussion.canUpdate && this.isMy;
  }
  ngOnDestroy(): void {
    this.unsubscribe();
  }
  private unsubscribe(): void {
    if (this.readSubs) {
      this.readSubs.unsubscribe();
      this.readSubs = null;
    }
  }
  send(): void {
    if (this.actionUpdate === 'Update') {
      return this.update();
    }
    if (this.newComment && this.newComment.length > 0) {
      const d = new Date();
      this.processing.push({
        id: '' + this.processing.length, responses: [], expand: false, isMy: true, created: d.toISOString(),
        comment: this.newComment, numberOf: 0, nickName: this.whoami, vote: []
      });
      this.discussion.addComment(this.newComment, this.comment.id);
      this.showForm = false;
      this.newComment = '';
    }
  }
  update(): void {
    if (this.comment) {
      this.comment.comment = this.newComment;
      this.discussion.updateComment(this.newComment, this.comment.id);
    }
    this.showForm = false;
    this.actionUpdate = 'Send';
  }
  read(): void {
    if (this.comment) {
      const from = this.responses.length - this.processing.length;
      this.unsubscribe(); // yes we cancel request
      this.readSubs = this.discussion.readNext(from, this.comment.id).subscribe(c => {
          this.processing = [];
          this.comment.responses = this.comment.responses.concat(c.responses);
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }
  cancel(): void {
    this.showForm = false;
  }
  edit(): void {
    console.log('edit');
    if (this.comment && this.isMy) {
      this.newComment = this.comment.comment;
      this.showForm = true;
      this.actionUpdate = 'Update';
    }
  }
}
