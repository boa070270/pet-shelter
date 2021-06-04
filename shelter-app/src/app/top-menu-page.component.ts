import {ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {BasicService} from './basic.service';
import {
  AbstractDataSource,
  CommentResponse,
  CommentType,
  DialogService,
  DiscussionMediator, EditableListComponent,
  ExtendedData,
  GeneratorFormComponent,
  SwaggerFormService,
  SwaggerNative,
  SwaggerObject,
  swaggerUI, TableProviderService,
  TitleType,
  VoteOption,
  VoteType,
  ScrollEventService
} from 'ui-lib';
import {BehaviorSubject, EMPTY, from as fromObject, Observable} from 'rxjs';
import {NgForm} from '@angular/forms';

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
  @ViewChild('form') form: GeneratorFormComponent;
  @ViewChild('tmplDialog') tmplDialog: TemplateRef<any>;
  voteOptions = VOTE_OPTIONS;
  voteResult = generateVoteTypes(true);
  checkbox: ['two'];
  radio: string[];
  dir = 'ltr';
  inputDefault = 101;
  inputValue = 'Ввід слів _';
  select: ['two', 'one'];
  swagger = new SwaggerObject(
    ['id', 'description', 'child'],
    {
      id: SwaggerNative.asString(),
      description: SwaggerNative.asString(),
      child: new SwaggerObject(
        ['childId', 'childDescription', 'sex'],
        {
          childId: SwaggerNative.asString(),
          childDescription: SwaggerNative.asString(),
          sex: SwaggerNative.asString(null, {enum: ['m', 'f']})
        })
      });
  swaggerOption = [this.swagger];
  /******* Table *******/
  tableDataSet = [
    {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
    {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
    {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
    {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
    {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
    {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
    {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
    {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
  ];
  tableColumnSet = ['position', 'name', 'weight', 'symbol'];
  tableCaption = 'Test table';
  tableData = new BehaviorSubject<any>(this.tableDataSet);
  tableColumns = this.tableColumnSet;
  listOptions = ['first', 'second', 'third', 'fifth', 'sixth'];
  listOptions2 = ['first', 'second', 'third', 'fifth', 'sixth'];
  lustTitles: TitleType[] = [
    {id: 'first', lang: 'en', title: 'First element'},
    {id: 'first', lang: 'uk', title: 'First element'},
    {id: 'second', lang: 'en', title: 'First element'},
    {id: 'second', lang: 'uk', title: 'First element'},
    {id: 'first', lang: 'en', title: 'First element'},
    {id: 'first', lang: 'uk', title: 'First element'},
    {id: 'first', lang: 'en', title: 'First element'},
    {id: 'first', lang: 'uk', title: 'First element'},
    {id: 'first', lang: 'en', title: 'First element'},
    {id: 'first', lang: 'uk', title: 'First element'},
  ];
  listSelect: any;
  tblSwagger: SwaggerObject;
  tblData: AbstractDataSource<any>;
  posY: any;
  constructor(private basicService: BasicService,
              private dynamicSwagger: SwaggerFormService,
              private dialogService: DialogService,
              private tableProvider: TableProviderService,
              private scrollEvent: ScrollEventService,
              protected changeDetector: ChangeDetectorRef) {
    dynamicSwagger.addSchemaIfNotExists('test', this.swagger);
    this.tblData = tableProvider.getDataSource('test');
    this.tblSwagger = this.tableProvider.getTableSwagger('test');
    this.scrollEvent.eventEmitter.subscribe(se => {
      this.posY = se;
      this.changeDetector.detectChanges();
    });
  }

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

  onSubmit(form: NgForm): void {
    console.log(form);
    const obj = {id: 'set top', description: 'set description top', child: {childId: 'set child Id', childDescription: 'set child Description', sex: 'm'}};
    console.log('set new value to form', obj);
    form.setValue(obj);
  }

  openDialog(): void {
    const extData = new ExtendedData();
    extData.action = 'save_cancel';
    extData.caption = 'Hello World!';
    extData.icon = 'gm-warning';
    extData.swagger = new SwaggerObject(
      ['login', 'password'],
      {
        login: SwaggerNative.asString('lib-input-control', null, swaggerUI([{lang: 'en', title: 'Login'}, {lang: 'uk', title: 'Логін'}])),
        password: SwaggerNative.asString('lib-input-control', {format: 'password'}, swaggerUI([{lang: 'en', title: 'Password'}, {lang: 'uk', title: 'Пароль'}])),
      },
    null,
      ['login', 'password']);
    extData.data = {login: 'admin', password: '******'};
    const dialogRef = this.dialogService.warnExtDialog(extData, true);
    console.log('TopMenuPageComponent.openDialog', dialogRef);
    dialogRef.afterOpened().subscribe(v => {
      console.log(v);
    });
    dialogRef.afterClosed().subscribe(v => {
      console.log(v);
    });
  }
}
