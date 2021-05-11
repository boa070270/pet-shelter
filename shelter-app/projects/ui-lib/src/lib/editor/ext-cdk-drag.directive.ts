import {
  AfterViewInit,
  Component, ComponentFactoryResolver,
  ComponentRef,
  Directive, Injector,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {CdkDrag, CdkDragPreview} from '@angular/cdk/drag-drop';
import {CdkPortalOutlet, ComponentPortal} from '@angular/cdk/portal';
import {ComponentsPluginService} from '../shared';

@Component({
  selector: 'lib-whatever',
  template: '<ng-template cdkPortalOutlet #tmpl></ng-template>',
})
export class WhateverComponent implements OnInit {
  @Input() selectorName: string;
  @ViewChild(CdkPortalOutlet, {static: true}) portalOutlet: CdkPortalOutlet;
  @ViewChild('tmpl', { static: true }) public tmpl: TemplateRef<any>;
  private componentRef: ComponentRef<any>;

  constructor(private componentsPlugin: ComponentsPluginService) { }
  // TODO there is a lot of need to do. 1. add data to component.
  ngOnInit(): void {
    if (this.selectorName) {
      const plugin = this.componentsPlugin.getPlugin(this.selectorName);
      if (plugin) {
        const portal = new ComponentPortal(plugin.component);
        this.componentRef = this.portalOutlet.attachComponentPortal(portal);
      }
    }
  }

}

@Directive({
  selector: '[libExtCdkDrag]'
})
export class ExtCdkDragDirective implements AfterViewInit {
  @Input('libExtCdkDrag') selectorName: string;
  private componentRef: ComponentRef<WhateverComponent>;
  constructor(private cdkDrag: CdkDrag, private componentsPlugin: ComponentsPluginService,
              private viewContainerRef: ViewContainerRef,
              private injector: Injector,
              private resolver: ComponentFactoryResolver) {
    console.log(cdkDrag);
  }
  ngAfterViewInit(): void {
    if (this.selectorName) {
      const factory = this.resolver.resolveComponentFactory<WhateverComponent>(WhateverComponent);
      this.componentRef = this.viewContainerRef.createComponent(factory, this.viewContainerRef.length, this.injector);
      this.componentRef.instance.selectorName = this.selectorName;
      this.cdkDrag._placeholderTemplate = new CdkDragPreview<any>(this.componentRef.instance.tmpl);
    }
  }
}
