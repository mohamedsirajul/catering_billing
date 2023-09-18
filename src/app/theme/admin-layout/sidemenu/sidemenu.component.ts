import { Component, Input } from '@angular/core';
import { MenuService } from '@core';
import { ApiService } from 'app/service/api.service';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
})
export class SidemenuComponent {
  // NOTE: Ripple effect make page flashing on mobile
  @Input() ripple = false;

  menus = this.menuService.getAll();

  userRoles = [];

  constructor(private menuService: MenuService,private apiservice:ApiService) {}

  // Delete empty values and rebuild route
  buildRoute(states: string[]) {
    // console.log(this.menus)
    let route = '';
    states.forEach(item => {
      if (item && item.trim()) {
        route += '/' + item.replace(/^\/+|\/+$/g, '');
      }
    });
    return route;
  }

  hasAccess(item): boolean {
    if(this.apiservice.role == '2')
    {
      this.userRoles = ["admin","manager","user"]
    }
    else if(this.apiservice.role == '1')
    {
      this.userRoles = ["manager","user"]
    }
    else if(this.apiservice.role == '0')
    {
      this.userRoles = ["user"]
    }
    // console.log(item.roles)
    // check if user has required roles to access menu item
    if (item.roles.length == 0) {
      // item doesn't require any role, allow access
      return true;
    } else {
      // check if user has any of the required roles
      // return false
      return item.roles.some(role => this.userRoles.includes(role));
    }
  }

}
