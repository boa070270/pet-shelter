import {Component, Input, OnInit} from '@angular/core';
import {MenuTree} from './common/types';
import {Router} from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.sass']
})
export class MenuComponent implements OnInit {

  @Input() menuTree: MenuTree[];
  @Input() oneButton = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

}
