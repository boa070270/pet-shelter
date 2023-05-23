import {Directive, ElementRef, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {EditorStore, EditorStoreToken, Page, PageSnapshotStorage, PageSnapshotToken} from './editor-store';
import {ActivatedRoute} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {CUSTOM_DS_SERVICE, CustomDSService, SYSTEM_LANG_TOKEN, SystemLang} from '../shared';
import {Subscription} from 'rxjs';

@Directive({
  selector: '[libDynamicPage]'
})
export class DynamicPageDirective implements OnInit, OnDestroy {
  /*
   where find the id
   'attribute' - take it in from idParam
   'path' - take it from path
   'query' - take it from query where param's name is stored in pageIdParam
   */
  @Input() idSource: 'attribute' | 'path' | 'query';
  @Input() pageIdParam: string; // for 'attribute' & 'query'
  page: Page;
  private subs: Subscription;
  private id: string;
  constructor(private element: ElementRef,
              @Inject(EditorStoreToken) private editorStorage: EditorStore,
              @Inject(PageSnapshotToken) private pageSnapshot: PageSnapshotStorage,
              private route: ActivatedRoute,
              private titleService: Title,
              @Inject(SYSTEM_LANG_TOKEN) private systemLang: SystemLang,
              @Inject(CUSTOM_DS_SERVICE) private customDSRepo: CustomDSService) {
    this.subs = this.systemLang.onChange().subscribe(l => {
      if (typeof l === 'string') {
        this.changeLang();
      }
    });
  }
  ngOnInit(): void {
    this.id = this.pageId();
    if (this.id) {
      this.editorStorage.getPage(this.id).subscribe(p => {
        this.page = p;
        if (typeof this.page.title === 'string') {
          this.titleService.setTitle(this.page.title);
        } else {
          this.changeLang();
        }
        this.renderPage();
      });
    }
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.pageSnapshot.rm(this.id);
  }
  private pageId(): string {
    switch (this.idSource) {
      case 'attribute':
        return this.pageIdParam;
      case 'path':
        const sgs = this.route.snapshot.url;
        return sgs[sgs.length - 1].path;
      case 'query':
        return this.route.snapshot.paramMap.get(this.pageIdParam);
    }
  }
  private renderPage(): void {
    const snapshot: any = {
      i18n: this.page.i18n,
      staticData: this.page.staticData,
      ds: {},
      swf: {}
    };
    // read all datasources and publish them
    if (this.page.dataSources) {
      const ds = snapshot.ds;
      for (const n of this.page.dataSources) {
        if (snapshot.staticData[n]) {
          ds[n] = snapshot.staticData[n];
          delete snapshot.staticData[n];
        } else {
          ds[n] = this.customDSRepo.obtainDS(n);
        }
      }
    }
    if (this.page.swf) {
      const swf = snapshot.swf;
      for (const n of this.page.swf) {
        if (snapshot.staticData[n]) {
          swf[n] = snapshot.staticData[n]; // TODO perhaps need convert here
          delete snapshot.staticData[n];
        } else {
          // swf[n] = this.customDSRepo.obtainDS(n); // TODO link swagger here
        }
      }
    }
    this.pageSnapshot.put(this.id, snapshot);
    this.element.nativeElement.innerHTML = this.page.source;
  }

  private changeLang(): void {
    if (typeof this.page.title !== 'string') {
      this.titleService.setTitle(this.systemLang.getTitle(this.page.title));
    }
  }
}
