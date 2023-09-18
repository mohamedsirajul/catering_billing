import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/service/api.service';

@Component({
  selector: 'app-branding',
  template: `
    <a class="matero-branding" href="#/">
      <img src="{{ imageurl }}" class="matero-branding-logo-expanded" alt="logo" />
      <span class="matero-branding-name">{{ shopname }}</span>
      <img *ngIf="!status" src="./assets/images/is_nv.png" class="matero-branding-logo-expanded" matTooltip="Not Verified" alt="logo" />
      <img *ngIf="status"src="./assets/images/is_v.png" class="matero-branding-logo-expanded" matTooltip="Verified Business" alt="logo" />
    </a>
  `,
})
export class BrandingComponent implements OnInit{
  shopname:String;
  imageurl:String;
  status = false;
  constructor(private apiservice: ApiService) {}

  ngOnInit(): void {
    if(this.apiservice.shop_name != null)
    {
      if(this.apiservice.status == 0)
      {
        this.status = false;
      }
      else{
        this.status = true;
      }
      this.shopname = this.apiservice.shop_name
      this.imageurl = "https://iconxtechnologies.in/business/app/madhuram_catering/logo/catering.png"
    }
  }
}
