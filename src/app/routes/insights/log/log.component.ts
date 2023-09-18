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

interface Sales {
  value: string;
  viewValue: string;
}

@Component({
    selector: 'app-log',
    templateUrl: './log.component.html',
    styleUrls: ['./log.component.scss'],
    providers: [DatePipe]
  })

export class LogComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;

  actualdata = [];
  data = [];
  dataSource: any;
  parameters: {};

  all_users = []

  form_status = false;
  custom_status = false;
  start_date: any;
  end_date: any;

  w_f_date: any;
  w_l_date: any;

  m_f_day: any;
  m_l_day: any;

  sales: Sales[] = [
    {value: 'daily', viewValue: 'Daily Sales'},
    {value: 'weekly', viewValue: 'Weekly Sales'},
    {value: 'monthly', viewValue: 'Monthly Sales'},
    {value: 'custom', viewValue: 'Custom Sales'}
  ];

  selectedValue = '';
  today_date: any;
  displayedColumns: string[] =  ['s_no','created_date','created_by','booking_no','total','reason','notes']
  printColumns: string[] = ['s_no','created_date','created_by','booking_no','total','reason','notes']
  head = [['S.No', 'Created Date','Created By','Booking No', 'Total','Reason','Notes']];
  ex_head = ['S.No', 'Created Date','Created By','Booking No', 'Total','Reason','Notes'];
  stats = [
    {
      title: 'Invoices',
      amount: '0',
      color: 'bg-purple-500',
    },
    {
      title: 'Sales (₹)',
      amount: '0',
      color: 'bg-purple-500',
    }
  ];

  constructor(public httpClient: HttpClient, private router:Router,
    private apiservice: ApiService,private datePipe: DatePipe,private toastr: ToastrService,
    private geninvoice: GenInvoice,
    ) {
  }

  tablename= "Log Report";

  exportcsv() {
    if(this.data.length != 0)
    TableUtil.generateReportExcel(this.dataSource.data,this.ex_head,this.displayedColumns, this.tablename,this.apiservice.shop_name);
    else alert("No Data")
  }

  exportpdf() {
    if(this.data.length != 0)
    TableUtil.exportPDF(
      this.dataSource.data,
      this.head,
      this.printColumns,
      this.apiservice.shop_name,
      this.tablename,
      'Log Report'
    );
    else alert("No Data")
  }

  ngOnInit(){
    if(navigator.onLine){
      this.form_status = false;
      this.today_date = new Date();
      this.today_date = this.datePipe.transform(this.today_date, 'dd/MM/yyyy');

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
      // console.log(w_f_date);
      // console.log(w_l_date)

      var date = new Date();
      var firstDay = new Date(date.getFullYear(), date.getMonth()-1, 1);
      this.m_f_day = this.datePipe.transform(firstDay, 'dd/MM/yyyy');
      var lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
      this.m_l_day = this.datePipe.transform(lastDay, 'dd/MM/yyyy');
      // console.log(m_f_day+"==="+m_l_day);

      this.sales[0].viewValue = "Daily Sales ("+this.today_date+")"
      this.sales[1].viewValue = "Weekly Sales ("+this.w_f_date +" - "+this.w_l_date+")"
      this.sales[2].viewValue = "Monthly Sales ("+this.m_f_day +" - "+this.m_l_day+")"

      this.loadUsersData(this.apiservice.shop_id);
    }
    else {
        this.router.navigate(['/no-internet']);
    }
  }

  loadUsersData(shop_id) {
    this.form_status = true;
    this.apiservice.openSpinner()
    var usersURL = this.apiservice.usersURL+"?sid="+shop_id
    this.httpClient.get(usersURL).subscribe(data => {
      if(data != null)
      {
        // console.log(data)
        this.actualdata = data['users'];
        this.all_users = this.actualdata;
        this.form_status = false;
     }
    else{
      this.form_status = false;
      this.toastr.error("No Data Found");
    }
    this.apiservice.closeSpinner()
    });
  }

  getSelectValue()
  {
    // console.log(this.selectedValue)
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
        this.apiservice.openSpinner()
        this.form_status = true;
        this.dataSource = new MatTableDataSource();
        this.parameters = { 
          start_date:this.start_date , 
          end_date:this.end_date ,
          user_id: this.selectedValue,
          shop_id:this.apiservice.shop_id,
          
          };
        this.apiservice
        .PostToServer('log_report.php', this.parameters)
        .pipe(first())
        .subscribe(data => {
          // console.log(data['data'])
          if(data['data'] != null)
          {
            this.data = data['data'];
            if(this.data.length != 0)
            {
              for(let i = 0;i<this.data.length;i++)
              {
                this.data[i].created_date = this.apiservice.changeDateTime(this.data[i].created_date)
              }
              this.dataSource.data = this.data;
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            }
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

