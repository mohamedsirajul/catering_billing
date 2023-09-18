import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiService } from 'app/service/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})


export class DashboardComponent implements OnInit {
  recent_orders: string[] = ['s_no','order_no', 'order_date', 'name', 'amount'];
  displayedColumns: string[] = ['sno', 'u_date', 'name', 'mobile','location'];
  dataSource =[];

  messages = [];
  dashboarddata = {}
  resize_status = true
  stats = [
    {
      title: 'Estimates',
      amount: "0",
      progress: {
        value: 50,
      },
      color: 'bg-indigo-500',
      desc: 'Totally No. of Estimates',
    },
    // {
    //   title: 'Invoices',
    //   amount: "0",
    //   progress: {
    //     value: 50,
    //   },
    //   color: 'bg-blue-500',
    //   desc: 'Totally No. of Invoices',
    // },
    {
      title: 'Customers',
      amount: "0",
      progress: {
      value: 50,
      },
      color: 'bg-teal-500',
      desc: 'No. of Customers',
    },
    {
      title: 'Products',
      amount: "0",
      progress: {
        value: 50,
      },
      color: 'bg-green-500',
      desc: 'No. of Active Products',
    },
    {
      title: 'Users',
      amount: "0",
      progress: {
        value: 50,
      },
      color: 'bg-blue-500',
      desc: 'Totally No. of Users',
    },
  ];
  form_status = true
  order_status = true
  cus_status = true

  onResize(event) {
    if(event.target.innerWidth < 600){
      this.resize_status = false;
    } 
    if(event.target.innerWidth > 600){
      this.resize_status = true;
    }
  }

  dir = 'assets/images/pixabay/';
  images: any[] = [];

  constructor(
    public httpClient: HttpClient,
    public dialog: MatDialog,
    private apiservice: ApiService,
    private router: Router
  ) {
    // for (let i = 1; i <= 20; i++) {
    //   this.images.push({
    //     title: i,
    //     src: this.dir + i + '.jpg',
    //   });
    // }
  }

  ngOnInit() {
    if (navigator.onLine) {
      this.apiservice.openSpinner()
      this.loadData(this.apiservice.shop_id);
    }
    else {
      this.router.navigate(['/no-internet']);
    }
  }

  newnotiEntry() {
    this.router.navigate(['//pending-payment']);
  }

  loadData(shop_id) {
    var dashboardURL = this.apiservice.dashboardURL+"?shop_id="+shop_id+"&user_id="+this.apiservice.userid
    // console.log(dashboardURL)
    this.httpClient.get(dashboardURL).subscribe(data => {
      // console.log(data)
      this.dashboarddata = data
      if(!this.dashboarddata['logout'])
      {
        this.stats[0].amount = this.dashboarddata['estimates']
        // this.stats[1].amount = this.dashboarddata['invoices']
        this.stats[1].amount = this.dashboarddata['customers']
        this.stats[2].amount = this.dashboarddata['products']
        this.stats[3].amount = this.dashboarddata['users']
        if(this.dashboarddata['orders'] != null)
        {
          this.dataSource = this.dashboarddata['orders']
          this.order_status = true
        }
        else 
        {
          this.order_status = false
        }
      }
      else{
        alert("session Expired")
        this.apiservice.userLogout()
      }
      this.apiservice.closeSpinner()
      }
    );

  }

  // {
  //   "state": "dashboard",
  //   "name": "Dashboard",
  //   "type": "link",
  //   "icon": "dashboard"
  // },
}

