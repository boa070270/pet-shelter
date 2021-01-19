import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BasicService} from './basic.service';
import {SystemLang} from 'ui-lib';
import {Subscription} from 'rxjs';
import {LanguageType, MenuTree} from './common/types';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {MatSidenav} from '@angular/material/sidenav';
import {Router} from '@angular/router';
import {SystemMenuService} from './system-menu.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  title = 'shelter-app';
  styleSdn: string;
  menuTree: MenuTree[];
  private subscription: Subscription;
  private subscriptionLang: Subscription;
  arrow: string;
  private toggleSnav = false;
  toolbarStyle: string;
  @ViewChild('sideNav') snav: MatSidenav;
  @ViewChild('sdnBtn') sdnBtn: ElementRef;
  searchText: string;
  humMenu = false;
  languages: LanguageType[];

  constructor(private service: BasicService,
              private systemLang: SystemLang,
              private systemMenu: SystemMenuService,
              private changeDetectorRef: ChangeDetectorRef,
              private router: Router,
              breakpointObserver: BreakpointObserver) {
    this.menuTree = systemMenu.menuTree();
    this.languages = this.systemLang.getLanguages();
    this.subscriptionLang = this.systemLang.onChange().subscribe(next => this.onLangChange(next));
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
    ]).subscribe(result => {
      if (result.matches) {
        if (result.breakpoints[Breakpoints.XSmall]){
          this.humMenu = true;
        } else if (result.breakpoints[Breakpoints.Small]){
          this.humMenu = true;
        } else if (result.breakpoints[Breakpoints.Medium]){
          this.humMenu = false;
        } else if (result.breakpoints[Breakpoints.Large]){
          this.humMenu = false;
        } else if (result.breakpoints[Breakpoints.XLarge]){
          this.humMenu = false;
        }
      }
    });

  }

  ngOnInit(): void {
    console.log('app-routing.OnInit');
  }
  ngAfterViewInit(): void {
    // this.snav.closedStart.subscribe(next => {
    //   console.log('sideNavObserver.next');
    //   this.onCloseSideNav();
    // });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscriptionLang.unsubscribe();
  }

  onLangChange(next: any): void {
    if (typeof next === 'string') {
      this.menuTree = this.systemMenu.menuTree();
    }
  }
  onCloseSideNav(): void {
    console.log('sideNavObserver complete:', this);
    this.arrow = 'arrow_right';
    this.styleSdn = undefined;
    this.toggleSnav = false;
    this.toolbarStyle = undefined;
  }
  sideToggle(): boolean {
    this.toggleSnav = !this.toggleSnav;
    this.snav.toggle(this.toggleSnav);
    if (this.toggleSnav) {
      this.styleSdn = `left: 200px;`;
      this.arrow = 'arrow_left';
      this.toolbarStyle = `margin-left: 200px; margin-right: -200px`;
    }
    return false;
  }

  searchPagesAndPet($event: MouseEvent): void {
    console.log(`search for ${this.searchText}`);
    this.router.navigate(['/search', {query: this.searchText}]);
  }

  onSelectLang(e: Event): void {
    this.systemLang.setLocale((e.target as any).value);
  }
}
