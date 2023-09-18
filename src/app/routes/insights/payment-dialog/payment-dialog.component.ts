import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'app/service/api.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { first, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss'],
})
export class PaymentDialogComponent implements OnInit {

  shop_name: any;
  order_id: any;
  order_name: any;
  order_time: any;
  order_date: any;
  order_total_amount: string;
  temp: any[];
  order_discount: string;
  order_tax_amount: string;
  prod_name = [];
  prod_type: any;
  prod_qty: any;
  prod_price: any;
  ptype: any;
  order_item_total = 0.00;
  order_d_charge: string;
  order_address: any;
  order_products: any;
  order_d_time: any;
  order_r_name: any;
  order_cooking: any;
  order_couponcode: any;
  order_mobile: any;

  constructor(
    private formBuilder: FormBuilder,
    public httpClient: HttpClient,
    public dialog: MatDialog,
    private apiservice: ApiService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    // console.log(this.data)
    this.shop_name = this.apiservice.shop_name
    this.addCategoriestoAssign(this.data,this.apiservice.shop_id,this.apiservice.shop_code);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  addCategoriestoAssign(data1,shop_id,token) {
    if (data1 != null) {
      var orderDetailsURL = "order_details.php?sid="+shop_id+"&token="+token
      this.apiservice
        .PostToServer(orderDetailsURL, data1)
        .pipe(first())
        .subscribe(data => {
          // console.log(data['order_details'][0]);
          var order = data['order_details'][0];
          this.order_id = order['order_id']
          this.order_name = order['name']
          this.order_mobile = order['mobile']
          this.order_r_name = order['rider_name']
          this.order_cooking = order['cooking']
          this.order_couponcode = order['coupon_code']
          this.order_address = order['address']
          this.order_time = this.changetime(order['time'])
          this.order_d_time = this.changetime(order['d_time'])
          this.order_date = this.changedate(order['date'])
          this.temp = [];
          this.order_discount = '₹ ' + order['discount'];
          this.order_d_charge = '₹ ' + order['d_charge'];
          this.order_tax_amount = '₹ ' + order['tax_amount'];
          this.order_total_amount = '₹ ' + order['total_amount'];
          this.prod_name = order['product_name'].split('$;');
          this.prod_type = order['product_type'].split('$;');
          // this.ptype = order['type'].split('$;');
          this.prod_qty = order['product_qty'].split('$;');
          this.prod_price = order['product_price'].split('$;');
          for (let j = 0; j < this.prod_name.length; j++) {
            if (this.prod_type[j] == 'Veg') {
              this.temp.push({
                id: j,
                product: this.prod_qty[j] + ' x ' + this.prod_name[j] + ' ( ' + this.prod_type[j] + ' )',
                price: '₹ '+ this.prod_price[j],
                image: '../assets/images/arrow.png',
              });
            } else {
              this.temp.push({
                id: j,
                product: this.prod_qty[j] + ' x ' + this.prod_name[j] + ' ( ' + this.prod_type[j] + ' )',
                price: '₹ '+ this.prod_price[j],
                image: '../assets/images/arrow.png',
                description: this.prod_qty[j] + ' x ' + this.prod_name[j] + ' ( ' + this.prod_type[j] + ' )' + ' =  ₹'+ this.prod_price[j],
              });
            }
            this.order_item_total +=  parseFloat(this.prod_price[j])
          }
          var products1 = this.temp;
          order['products'] = products1;
          this.order_products = order['products']
        });
    }
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
