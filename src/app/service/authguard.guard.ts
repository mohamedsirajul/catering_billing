import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { MenuService } from '@core/bootstrap/menu.service';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})

export class AuthguardGuard implements CanActivate {
    constructor(private dataService: ApiService, private router: Router,private menuService: MenuService) { }
    menus = this.menuService.getAll();
    userRoles = [];
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        // console.log(state.url)
        // console.log(route.data.title)
        // console.log(this.menus)
        if (!this.dataService.isAuthenticated()) {
            this.router.navigate(['/auth/login'])
            return false
        }
        else 
        {
            if (state.url.includes('-')) { 
                return true
            }
            if(!this.hasAccess(route))
            {
                this.router.navigate(['/sessions/404'])
            }
            return true
        }
    }

    hasAccess(route):Boolean
    {
        let nomenu = 0
        for(let i = 0;i < this.menus.length; i++)
        {
            if(route.data.title == this.menus[i].name)
            {
                if(this.dataService.role == '2')
                {
                  this.userRoles = ["admin","manager","user"]
                }
                else if(this.dataService.role == '1')
                {
                  this.userRoles = ["manager","user"]
                }
                else if(this.dataService.role == '0')
                {
                  this.userRoles = ["user"]
                }
                nomenu = i
                if (this.menus[i].roles.length == 0) {
                    return true;
                } else {
                    if(nomenu == this.menus.length - 1)
                    return true
                    else
                    return this.menus[i].roles.some(role => this.userRoles.includes(role));
                }
            }
        }
        
        // return false
    }

}