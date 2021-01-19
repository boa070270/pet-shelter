import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Direction, ShowResultType, VoteOption, VoteType} from 'ui-lib';
import {BasicService} from '../../basic.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.sass']
})
export class VoteComponent implements OnInit, OnDestroy {
  @Input() voteId: number;
  @Input() disableEdit: false;
  @Input() direction: Direction;
  @Input() showResult: ShowResultType;
  @Input() options: VoteOption[];
  @Input() multiVote: false;
  @Input() refresh: string; // {manual: boolean, auto: number}
  results: VoteType[] = [];
  private id: string;
  subs: Subscription;

  constructor(private route: ActivatedRoute, private basicService: BasicService) {}

  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.subs = this.basicService.getVotes(this.id).subscribe( v => {
      if (this.voteId) {
        this.results = v.filter(d => d.voteId === this.voteId );
      } else {
        this.results = v;
      }
    });
  }
  onChoice(data: Array<string>): void {
    // if ()
  }
}
