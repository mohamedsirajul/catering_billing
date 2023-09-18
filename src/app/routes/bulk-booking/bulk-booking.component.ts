import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Component, ElementRef, Inject, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { first } from 'rxjs/operators';
import { ApiService } from 'app/service/api.service';
import { ToastrService } from 'ngx-toastr';
import { DialogBoxComponent } from '../menu/dialog-box/dialog-box.component';
import { GenInvoice } from 'app/service/invoice_gen';
import { PayDialogBoxComponent } from '../pay-dialog-box/pay-dialog-box.component';


@Component({
  selector: 'app-bulk-booking',
  templateUrl: './bulk-booking.component.html',
  styleUrls: ['./bulk-booking.component.scss'],

})
export class BulkBookingComponent implements OnInit {
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;

  formGroup: FormGroup;
  toppingsControl = new FormControl([]);
  filterForm = new FormGroup({});
  dataSource = new MatTableDataSource([]);

  displayedColumns: string[] = ['s_no','booking_no','booking_date','cus_name','delivery_date','action'];
  parameters: {};
  actualdata = {};
  data: any = {};
  notification_id: any;
  selectedColumns = [];
  filterValues = {};

  imageSrc: string;

  edit_status = false;
  report_status = true;
  submit_status = true;
  update_status = false;
  form_status = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    public httpClient: HttpClient,
    public dialog: MatDialog,
    private apiservice: ApiService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private geninvoice: GenInvoice
  ) {
    this.formGroup = this.formBuilder.group({
      title: ['', Validators.required],
      message: ['', Validators.required],
      file: ['',Validators.required],
      fileSource: ['',Validators.required],
      image: ['', Validators.required]
    });
  }

  myForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    message: new FormControl('', [Validators.required]),
    file: new FormControl('', [Validators.required]),
    fileSource: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
  });

  get c() {
    return this.myForm.controls;
  }

  ngOnInit() {
    this.loadBookingData(this.apiservice.shop_id);
  }

  loadBookingData(shop_id) {
    this.dataSource.data = []
    this.form_status = true;
    this.apiservice.openSpinner()
    var bookingURL = this.apiservice.bookingURL+"?sid="+shop_id
    this.httpClient.get(bookingURL).subscribe(data => {
      if(data != null)
      {
        // console.log(data)
        this.actualdata = data['bookings'];
        this.data = this.actualdata;
        this.form_status = false;
        this.dataSource.data = this.data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        if(this.data.length == 0)
        {
          this.toastr.error("No Data Found");
        }
        else{
          for (let i = 0; i < this.data.length; i++) {
            if(this.data[i]['status'] == 0)
            {
              this.data[i]['view_status'] = false
            }
            else if(this.data[i]['status'] == 1)
            {
              this.data[i]['view_status'] = true
            }
            if(this.data[i]['is_paid'] == 0)
            {
              this.data[i]['paid_status'] =  "Unpaid";
              this.data[i]['paidstatus'] = true
              this.data[i]['color'] =  "chip1";
            }
            else if(this.data[i]['is_paid'] == 1)
            {
              this.data[i]['paid_status'] =  "Partial Paid";
              this.data[i]['paidstatus'] = true
              this.data[i]['color'] =  "chip1";
            }
            else if(this.data[i]['is_paid'] == 2)
            {
              this.data[i]['paid_status'] =  "Paid";
              this.data[i]['paidstatus'] = false
              this.data[i]['color'] =  "chip1";
            }
          }
        }
    }
    else{
      this.form_status = false;
      this.toastr.error("No Data Found");
    }
    this.apiservice.closeSpinner()
    });

  }

  paidInvoice(action,obj)
  {
    obj.action = action;
    const dialogRef = this.dialog.open(PayDialogBoxComponent, {
      disableClose:true,
      width: '350px',
      height: 'auto',
      data:obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result.event == 'Add'){
        // console.log(result)
        this.addRowData(result.data);
      }
    });
  }

  addRowData(parameters){
    // console.log(parameters)
    this.form_status = true
      this.httpClient.post(this.apiservice.serverPaymentAddURL, parameters)
        .subscribe(res => {
          // console.log(res);
          this.form_status = false
            if(res['status'])
            {
              this.toastr.success(res['message']);
              this.ngOnInit()
            }
            else{
              this.toastr.error(res['message']);
            }
        })
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    this.dataSource.filter = filterValue;
    // console.log(filterValue)
  }

  newnotiEntry() {
    this.router.navigate(['//bulk-booking-new']);
  }

  viewEstimate(event,title)
  {
      // console.log(event.order_id)
      this.form_status = true
      var getBookingDetailsURL = this.apiservice.getBookingDetailsURL+"?order_id="+event.order_id+"&shop_id="+this.apiservice.shop_id
      this.httpClient.get(getBookingDetailsURL).subscribe(data => {
        // console.log(data)
        if(data['details'] != null)
        {
          this.form_status = false
          // console.log(data)
          this.actualdata = data['details'];
          this.data = this.actualdata;
          if(data['shop_details'] != null)
          this.geninvoice.genBookingPDF(this.data,data['shop_details'],title)
        }
        else{
          this.form_status = false;
          this.toastr.error("No Data Found");
          this.router.navigateByUrl('/estimates');
        }
  
      });
  }

  addPrice(event)
  {
    this.router.navigate(['//booking-edit', { params : event.order_id }]);
  }

  deleteEstimate(event)
  {
    let parameters;
    parameters = { 
      mode:"delete",
      shop_id:this.apiservice.shop_id,
      order_id:event.order_id
    }
    // console.log(parameters)
    this.form_status = true
      this.httpClient.post(this.apiservice.serverBookingURL, parameters)
        .subscribe(res => {
          // console.log(res);
          this.form_status = false
            if(res['status'])
            {
              this.toastr.success(res['message']);
              this.ngOnInit()
            }
            else{
              this.toastr.error(res['message']);
            }
        })
  }

  editEstimate(event)
  {
    this.router.navigate(['//bulk-booking-edit', { params : event.order_id }]);
    // console.log(event)
  }

  EstimatetoInvoice(orderid) {
    this.form_status = true
    var converttoInvoiceURL = this.apiservice.converttoInvoiceURL+"?order_id="+orderid+"&sid="+this.apiservice.shop_id+"&user_id="+this.apiservice.userid
    this.httpClient.get(converttoInvoiceURL).subscribe(data => {
      if(data != null)
      {
        this.form_status = false
        if(data['status'])
        {
          this.toastr.success(data['message']);
          this.router.navigate(['//invoices']);
        }
        else{
          this.toastr.error(data['message']);
        }
    }
    else{
      this.form_status = false;
      this.toastr.error("No Data Found");
    }

    });
  }

  convertEstimate(event)
  {
    this.EstimatetoInvoice(event.order_id)
    // console.log(event)
  }


}
