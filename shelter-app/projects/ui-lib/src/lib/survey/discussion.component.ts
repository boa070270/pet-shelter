import {Component, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {DiscussionMediator, CommentType, VoteOption, VoteType, CommentResponse} from './disscution-api';
import {BrowserStorageService} from '../shared';
import {Observable, Subscription} from 'rxjs';
import {SystemLang} from '../i18n';

@Component({
  selector: 'lib-discussion',
  templateUrl: './discussion.component.html',
  styleUrls: ['./discussion.component.scss']
})
export class DiscussionComponent implements OnInit, OnDestroy {
  @Input() resourceId: string;
  @Input() size = 10;
  @Input() expand: 'expandAll' | 'expandTop' | 'expandTopAndFirst' = 'expandTop';
  @Input() voteOptions: VoteOption[];
  @Input() enableEditNick;
  @Input() commentBehavior: {update?: boolean, add?: boolean, obtain?: boolean} = {};
  private nick: string;
  private readSubs: Subscription;
  voteResults: VoteType[];
  canObtain = false;
  canWrite = false;
  canUpdate = false;
  comments: Array<CommentType> = [];
  private processing: CommentType[] = [];
  numberAll: number;
  hideShow = false;
  showForm = false;
  newComment: string;
  private expandFn: (comments: Array<CommentType>) => void = () => {};
  get nickName(): string {
    return this.nick;
  }
  set nickName(s: string) {
    this.nick = s;
  }
  constructor(@Inject('DiscussionMediator') private mediator: DiscussionMediator,
              private storageService: BrowserStorageService) {
    this.nick = storageService.get('discussion_component_nickName');
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
  ngOnInit(): void {
    if (this.expand === 'expandAll') {
      this.expandFn = (c) => {
        for (const e of c) {
          e.expand = true;
          if (e.responses && e.responses.length > 0) {
            this.expandFn(e.responses);
          }
        }
      };
    } else if (this.expand === 'expandTop') {
      this.expandFn = (c) => c.map(v => v.expand = true);
    } else if (this.expand === 'expandTopAndFirst') {
      this.expandFn = (c) => {
        for (const e of c) {
          e.expand = true;
          if (e.responses && e.responses.length > 0) {
            e.responses[0].expand = true;
          }
        }
      };
    }
    if (this.mediator) {
      if (this.mediator.getComment) {
        this.canObtain = this.commentBehavior.obtain;
        this.read();
      }
      if (this.mediator.addComment) {
        this.canWrite = this.commentBehavior.add;
      }
      if (this.mediator.updateComment) {
        this.canUpdate = this.commentBehavior.update;
      }
    }
  }
  readNext(from: number, commentId?: string): Observable<CommentResponse> {
    return this.mediator.getComment(this.resourceId, this.size, 0);
  }
  addComment(comment: string, commentId?: string, nickName?: string): void {
    if (this.canWrite) {
      this.mediator.addComment(this.resourceId, comment, nickName || this.nickName, commentId)
        .subscribe(() => {}, (err) => console.log(err));
    }
  }
  updateComment(comment: string, commentId: string): void {
    if (this.canUpdate) {
      this.mediator.updateComment(this.resourceId, comment, commentId).subscribe(() => {}, (err) => console.log(err));
    }
  }
  read(): void {
    this.unsubscribe();
    this.readSubs = this.readNext(this.comments.length, null).subscribe(
      (c) => {
        this.expandFn(c.responses);
        this.comments = this.comments.concat(c.responses);
        this.numberAll = c.numberOf;
        this.voteResults = c.vote;
        this.processing = [];
      }
    );
  }
  send(): void {
    if (this.newComment && this.newComment.length > 0) {
      const d = new Date();
      this.processing.push({
        id: '' + this.processing.length, responses: [], expand: false, isMy: true, created: d.toISOString(),
        comment: this.newComment, numberOf: 0, nickName: this.nickName, vote: []
      });
      this.addComment(this.newComment, null);
      this.showForm = false;
      this.newComment = '';
    }
  }

}
