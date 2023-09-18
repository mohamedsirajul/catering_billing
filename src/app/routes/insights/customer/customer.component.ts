import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { OnInit, AfterViewInit, ViewChild, Component } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import * as moment from 'moment';
import { catchError, first, map, startWith, tap } from 'rxjs/operators';
import { Observable } from 'rxjs'
import { ApiService } from 'app/service/api.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { TableUtil } from 'app/service/table_utils';
import { GenInvoice } from 'app/service/invoice_gen';

interface Booking {
  value: string;
  viewValue: string;
}

@Component({
    selector: 'app-customer',
    templateUrl: './customer.component.html',
    styleUrls: ['./customer.component.scss'],
    providers: [DatePipe]
  })

export class CustomerComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;

  actualdata = {};
  dataSource: any;
  parameters: {};

  form_status = false;
  custom_status = false;
  start_date: any;
  end_date: any;

  w_f_date: any;
  w_l_date: any;

  m_f_day: any;
  m_l_day: any;

  types: Booking[] = [
    {value: 'estimate', viewValue: 'Estimate'},
    // {value: 'invoice', viewValue: 'Invoice'}
  ];
  data: any = {};
  payment_data: any = [];
  invoice_data: any = [];
  mobileNos : Observable<any[]>;
  mobile_no: FormControl = new FormControl();
  customer_options: Booking[] = [];

  today_date: any;
  displayedColumns: string[] = ['s_no','created_by','booking_no','delivery_date','rounded_total','advance','given','balance']
  head = [['S.No','Received By','Boking No','Delivery Date','Total (₹)','Advance (₹)','Given (₹)','Balance (₹)']];
  ex_head = ['S.No','Received By','Boking No','Delivery Date','Total (₹)','Advance (₹)','Given (₹)','Balance (₹)'];
  stats = [
    { 
      title: 'Total (₹)',
      amount: '0',
      color: 'bg-purple-500',
    },
    {
      title: 'Advance (₹)',
      amount: '0',
      color: 'bg-purple-500',
    },
    {
      title: 'Given (₹)',
      amount: '0',
      color: 'bg-purple-500',
    },
    {
      title: 'Balance (₹)',
      amount: '0',
      color: 'bg-purple-500',
    }
  ];

  selectedValue = this.types[0].value;

  constructor(public httpClient: HttpClient, private router:Router,
    private apiservice: ApiService,private datePipe: DatePipe,private toastr: ToastrService,
    private geninvoice: GenInvoice,
    ) {
  
    }

  tablename = "Payment Report";

  exportcsv() {
    if(this.dataSource.data.length != 0)
    TableUtil.generateReportExcel(this.dataSource.data,this.ex_head,this.displayedColumns, this.tablename,this.apiservice.shop_name);
    else alert("No Data")
  }

  exportpdf() {
    if(this.data.length != 0)
    TableUtil.exportPDF(
      this.dataSource.data,
      this.head,
      this.displayedColumns,
      this.apiservice.shop_name,
      this.tablename,
      'Payment Details'
    );
    else alert("No Data")
  }

  ngOnInit(){
    if(navigator.onLine){
      this.autocomplete()
      this.loadCustomerData(this.apiservice.shop_id)
    }
    else {
        this.router.navigate(['/no-internet']);
    }
  }

  getSelectValue()
  {
    for(let i =0;i < this.types.length;i++)
    {
      if(this.types[i].value == this.selectedValue)
      {
        this.tablename = this.types[i].viewValue
      }
    }
    this.dataSource = []
    this.stats[0].amount = '0'
    this.stats[1].amount = '0'
    this.stats[2].amount = '0'
    this.stats[3].amount = '0'
  }

  autocomplete() {
    this.mobileNos = this.mobile_no.valueChanges.pipe(
      startWith(''),
      map(val => this.filter1(val))
    );
  }

  private filter1(val: any): any[] {
    return this.customer_options.filter(option => option.viewValue.includes(val));
  }

  onTextChange(value) {
    this.dataSource = []
    this.stats[0].amount = '0'
    this.stats[1].amount = '0'
    this.stats[2].amount = '0'
    this.stats[3].amount = '0'
    // console.log(value)
  }

  loadCustomerData(shop_id) {
    // console.log(this.mobileNos)
    this.form_status = true;
    this.apiservice.openSpinner()
    var customerURL = this.apiservice.customerURL+"?sid="+shop_id
    this.httpClient.get(customerURL).subscribe(data => {
      if(data != null)
      {
        // console.log(data)
        this.actualdata = data['customers'];
        this.data = this.actualdata;
        if(this.data != null)
        {
          this.form_status = false
          for (let i = 0; i < this.data.length; i++) {
            this.customer_options.push({value: this.data[i]['cus_mobile'], viewValue: this.data[i]['cus_name']+" ("+this.data[i]['cus_mobile']+")"});
          }
        }
        this.customer_options = Array.from(new Set(this.customer_options));
        // console.log(this.customer_options)
        this.apiservice.closeSpinner()
    }
    else{
      this.form_status = false;
      this.toastr.error("No Data Found");
    }
    this.apiservice.closeSpinner()
    });

  }

  getInvoicedata(shop_id){
    this.form_status = true
    this.apiservice.openSpinner()
    var getInvoice = this.apiservice.invoicesURL+"?sid="+shop_id
    this.httpClient.get(getInvoice).subscribe(data => {
      // console.log(data)
      this.invoice_data = data['invoices'];
      if(this.invoice_data != null)
      {
        this.form_status = false
        for (let i = 0; i < this.invoice_data.length; i++) {
          this.customer_options.push(this.invoice_data[i]['invoice_no']);
        }
      }
      this.customer_options = Array.from(new Set(this.customer_options));
      this.apiservice.closeSpinner()
    });
  }

  onSelectionChanged(value) {
    let customer_mobile = '0'
    this.dataSource = new MatTableDataSource();
    for (let i=0;i<this.customer_options.length;i++)
    {
      if(this.customer_options[i].viewValue == value)
      {
        customer_mobile = this.customer_options[i].value
      }
    }
    let parameters = { 
      shop_id:this.apiservice.shop_id,
      cus_mobile:customer_mobile,
      type:this.selectedValue
    }
    this.form_status = true
    // console.log(parameters)
    this.apiservice.openSpinner()
      this.httpClient.post(this.apiservice.customerReportPaymentURL, parameters)
        .subscribe(data => {
          if(data['data'] != null)
          {
            this.data = data['data'];
            // console.log(data)
            this.dataSource.data = this.data;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            let total = 0, advance = 0, given= 0,balance = 0
            for(let i=0;i<this.dataSource.data.length;i++)
            {
              total = total + parseFloat(this.dataSource.data[i]['rounded_total'])
              advance = advance + parseFloat(this.dataSource.data[i]['advance'])
              given = given + parseFloat(this.dataSource.data[i]['given'])
              balance = balance + parseFloat(this.dataSource.data[i]['balance'])
            }
            this.stats[0].amount = parseFloat(total.toString()).toFixed(2)
            this.stats[1].amount = parseFloat(advance.toString()).toFixed(2)
            this.stats[2].amount = parseFloat(given.toString()).toFixed(2)
            this.stats[3].amount = parseFloat(balance.toString()).toFixed(2)
         }
         else{
          this.stats[0].amount = '0'
          this.stats[1].amount = '0'
          this.stats[2].amount = '0'
          this.stats[3].amount = '0'
          this.toastr.error("No Data Found");
         }
         this.apiservice.closeSpinner()
        })
  }

}

