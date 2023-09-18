import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { OnInit, AfterViewInit, ViewChild, Component } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import * as moment from 'moment';
import { catchError, first, tap } from 'rxjs/operators';
import { Observable } from 'rxjs'
import { ApiService } from 'app/service/api.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { TableUtil } from 'app/service/table_utils';
import { GenInvoice } from 'app/service/invoice_gen';
import { GenReport } from 'app/service/report_gen';

interface Booking {
  value: string;
  viewValue: string;
}

@Component({
    selector: 'app-product-bill',
    templateUrl: './product-bill.component.html',
    styleUrls: ['./product-bill.component.scss'],
    providers: [DatePipe]
  })

export class ProductBillComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;

  actualdata = [];
  data = [];
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

  today_date: any;
  displayedColumns: string[] = ['s_no','booking_no','booking_date','cus_name','product_name','product_qty','delivery_date','total'];
  printColumns: string[] = ['s_no','booking_no','booking_date','cus_name','product_name','product_qty','delivery_date','total'];
  head = [['S.No','Booking No','Booking Date','Customer Name', 'Delivery Date','Total']];
  ex_head = ['S.No','Booking No','Booking Date','Customer Name',  'Delivery Date','Total'];
  row_width = ['auto', 'auto','auto', '*', 'auto','auto']
  productValue = "0"
  all_products = []

  selectedValue = this.types[0].value;
  constructor(public httpClient: HttpClient, private router:Router,
    private apiservice: ApiService,private datePipe: DatePipe,private toastr: ToastrService,
    private geninvoice: GenInvoice,private genreport: GenReport,
    ) {
  }

  tablename= "";
  fulltablename = "Product Bill Report";
  exportcsv() {
    if(this.data.length != 0)
    TableUtil.generateReportExcel(this.dataSource.data,this.ex_head,this.displayedColumns, this.tablename,this.apiservice.shop_name);
    else alert("No Data")
  }

  exportpdf() {
    if(this.data.length != 0)
    this.genreport.productBillReportPDF(this.dataSource.data,this.fulltablename+" - "+this.tablename,this.ex_head,this.row_width,this.start_date,this.end_date)
    // TableUtil.exportPDF(
    //   this.dataSource.data,
    //   this.head,
    //   this.printColumns,
    //   this.apiservice.shop_name,
    //   this.tablename,
    //   'Sales Report'
    // );
    else alert("No Data")
  }

  ngOnInit(){
    if(navigator.onLine){
      this.form_status = false;
      this.today_date = new Date();
      this.today_date = this.datePipe.transform(this.today_date, 'dd/MM/yyyy');
      // console.log(this.today_date)

      var d = new Date();
      var to = d.setTime(d.getTime() - (d.getDay() ? d.getDay() : 7) * 24 * 60 * 60 * 1000);
      var from = d.setTime(d.getTime() - 6 * 24 * 60 * 60 * 1000);
      let unix_timestamp = to
      var fromdate = new Date(from);
      var todate = new Date(to);
      var year = fromdate.getFullYear();
      var month = fromdate.getMonth()+1;
      var datee = fromdate.getDate();
      var year1 = todate.getFullYear();
      var month1 = todate.getMonth()+1;
      var datee1 = todate.getDate();
      this.w_f_date = datee + '/' + month + '/' + year;
      this.w_l_date = datee1 + '/' + month1 + '/' + year1;

      var date = new Date();
      var firstDay = new Date(date.getFullYear(), date.getMonth()-1, 1);
      this.m_f_day = this.datePipe.transform(firstDay, 'dd/MM/yyyy');
      var lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
      this.m_l_day = this.datePipe.transform(lastDay, 'dd/MM/yyyy');
      this.tablename = this.types[0].viewValue
      this.loadProductData(this.apiservice.shop_id)
    }
    else {
        this.router.navigate(['/no-internet']);
    }
  }

  
  loadProductData(shop_id) {
    this.form_status = true
    this.apiservice.openSpinner()
    var allMenuURL = this.apiservice.serverProductsURL+"?sid="+shop_id
    this.httpClient.get(allMenuURL).subscribe(data => {
      // console.log(data['products'])
      if(data['products'] != null && data['products'].length != 0)
      {
        this.all_products = data['products'];
      }
      else{
        this.toastr.error("No Data Found");
      }
      this.form_status = false
      this.apiservice.closeSpinner()
      },
      error => {
        this.toastr.error("Check Intenet");
        // alert("Check Internet")
      });
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
  }

  getSelectProductValue()
  {
    // console.log(this.productValue)
  }

  StartDateEvent(dateval)
  {
    this.start_date = this.datePipe.transform(dateval.value, 'dd/MM/yyyy');
  }

  EndDateEvent(dateval)
  {
    this.end_date = this.datePipe.transform(dateval.value, 'dd/MM/yyyy');
  }

  getResults()
  {
    var start_unix = moment(this.start_date, 'DD/MM/YYYY').unix();
    var end_unix = moment(this.end_date, 'DD/MM/YYYY').unix();
    if(this.start_date != null && this.end_date != null)
    {
      if(start_unix > end_unix)
      {
        this.toastr.error("Start Date is Greater than End Date");
      }
      else{
        this.form_status = true;
        this.apiservice.openSpinner()
        this.dataSource = new MatTableDataSource();
        this.parameters = { 
          start_date:this.start_date , 
          end_date:this.end_date ,
          type: this.selectedValue,
          product_id:this.productValue,
          shop_id:this.apiservice.shop_id,
          };
          // console.log(this.parameters)
        this.apiservice
        .PostToServer('product_bill_report.php', this.parameters)
        .pipe(first())
        .subscribe(data => {
          // console.log(data)
          if(data['data'] != null)
          {
            this.data = data['data'];
            this.dataSource.data = this.data;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            // let total = 0, online_total= 0,cod_total = 0
            // for(let i=0;i<this.dataSource.data.length;i++)
            // {
            //   total = total + parseFloat(this.dataSource.data[i]['rounded_total'])
            // }
         }
         else{
          this.toastr.error("No Data Found");
         }
        this.form_status = false;
        this.apiservice.closeSpinner()
        });
      }
    }
    else{
      alert("Missing")
    }
  }

}

