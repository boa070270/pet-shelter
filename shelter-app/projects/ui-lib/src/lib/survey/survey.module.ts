import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {CommentComponent} from './comment.component';
import {VoteComponent} from './vote.component';
import {DiscussionComponent} from './discussion.component';

@NgModule({
  declarations: [
    CommentComponent,
    VoteComponent,
    DiscussionComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    CommentComponent,
    VoteComponent,
    DiscussionComponent
  ]
})
export class SurveyModule { }
