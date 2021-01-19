import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BasicService} from './basic.service';
import {CommentResponse, CommentType, DiscussionMediator, VoteOption, VoteType} from 'ui-lib';
import {EMPTY, Observable} from 'rxjs';
import {from as fromObject} from 'rxjs';

const VOTE_OPTIONS: VoteOption[] = [
  {
    icon: 'thumb_up',
    option: 'like',
    title: [
      {id: 'like', lang: 'en', title: 'Like'},
      {id: 'like', lang: 'uk', title: 'Подобається'}
    ]
  },
  {
    icon: 'thumb_down',
    option: 'unlike',
    title: [
      {id: 'unlike', lang: 'en', title: 'UnLike'},
      {id: 'unlike', lang: 'uk', title: 'Не подобається'}
    ]
  },
];
const now = new Date();
const nowDateStr = now.toISOString();
const persons = ['Ahtyr Ahmatinsy', 'Bob Beker', 'Roma Niculin', 'Me', 'PrettyGirl', 'Natasha', 'Baby'];
const dummyText = [
  'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
  'Aenean commodo ligula eget dolor.', 'Aenean massa.',
  'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
  'Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.',
  'Nulla consequat massa quis enim.',
  'Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.',
  'In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.',
  'Nullam dictum felis eu pede mollis pretium.',
  'Integer tincidunt.',
  'Cras dapibus.',
  'Vivamus elementum semper nisi.',
  'Aenean vulputate eleifend tellus.',
  'Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.',
  'Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus.',
  'Phasellus viverra nulla ut metus varius laoreet.',
  'Quisque rutrum.',
  'Aenean imperdiet.',
  'Etiam ultricies nisi vel augue.',
  'Curabitur ullamcorper ultricies nisi.',
  'Nam eget dui.',
  'Etiam rhoncus.',
  'Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum.',
  'Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem.',
  'Maecenas nec odio et ante tincidunt tempus.',
  'Donec vitae sapien ut libero venenatis faucibus.',
  'Nullam quis ante.',
  'Etiam sit amet orci eget eros faucibus tincidunt.',
  'Duis leo.',
  'Sed fringilla mauris sit amet nibh.',
  'Donec sodales sagittis magna.',
  'Sed consequat, leo eget bibendum sodales, augue velit cursus nunc',
];
function randomBoolean(): boolean {
  return Math.random() * 1000 % 2 === 0;
}
function textGeneator(): string {
  const r = Math.floor(Math.random() * 1000 % 37);
  const result = [];
  for (let i = 0; i < r; ++i) {
    const k = Math.floor(Math.random() * 1000 % dummyText.length);
    result.push(dummyText[k]);
  }
  return result.join(' ');
}
function generateVoteTypes(me: boolean): VoteType[] {
  const result: VoteType[] = [];
  if (me) {
    result.push({
      me: {vote: 'like'},
      all: {vote: 'like', count: Math.floor(Math.random() * 1000 % 373)},
    });
  }
  result.push({
    all: {vote: 'like', count: Math.floor(Math.random() * 1000 % 373)},
  });
  return result;
}
function genComments(size: number): CommentType[] {
  const result: CommentType[] = [];
  const thisCount = Math.floor(size * 0.7);
  let left = Math.floor(size - thisCount);
  function sizeForChild(): number {
    const s = Math.floor(left * 0.2);
    if (s < 1) {
      return left;
    }
    left -= s;
    return s;
  }
  for (let i = 0; i < thisCount; ++i) {
    const nickName = persons[i % persons.length];
    result.push({
      id: '1',
      created: nowDateStr,
      nickName,
      comment: textGeneator(),
      vote: generateVoteTypes(nickName === 'Me'),
      isMy: nickName === 'Me',
      numberOf: Math.floor(Math.random() * 1000 % 373),
      responses: genComments(sizeForChild())
    });
  }
  return result;
}
const commentResponse: CommentResponse = {
  lastComment: nowDateStr,
  numberOf: 100,
  responses: genComments(20)
};

class Mediator implements DiscussionMediator {
  addComment(resourceId: string, comment: string, nickName: string | undefined, commentId: string | undefined): Observable<any> {
    console.log('addComment', resourceId, comment, nickName, commentId);
    return EMPTY;
  }

  // tslint:disable-next-line:max-line-length
  getComment(resourceId: string, size: number | undefined, from: number | undefined, commentId: string | undefined): Observable<CommentResponse> {
    console.log('getComment', resourceId, size, from, commentId);
    return fromObject([commentResponse]);
  }

  getVotes(resourceId: string, voteId: number | undefined): Observable<VoteType[]> {
    console.log('getVotes', resourceId, voteId);
    return EMPTY;
  }

  updateComment(resourceId: string, comment: string, commentId: string): Observable<any> {
    console.log('updateComment', resourceId, comment, commentId);
    return EMPTY;
  }

  vote(resourceId: string, vote: string, voteId: number | undefined): Observable<any> {
    console.log('vote', resourceId, vote, voteId);
    return EMPTY;
  }

}
@Component({
  selector: 'app-top-menu-page',
  templateUrl: './top-menu-page.component.html',
  styleUrls: ['./top-menu-page.component.sass'],
  providers: [
    {provide: 'DiscussionMediator', useClass: Mediator}
  ]
})
export class TopMenuPageComponent implements OnInit {
  // @ViewChild('voteUL') ulElement: ElementRef<HTMLUListElement>;
  voteOptions = VOTE_OPTIONS;
  voteResult = generateVoteTypes(true);
  checkbox: ['two'];
  radio: string[];
  dir = 'ltr';
  inputDefault = 101;
  inputValue: string = 'Ввід слів _';
  constructor(private basicService: BasicService) { }

  ngOnInit(): void {
  }

  onChoice(choice: string[]): void {
    console.log(choice);
  }

  clickUL($event: MouseEvent): void {
    const target: any = $event.target;
    if (target.tagName === 'LI') {
      console.log((target as HTMLLIElement).value);
    }
  }
}
