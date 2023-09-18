import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/service/api.service';

@Component({
  selector: 'app-user',
  template: `
    <button
      mat-button
      class="matero-toolbar-button matero-avatar-button"
      href="javascript:void(0)"
      [matMenuTriggerFor]="menu"
    >
      <img class="matero-avatar" src="{{ imageurl }}" width="32" alt="avatar" />
      <span class="matero-username" fxHide.lt-sm>{{ username }}</span>
    </button>

    <mat-menu #menu="matMenu">
      <a routerLink="/settings" mat-menu-item>
        <mat-icon>settings</mat-icon>
        <span>Settings</span>
      </a> 
      <a (click)="logout()" mat-menu-item>
        <mat-icon>exit_to_app</mat-icon>
        <span>Logout</span>
      </a>
    </mat-menu>
  `,
})

export class UserComponent implements OnInit{
  username:String;
  imageurl:String;
  constructor(private apiservice: ApiService) {}

  ngOnInit(): void {
    if(this.apiservice.shop_name != null)
    {
      this.username = this.apiservice.username
      this.imageurl = this.apiservice.shop_logo
    }
    // else this.apiservice.userLogout()
  }
  
  logout() {
    this.apiservice.userLogout()
  }

}
