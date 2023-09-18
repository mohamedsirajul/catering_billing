import { E } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiService } from 'app/service/api.service';
import { Observable, Subscription, timer } from 'rxjs';
import { first } from 'rxjs/operators';
import * as screenfull from 'screenfull';
import { OrderDialogComponent } from '../order-dialog/order-dialog.component';
import { interval, Subject } from 'rxjs';
import { MediaObserver } from '@angular/flex-layout';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class HeaderComponent implements OnInit,OnDestroy {
  @Input() showToggle = true;
  @Input() showBranding = true;
  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() toggleSidenavNotice = new EventEmitter<void>();
  shopname: string;
  shopstatus: string;
  shop_status = false
  val = 0;
  myDate: any;
  actualdata = {}
  data = {}
  pending_orders = [];
  subscription: Subscription;
  dialogRef;
  refresh: Observable<number> = timer(0, 10000);

  private get screenfull(): screenfull.Screenfull {
    return screenfull as screenfull.Screenfull;
  }

  mediaSub: Subscription;
  constructor(private apiservice: ApiService,public httpClient: HttpClient,private router: Router, private datePipe: DatePipe,private dialog: MatDialog,public mediaObserver:MediaObserver) {}
  
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  dateTime=Date.now();
  private $inActive=new Subject<boolean>();

  // startClock(){
  //   interval(1).subscribe(date=>{
  //     this.dateTime=Date.now();
  //   });
  // }

  ngOnInit() {
    // this.startClock();
    this.apiservice.isAuthenticated()
    // console.log(this.apiservice.shop_name)
    if(this.apiservice.shop_name != null)
    {
      this.myDate = new Date();
      this.myDate = this.datePipe.transform(this.myDate, 'yyyy-MM-dd');
      this.shopname = this.apiservice.shop_name
      this.subscription = this.refresh.subscribe(() => {
        // console.log("test")
        // this.getshopstatusfirst(this.myDate,this.apiservice.shop_id,this.apiservice.shop_code);
      });
      // this.getshopstatusfirst();
    }
    // else this.apiservice.userLogout()
  }

  toggleChecked()
  {
    // console.log(this.shop_status)
    this.getshopstatus();
  }

  // TODO:
  toggleFullscreen() {
    if (this.screenfull.enabled) {
      this.screenfull.toggle();
    }
  }

  getshopstatusfirst(date,shop_id,token)
  {
    var getOrders = "orders_and_status.php?sid="+shop_id+"&token="+token
    this.apiservice
    .PostToServer(getOrders, date)
    .pipe(first())
    .subscribe(data => {
        this.actualdata = data;
        this.data = this.actualdata
        this.pending_orders = data['pending orders'];

        if(this.pending_orders != null)
        {
          // this.play_audio = true

          if(this.dialogRef == null)
          {
            this.dialogRef = this.dialog.open(OrderDialogComponent, {
              width: '600px',
              data: { order_id: this.pending_orders[0]['order_id'] },
              panelClass: "remove-padding",
              disableClose: true  
            });
  
            this.dialogRef.afterClosed().subscribe(result => {
              // console.log(result)
              this.dialogRef = null
            });
          }
          else{
            this.dialogRef.close();
            this.dialogRef = null
            this.getshopstatusfirst(this.myDate,this.apiservice.shop_id,this.apiservice.shop_code);
          }
        }
      });
  }

  getshopstatus() {
    if(this.shop_status)
    this.val = 0
    else
    this.val = 1
    this.apiservice.PostToServer('change_shop_status.php',this.val)
    .pipe(first())
    .subscribe(
        data => {
          // console.log(data)
            if (data["status"] == 1) {
              this.shop_status = true
              this.shopstatus = "ON"
            }
            if (data["status"] == 0) {
              this.shop_status = false
              this.shopstatus = "OFF"
            }
        })
  }
  
}

