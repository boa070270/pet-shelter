import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthorizationService} from "./authorization.service";
import {SystemMenuService} from "./system-menu.service";
import {UserTypeRoleEnum} from "./common/types";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthorizationService,
              private router: Router,
              private systemMenu: SystemMenuService) {
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const url = state.url;
    const roles = this.authService.getRoles() || [];
    const menu = this.systemMenu.getMenu(url);
    const mRole = (menu && menu.role) ? menu.role.split(',') : [];
    if (mRole.find( v => v === UserTypeRoleEnum.public)) {
      return true;
    }
    if (mRole.find(v => roles.includes(v))) {
      return true;
    }
    this.authService.redirectUrl = url;
    return this.router.parseUrl('/login');
  }

}
