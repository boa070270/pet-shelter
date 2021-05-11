import {Component, ComponentRef, Input, OnInit, ViewChild} from '@angular/core';
import {CdkPortalOutlet, ComponentPortal} from '@angular/cdk/portal';
import {ComponentsPluginService} from '../shared';

@Component({
  selector: 'lib-plugin',
  template: '<ng-template cdkPortalOutlet></ng-template>',
  styleUrls: ['./plugin.component.css']
})
export class PluginComponent implements OnInit {
  @Input() selectorName: string;
  @ViewChild(CdkPortalOutlet, {static: true}) portalOutlet: CdkPortalOutlet;
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
