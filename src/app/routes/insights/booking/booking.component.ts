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
import { MatDatepicker } from '@angular/material/datepicker';
import { Moment } from 'moment';

interface Booking {
  value: string;
  viewValue: string;
}

@Component({
    selector: 'app-booking',
    templateUrl: './booking.component.html',
    styleUrls: ['./booking.component.scss'],
    providers: [DatePipe]
  })


export class BookingComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;

  @ViewChild(MatDatepicker) start: MatDatepicker<Moment>;
  @ViewChild(MatDatepicker) end: MatDatepicker<Moment>;

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

  selectedValue = this.types[0].value;
  today_date: any;
  displayedColumns: string[] = ['s_no','booking_date', 'booking_no','created_by','cus_name','cus_mobile','rounded_total','advance','balance','reference','paid_status','lap_days'];
  printColumns: string[] = ['s_no','booking_date', 'booking_no','created_by','cus_name','cus_mobile','rounded_total','advance','balance','reference','paid_status','lap_days'];
  head = [['S.No', 'Booking Date','Booking No','Booked By', 'Name','Contact', 'Total','Advance','Given','Balance','Reference','Status','Lap Days' ]];
  ex_head = ['S.No','Booking Date', 'Booking No','Booked By','Name','Contact', 'Total (₹)','Advance (₹)','Balance (₹)','Reference','Status','Lap Days'];
  row_width = ['auto', 'auto', 'auto', 'auto','auto','auto', 'auto','auto','auto','auto','auto','auto']

  stats = [
    {
      title: 'Estimates',
      amount: '0',
      color: 'bg-purple-500',
    },
    {
      title: 'Sales (₹)',
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

  constructor(public httpClient: HttpClient, private router:Router,
    private apiservice: ApiService,private datePipe: DatePipe,private toastr: ToastrService,
    private geninvoice: GenInvoice,private genreport: GenReport,
    ) {
  }

  tablename= "";
  fulltablename = "Booking Report";

  exportcsv() {
    if(this.data.length != 0)
    TableUtil.generateReportExcel(this.dataSource.data,this.ex_head,this.displayedColumns, this.tablename,this.apiservice.shop_name);
    else alert("No Data")
  }

  exportpdf() {
    if(this.data.length != 0)
    this.genreport.bookingReportPDF(this.dataSource.data,this.fulltablename+" - "+this.tablename,this.ex_head,this.row_width,this.start_date,this.end_date)
    // TableUtil.exportPDF(
    //   this.dataSource.data,
    //   this.head,
    //   this.printColumns,
    //   this.apiservice.shop_name,
    //   this.tablename,
    //   'Booking Report'
    // );
    else alert("No Data")
  }

  clearfilter() {
    this.selectedValue = null;
    // this.start.select(undefined);
    // this.end.select(undefined);
    if(this.dataSource != null)
    {
      this.dataSource.data = []
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    this.stats[0].amount = '0'
    this.stats[1].amount = '0'
    this.stats[2].amount = '0'
    this.stats[3].amount = '0'
    
  }

  ngOnInit(){
    if(navigator.onLine){
      this.form_status = false;
      this.today_date = new Date();
      this.today_date = this.datePipe.transform(this.today_date, 'yyyy/MM/dd');
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
    }
    else {
        this.router.navigate(['/no-internet']);
    }
  }

  getSelectValue()
  {
    let tablename =''
    for(let i =0;i < this.types.length;i++)
    {
      if(this.types[i].value == this.selectedValue)
      {
        this.stats[0].title = this.types[i].viewValue+"s"
        this.tablename = this.types[i].viewValue
      }
    }
    this.dataSource = []
    this.stats[0].amount = '0'
    this.stats[1].amount = '0'
    this.stats[2].amount = '0'
    this.stats[3].amount = '0'
  }

  StartDateEvent(dateval)
  {
    this.start_date = this.datePipe.transform(dateval.value, 'dd/MM/yyyy');
  }

  EndDateEvent(dateval)
  {
    this.end_date = this.datePipe.transform(dateval.value, 'dd/MM/yyyy');
  }

  orderidClicked(order_id,is_invoice)
  {
    this.form_status = true
    this.apiservice.openSpinner()
    if(is_invoice == 0)
    {
      var getInvoiceDetailsURL = this.apiservice.getEstimateDetailsURL+"?order_id="+order_id+"&shop_id="+this.apiservice.shop_id
    }
    else{
      var getInvoiceDetailsURL = this.apiservice.getInvoiceDetailsURL+"?order_id="+order_id+"&shop_id="+this.apiservice.shop_id
    }
    this.httpClient.get(getInvoiceDetailsURL).subscribe(data => {
      // console.log(data)
      if(data['details'] != null)
      {
        this.form_status = false
        // console.log(data)
        this.actualdata = data['details'];
        this.data = this.actualdata;
        if(data['shop_details'] != null)
        {
          if(is_invoice == 0)
          {
            this.geninvoice.genEstimatePDF(this.data,data['shop_details'],'view')
          }
          else{
            this.geninvoice.genInvoicePDF(this.data,data['shop_details'],'view')
          }
        }
        
    }
    else{
      this.form_status = false;
      this.toastr.error("No Data Found");
      // this.router.navigateByUrl('/invoices');
    }
    this.apiservice.closeSpinner()
    });
      // console.log(value)
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
        this.dataSource = new MatTableDataSource();
        this.parameters = { 
          start_date:this.start_date , 
          end_date:this.end_date ,
          type: this.selectedValue,
          shop_id:this.apiservice.shop_id,
          };
          // console.log(this.parameters)
          this.apiservice.openSpinner()
        this.apiservice
        .PostToServer('booking_report.php', this.parameters)
        .pipe(first())
        .subscribe(data => {
          if(data['data'] != null)
          {
            this.data = data['data'];
            console.log(data)
            this.dataSource.data = this.data;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            let total = 0, given= 0,balance = 0
            for(let i=0;i<this.dataSource.data.length;i++)
            {
              total = total + parseFloat(this.dataSource.data[i]['rounded_total'])
              given = parseFloat(this.dataSource.data[i]['advance'])
              balance = balance + parseFloat(this.dataSource.data[i]['balance'])

              const dateString = this.dataSource.data[i].delivery_date
              const deliveryDateParts = dateString.split('/');
              const deliveryDate = new Date(
                parseInt(deliveryDateParts[2]),
                parseInt(deliveryDateParts[1]) - 1,
                parseInt(deliveryDateParts[0])
              );

              const formattedTodayDate = this.datePipe.transform(this.today_date, 'yyyy-MM-dd');
              const endDate = new Date(formattedTodayDate);

              const daysDifference = daysBetweenDates(deliveryDate, endDate);
              this.dataSource.data[i]['lap_days'] = daysDifference;
            }
            function daysBetweenDates(date1: Date, date2: Date): number {
              const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
              const diffInMilliseconds = Math.abs(date1.getTime() - date2.getTime());
              const diffInDays = Math.round(diffInMilliseconds / oneDay);
              return diffInDays;
            }
                        

            this.stats[0].amount = this.dataSource.data.length
            this.stats[1].amount = parseFloat(total.toString()).toFixed(2)
            this.stats[2].amount = parseFloat(given.toString()).toFixed(2)
            this.stats[3].amount = parseFloat(balance.toString()).toFixed(2)
         }
         else{
          this.stats[0].amount = '0'
          this.stats[1].amount = '0'
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

