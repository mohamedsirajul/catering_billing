import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'app/service/api.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { first, map, startWith } from 'rxjs/operators';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-order-dialog',
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.scss'],
})
export class OrderDialogComponent implements OnInit {

  shop_name: any;

  constructor(
    public httpClient: HttpClient,
    public dialog: MatDialog,
    private apiservice: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    // console.log(this.data)
    this.shop_name = this.apiservice.shop_name
  }

  changedate(old_date) {
    var date = old_date.split('-');
    return date[2] + '-' + date[1] + '-' + date[0];
  }

  changetime(old_time) {
    var time = old_time.split(':');
    var newtime;
    if (Number(time[0]) >= 12) {
      if (Number(time[0]) == 12) {
        newtime = '12' + ':' + time[1] + ' pm';
      } else {
        time[0] = Number(time[0]) - 12;
        newtime = time[0] + ':' + time[1] + ' pm';
      }
    } else {
      if (time[0] == '00') {
        newtime = '00' + ':' + time[1] + ' am';
      } else {
        newtime = time[0] + ':' + time[1] + ' am';
      }
    }
    return newtime;
  }

}
