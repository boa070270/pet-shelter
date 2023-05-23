import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef, Inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild, ViewContainerRef
} from '@angular/core';
import {BasicService} from './basic.service';
import {DialogService, NavbarComponent, SYSTEM_LANG_TOKEN, SystemLang, UIMenu} from 'ui-lib';
import {Subscription} from 'rxjs';
import {LanguageType, MenuTree} from './common/types';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
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
  menu: UIMenu[];
  private subscription: Subscription;
  private subscriptionLang: Subscription;
  arrow: string;
  @ViewChild('sidebar') sidebar: TemplateRef<any>;
  @ViewChild(NavbarComponent, {read: ViewContainerRef}) navbarViewRef: ViewContainerRef;
  searchText: string;
  humMenu = false;
  languages: LanguageType[];

  constructor(private service: BasicService,
              @Inject(SYSTEM_LANG_TOKEN) private systemLang: SystemLang,
              private systemMenu: SystemMenuService,
              private changeDetectorRef: ChangeDetectorRef,
              private router: Router,
              private dialog: DialogService,
              breakpointObserver: BreakpointObserver) {
    this.menuTree = systemMenu.menuTree();
    this.menu = this.menuTree2UIMenu(this.menuTree);
    this.languages = this.systemLang.getLanguages();
    router.events.subscribe((e) => console.log('router', e));
    console.log('constructor router.url', router.url);
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
    console.log('onInit router.url', this.router.routerState);
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
      this.menu = this.menuTree2UIMenu(this.menuTree);
    }
  }

  searchPagesAndPet(): void {
    console.log(`search for ${this.searchText}`);
    this.router.navigate(['/search', {query: this.searchText}]);
  }

  onSelectLang(e: Event): void {
    this.systemLang.setLocale((e.target as any).value);
  }

  onNavbar(event: any): void {
    switch (event.who) {
      case 'search':
        console.log('search phrase: ' + event.value);
        break;
      case 'sidebar':
        // this.dialog.sideLeft(this.sidebar, {hasBackdrop: true});
        this.dialog.openFromTemplate(this.sidebar, {
          disableClose: false,
          height: '100vh',
          position: {
            left: '0',
            top: '0'
          },
          scrollStrategies: 'block',
          // viewContainerRef: this.navbarViewRef,
          // backdropClass: 'part'
        });
        break;
      case 'menu':
        console.log('show menu');
        break;
    }
  }
  menuTree2UIMenu(menuTree: MenuTree[]): UIMenu[] {
    return menuTree ? menuTree.map(m => ({href: m.path, title: m.title, sub: this.menuTree2UIMenu( m.menu )})) : [];
  }
}
