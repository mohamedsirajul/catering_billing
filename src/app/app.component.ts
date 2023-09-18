import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PreloaderService } from '@core';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit, AfterViewInit {
  constructor(private preloader: PreloaderService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // console.log("54")
    this.preloader.hide();
  }
}

// {
//   "state": "insights",
//   "name" : "Report",
//   "type" : "sub",
//   "icon" : "poll",
//   "roles": ["admin","manager"],
//   "children": [
//     {
//       "state": "booking",
//       "name" : "Booking Report",
//       "icon" : "local_dining",
//       "type" : "link"
//     },
//     {
//       "state": "sales",
//       "name" : "Sales Report",
//       "icon" : "local_dining",
//       "type" : "link"
//     },
//     {
//       "state": "product",
//       "name" : "Product Report",
//       "icon" : "local_dining",
//       "type" : "link"
//     },
//     {
//       "state": "product-bill",
//       "name" : "Product Bill Report",
//       "icon" : "local_dining",
//       "type" : "link"
//     },
//     {
//       "state": "customer",
//       "name" : "Customer Payment",
//       "icon" : "local_dining",
//       "type" : "link"
//     },
//     {
//       "state": "est-payment",
//       "name" : "Estimate Payment",
//       "icon" : "local_dining",
//       "type" : "link"
//     },
//     {
//       "state": "tax",
//       "name" : "Tax Report",
//       "icon" : "local_dining",
//       "type" : "link"
//     },
//     {
//       "state": "log",
//       "name" : "User Log Report",
//       "icon" : "local_dining",
//       "type" : "link"
//     }
//   ]
// },

// {
//   "state": "users",
//   "name" : "Users",
//   "type" : "link",
//   "icon" : "account_circle",
//   "roles": ["admin"]
// },